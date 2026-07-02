'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GastosTracker } from '../../components/finanzas/GastosTracker';
import { PlanAhorro } from '../../components/finanzas/PlanAhorro';
import { CalculosLaborales } from '../../components/finanzas/CalculosLaborales';
import { Deudas } from '../../components/finanzas/Deudas';
import { Recordatorios } from '../../components/finanzas/Recordatorios';
import { Regla503020 } from '../../components/finanzas/Regla503020';
import { HistorialMensual } from '../../components/finanzas/HistorialMensual';

type Section = 'dashboard' | 'gastos' | 'ahorro' | 'deudas' | 'recordatorios' | 'salud' | 'historial' | 'laboral';

function getMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── gráfico de barras mini ───────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="fd-barchart">
      {data.map((d, i) => (
        <div key={i} className="fd-bar-col">
          <span className="fd-bar-tip">S/{(d.value/1000).toFixed(1)}k</span>
          <div className="fd-bar" style={{ height: `${(d.value / max) * 100}%`, background: d.color }}
            title={`${d.label}: S/ ${d.value.toFixed(2)}`} />
          <span className="fd-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Salud score ring ─────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 28, circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#6bcb77' : score >= 50 ? '#ffd93d' : '#ff6b6b';
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={`${(score / 100) * circ} ${circ}`}
        strokeLinecap="round" transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray .6s ease' }} />
      <text x="36" y="40" textAnchor="middle" fill={color} fontSize="14" fontWeight="700">{score}</text>
    </svg>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const mes = getMes();
  const hoy = new Date();

  const [gastos, setGastos] = useState<Array<{ monto: number; categoria: string }>>([]);
  const [presupuesto, setPresupuesto] = useState(0);
  const [ingreso, setIngreso] = useState(0);
  const [metas, setMetas] = useState<Array<{ nombre: string; objetivo: number; actual: number; color: string }>>([]);
  const [deudas, setDeudas] = useState<Array<{ montoTotal: number; montoPagado: number; cuotaMensual: number; diaPago: number }>>([]);
  const [recs, setRecs] = useState<Array<{ titulo: string; monto: number; dia: number; completadoMes: string }>>([]);

  useEffect(() => {
    const g = localStorage.getItem(`gastos_${mes}`); if (g) setGastos(JSON.parse(g));
    const p = localStorage.getItem(`presupuesto_${mes}`); if (p) setPresupuesto(Number(p));
    const i = localStorage.getItem('ingreso_mensual'); if (i) setIngreso(Number(i));
    const m = localStorage.getItem('plan_ahorro'); if (m) setMetas(JSON.parse(m));
    const d = localStorage.getItem('deudas'); if (d) setDeudas(JSON.parse(d));
    const r = localStorage.getItem('recordatorios'); if (r) setRecs(JSON.parse(r));
  }, [mes]);

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const totalAhorro = metas.reduce((s, m) => s + m.actual, 0);
  const totalDeuda = deudas.reduce((s, d) => s + (d.montoTotal - d.montoPagado), 0);
  const cuotasMes = deudas.filter((d) => d.montoPagado < d.montoTotal).reduce((s, d) => s + d.cuotaMensual, 0);
  const disponible = ingreso > 0 ? Math.max(0, ingreso - totalGastos) : presupuesto > 0 ? Math.max(0, presupuesto - totalGastos) : 0;
  const pctPresup = presupuesto > 0 ? Math.min(100, (totalGastos / presupuesto) * 100) : 0;
  const hoyNum = hoy.getDate();

  // Recordatorios próximos (3 días)
  const recsPendientes = recs.filter((r) => r.completadoMes !== mes)
    .filter((r) => Math.abs(r.dia - hoyNum) <= 3 || (r.dia < hoyNum && r.dia >= hoyNum - 3))
    .sort((a, b) => a.dia - b.dia)
    .slice(0, 3);

  // Score salud financiera
  const NECES_IDS = ['alimentacion', 'transporte', 'vivienda', 'salud', 'servicios', 'educacion'];
  const DESEOS_IDS = ['entretenimiento', 'ropa', 'otros'];
  const nec = gastos.filter((g) => NECES_IDS.includes(g.categoria)).reduce((s, g) => s + g.monto, 0);
  const des = gastos.filter((g) => DESEOS_IDS.includes(g.categoria)).reduce((s, g) => s + g.monto, 0);
  const meta50 = ingreso * .5, meta30 = ingreso * .3, meta20 = ingreso * .2;
  const score = ingreso > 0
    ? Math.round(
        Math.min(1, meta50 > 0 ? 1 - Math.max(0, nec - meta50) / meta50 : 1) * 40 +
        Math.min(1, meta30 > 0 ? 1 - Math.max(0, des - meta30) / meta30 : 1) * 30 +
        Math.min(1, meta20 > 0 ? disponible / meta20 : 0) * 30)
    : 0;

  const CATS = [
    { id: 'alimentacion', label: 'Alim', color: '#68A56B' },
    { id: 'transporte',   label: 'Trans', color: '#5D8A9C' },
    { id: 'vivienda',     label: 'Vivien', color: '#9A7D49' },
    { id: 'salud',        label: 'Salud', color: '#A05070' },
    { id: 'servicios',    label: 'Serv', color: '#7060A0' },
    { id: 'entretenim',   label: 'Entr', color: '#C08040' },
    { id: 'otros',        label: 'Otros', color: '#606060' },
  ];
  const barData = CATS.map((c) => ({
    label: c.label,
    value: gastos.filter((g) => g.categoria === c.id || (c.id === 'entretenim' && g.categoria === 'entretenimiento')).reduce((s, g) => s + g.monto, 0),
    color: c.color,
  })).filter((d) => d.value > 0);

  const mesLabel = hoy.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const saludo = hoy.getHours() < 12 ? 'Buenos días' : hoy.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="fd-dashboard">
      {/* Header */}
      <div className="fd-dash-header">
        <div>
          <p className="fd-eyebrow">DASHBOARD · {mesLabel.toUpperCase()}</p>
          <h2 className="fd-dash-title">{saludo} 👋</h2>
        </div>
        {ingreso > 0 && (
          <div className="fd-income-badge">
            <span>Ingreso registrado</span>
            <strong>S/ {ingreso.toFixed(2)}</strong>
          </div>
        )}
      </div>

      {/* KPI grid principal */}
      <div className="fd-kpi-grid">
        <button className="fd-kpi-card" onClick={() => onNavigate('gastos')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Gastos del mes</span>
            <span style={{ fontSize: 20 }}>💸</span>
          </div>
          <div className="fd-kpi-amount">S/ {totalGastos.toFixed(2)}</div>
          {presupuesto > 0 && (
            <>
              <div className="fd-kpi-bar-wrap">
                <div className="fd-kpi-bar" style={{ width: `${pctPresup}%`, background: pctPresup > 90 ? '#ff6b6b' : pctPresup > 70 ? '#ffd93d' : '#6bcb77' }} />
              </div>
              <span className="fd-kpi-sub">{pctPresup.toFixed(0)}% de S/ {presupuesto.toFixed(2)}</span>
            </>
          )}
          {!presupuesto && <span className="fd-kpi-sub">Sin presupuesto definido</span>}
        </button>

        <button className="fd-kpi-card" onClick={() => onNavigate('gastos')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Disponible</span>
            <span style={{ fontSize: 20 }}>✅</span>
          </div>
          <div className="fd-kpi-amount" style={{ color: disponible === 0 && (ingreso > 0 || presupuesto > 0) ? '#ff6b6b' : '#6bcb77' }}>
            {ingreso > 0 || presupuesto > 0 ? `S/ ${disponible.toFixed(2)}` : '—'}
          </div>
          <span className="fd-kpi-sub">{ingreso > 0 ? 'del ingreso mensual' : presupuesto > 0 ? 'del presupuesto' : 'Registrá tu ingreso'}</span>
        </button>

        <button className="fd-kpi-card" onClick={() => onNavigate('ahorro')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Ahorro acumulado</span>
            <span style={{ fontSize: 20 }}>🎯</span>
          </div>
          <div className="fd-kpi-amount" style={{ color: '#6bcb77' }}>S/ {totalAhorro.toFixed(2)}</div>
          <span className="fd-kpi-sub">{metas.length} meta{metas.length !== 1 ? 's' : ''}</span>
        </button>

        <button className="fd-kpi-card" onClick={() => onNavigate('deudas')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Deuda pendiente</span>
            <span style={{ fontSize: 20 }}>💳</span>
          </div>
          <div className="fd-kpi-amount" style={{ color: totalDeuda > 0 ? '#ff6b6b' : '#6bcb77' }}>
            {totalDeuda > 0 ? `S/ ${totalDeuda.toFixed(2)}` : '✓ Sin deudas'}
          </div>
          {cuotasMes > 0 && <span className="fd-kpi-sub">S/ {cuotasMes.toFixed(2)}/mes en cuotas</span>}
        </button>
      </div>

      {/* Segunda fila: gráfico + salud + alertas */}
      <div className="fd-dash-row3">
        {/* Gastos por categoría */}
        <div className="fd-dash-panel fd-panel-wide">
          <div className="fd-panel-header">
            <span>Gastos por categoría</span>
            <button className="fd-panel-link" onClick={() => onNavigate('gastos')}>Ver detalle →</button>
          </div>
          {barData.length > 0 ? <BarChart data={barData} /> : <div className="fd-panel-empty">Sin gastos este mes</div>}
        </div>

        {/* Salud financiera */}
        <div className="fd-dash-panel">
          <div className="fd-panel-header">
            <span>Salud financiera</span>
            <button className="fd-panel-link" onClick={() => onNavigate('salud')}>Ver 50/30/20 →</button>
          </div>
          <div className="fd-health-content">
            <ScoreRing score={score} />
            <div>
              <div className="fd-health-label" style={{ color: score >= 80 ? '#6bcb77' : score >= 50 ? '#ffd93d' : '#ff6b6b' }}>
                {score >= 80 ? 'Excelente' : score >= 60 ? 'Buenas finanzas' : score >= 40 ? 'En proceso' : 'Atención'}
              </div>
              <p className="fd-health-sub">
                {ingreso > 0
                  ? `Basado en tu ingreso de S/ ${ingreso.toFixed(0)}`
                  : 'Registrá tu ingreso para activar'}
              </p>
              {ingreso === 0 && (
                <button className="fd-empty-action" style={{ marginTop: 8, fontSize: 11 }}
                  onClick={() => onNavigate('salud')}>Activar →</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tercera fila: metas + recordatorios */}
      <div className="fd-dash-row2">
        {/* Metas de ahorro */}
        <div className="fd-dash-panel">
          <div className="fd-panel-header">
            <span>Metas de ahorro</span>
            <button className="fd-panel-link" onClick={() => onNavigate('ahorro')}>Gestionar →</button>
          </div>
          {metas.length > 0 ? (
            <div className="fd-metas-mini">
              {metas.slice(0, 4).map((m, i) => {
                const pct = Math.min(100, (m.actual / m.objetivo) * 100);
                return (
                  <div key={i} className="fd-meta-mini-row">
                    <div className="fd-meta-mini-top">
                      <span>{m.nombre}</span>
                      <span className="fd-meta-mini-pct">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="fd-mini-bar-wrap">
                      <div className="fd-mini-bar" style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                    <div className="fd-meta-mini-nums">
                      <span>S/ {m.actual.toFixed(0)}</span>
                      <span>S/ {m.objetivo.toFixed(0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="fd-panel-empty">
              <button className="fd-empty-action" onClick={() => onNavigate('ahorro')}>+ Primera meta</button>
            </div>
          )}
        </div>

        {/* Recordatorios próximos */}
        <div className="fd-dash-panel">
          <div className="fd-panel-header">
            <span>Próximos vencimientos</span>
            <button className="fd-panel-link" onClick={() => onNavigate('recordatorios')}>Ver todos →</button>
          </div>
          {recsPendientes.length > 0 ? (
            <div className="fd-alert-list">
              {recsPendientes.map((r, i) => {
                const dias = r.dia - hoyNum;
                return (
                  <div key={i} className={`fd-alert-row${dias <= 0 ? ' urgente' : dias <= 2 ? ' pronto' : ''}`}>
                    <span className="fd-alert-dia">Día {r.dia}</span>
                    <span className="fd-alert-titulo">{r.titulo}</span>
                    {r.monto > 0 && <span className="fd-alert-monto">S/ {r.monto.toFixed(0)}</span>}
                    <span className="fd-alert-tag">
                      {dias < 0 ? '⚠ Vencido' : dias === 0 ? '⚠ Hoy' : `${dias}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="fd-panel-empty">
              {recs.length === 0
                ? <button className="fd-empty-action" onClick={() => onNavigate('recordatorios')}>+ Agregar vencimientos</button>
                : <span style={{ color: 'var(--fd-green)', fontSize: 12 }}>✓ Sin vencimientos próximos</span>
              }
            </div>
          )}
        </div>

        {/* Regla 50/30/20 resumen */}
        {ingreso > 0 && (
          <div className="fd-dash-panel">
            <div className="fd-panel-header">
              <span>Distribución 50/30/20</span>
              <button className="fd-panel-link" onClick={() => onNavigate('salud')}>Detalle →</button>
            </div>
            <div className="fd-503020-mini">
              {[
                { label: '50% Necesidades', meta: ingreso * .5, real: nec, color: '#7c83fd' },
                { label: '30% Deseos', meta: ingreso * .3, real: des, color: '#ffd93d' },
                { label: '20% Ahorro', meta: ingreso * .2, real: disponible, color: '#6bcb77' },
              ].map((row, i) => {
                const pct = row.meta > 0 ? Math.min(100, (row.real / row.meta) * 100) : 0;
                const over = row.real > row.meta;
                return (
                  <div key={i} className="fd-503020-mini-row">
                    <span style={{ color: row.color, fontSize: 10, width: 110, flexShrink: 0 }}>{row.label}</span>
                    <div className="fd-mini-bar-wrap" style={{ flex: 1 }}>
                      <div className="fd-mini-bar" style={{ width: `${pct}%`, background: over ? '#ff6b6b' : row.color }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--fd-muted)', width: 70, textAlign: 'right' }}>
                      S/ {row.real.toFixed(0)} / {row.meta.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS: Array<{ id: Section; icon: string; label: string; group?: string }> = [
  { id: 'dashboard',     icon: '⊞', label: 'Dashboard' },
  { id: 'gastos',        icon: '💸', label: 'Gastos', group: 'SEGUIMIENTO' },
  { id: 'ahorro',        icon: '🎯', label: 'Ahorro' },
  { id: 'deudas',        icon: '💳', label: 'Deudas' },
  { id: 'recordatorios', icon: '🔔', label: 'Recordatorios' },
  { id: 'salud',         icon: '📊', label: 'Salud 50/30/20', group: 'ANÁLISIS' },
  { id: 'historial',     icon: '📈', label: 'Historial' },
  { id: 'laboral',       icon: '🧮', label: 'CTS / Grati / Liq.', group: 'LABORAL' },
];

export default function FinanzasPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fd-shell">
      <aside className={`fd-sidebar${menuOpen ? ' open' : ''}`}>
        <div className="fd-sidebar-brand">
          <span className="fd-brand-mark">₿</span>
          <div><strong>Mis Finanzas</strong><small>Perú · {new Date().getFullYear()}</small></div>
        </div>
        <nav className="fd-sidebar-nav">
          {NAV_ITEMS.map((item, i) => (
            <div key={item.id}>
              {item.group && (i === 0 || NAV_ITEMS[i - 1]?.group !== item.group) && (
                <p className="fd-nav-group">{item.group}</p>
              )}
              <button
                className={`fd-nav-item${section === item.id ? ' active' : ''}`}
                onClick={() => { setSection(item.id); setMenuOpen(false); }}
                aria-current={section === item.id ? 'page' : undefined}
              >
                <span className="fd-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
        <div className="fd-sidebar-footer">
          <Link href="/" className="fd-back-link">← Ferretería</Link>
          <p className="fd-sidebar-note">Solo en tu navegador · Sin cuentas</p>
        </div>
      </aside>

      {menuOpen && <div className="fd-overlay" onClick={() => setMenuOpen(false)} />}

      <div className="fd-main">
        <header className="fd-mobile-bar">
          <button className="fd-hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">☰</button>
          <span className="fd-mobile-title">{NAV_ITEMS.find((n) => n.id === section)?.label}</span>
          <span />
        </header>
        <div className="fd-content">
          {section === 'dashboard'     && <Dashboard onNavigate={setSection} />}
          {section === 'gastos'        && <GastosTracker />}
          {section === 'ahorro'        && <PlanAhorro />}
          {section === 'deudas'        && <Deudas />}
          {section === 'recordatorios' && <Recordatorios />}
          {section === 'salud'         && <Regla503020 />}
          {section === 'historial'     && <HistorialMensual />}
          {section === 'laboral'       && <CalculosLaborales />}
        </div>
        <footer className="fd-footer-note">
          Cálculos referenciales · Legislación peruana · Sin servidores · Datos locales
        </footer>
      </div>
    </div>
  );
}
