'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { GastosTracker } from '../../components/finanzas/GastosTracker';
import { PlanAhorro } from '../../components/finanzas/PlanAhorro';
import { CalculosLaborales } from '../../components/finanzas/CalculosLaborales';

type Section = 'dashboard' | 'gastos' | 'ahorro' | 'laboral';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMesLabel() {
  return new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
}

// ─── mini gráfico SVG de barras ───────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="fd-barchart">
      {data.map((d, i) => (
        <div key={i} className="fd-bar-col">
          <div
            className="fd-bar"
            style={{ height: `${(d.value / max) * 100}%`, background: d.color }}
            title={`${d.label}: S/ ${d.value.toFixed(2)}`}
          />
          <span className="fd-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── mini donut SVG ───────────────────────────────────────────────────────────

function Donut({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) {
  const r = 28, cx = 36, cy = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray .6s ease' }}
      />
    </svg>
  );
}

// ─── Dashboard overview ───────────────────────────────────────────────────────

function Dashboard({ onNavigate }: { onNavigate: (s: Section) => void }) {
  const mes = getMes();
  const [gastos, setGastos] = useState<Array<{ monto: number; categoria: string }>>([]);
  const [presupuesto, setPresupuesto] = useState(0);
  const [metas, setMetas] = useState<Array<{ nombre: string; objetivo: number; actual: number; color: string }>>([]);

  useEffect(() => {
    const g = localStorage.getItem(`gastos_${mes}`);
    if (g) setGastos(JSON.parse(g));
    const p = localStorage.getItem(`presupuesto_${mes}`);
    if (p) setPresupuesto(Number(p));
    const m = localStorage.getItem('plan_ahorro');
    if (m) setMetas(JSON.parse(m));
  }, [mes]);

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const totalAhorro = metas.reduce((s, m) => s + m.actual, 0);
  const totalObjetivo = metas.reduce((s, m) => s + m.objetivo, 0);
  const pctPresup = presupuesto > 0 ? Math.min(100, (totalGastos / presupuesto) * 100) : 0;
  const pctAhorro = totalObjetivo > 0 ? Math.min(100, (totalAhorro / totalObjetivo) * 100) : 0;

  const CATS = [
    { id: 'alimentacion', label: 'Alim.', color: '#68A56B' },
    { id: 'transporte', label: 'Trans.', color: '#5D8A9C' },
    { id: 'vivienda', label: 'Viv.', color: '#9A7D49' },
    { id: 'salud', label: 'Salud', color: '#A05070' },
    { id: 'servicios', label: 'Serv.', color: '#7060A0' },
    { id: 'otros', label: 'Otros', color: '#808080' },
  ];

  const barData = CATS.map((c) => ({
    label: c.label,
    value: gastos.filter((g) => g.categoria === c.id).reduce((s, g) => s + g.monto, 0),
    color: c.color,
  })).filter((d) => d.value > 0);

  return (
    <div className="fd-dashboard">
      <div className="fd-dash-header">
        <div>
          <p className="fd-eyebrow">RESUMEN</p>
          <h2 className="fd-dash-title">Buenos días 👋</h2>
          <p className="fd-dash-sub">{getMesLabel()}</p>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="fd-kpi-grid">
        <button className="fd-kpi-card fd-kpi-gastos" onClick={() => onNavigate('gastos')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Gastos del mes</span>
            <span className="fd-kpi-icon">↗</span>
          </div>
          <div className="fd-kpi-amount">S/ {totalGastos.toFixed(2)}</div>
          {presupuesto > 0 ? (
            <>
              <div className="fd-kpi-bar-wrap">
                <div className="fd-kpi-bar" style={{ width: `${pctPresup}%`, background: pctPresup > 90 ? '#ff6b6b' : pctPresup > 70 ? '#ffd93d' : '#6bcb77' }} />
              </div>
              <span className="fd-kpi-sub">{pctPresup.toFixed(0)}% del presupuesto · S/ {presupuesto.toFixed(2)}</span>
            </>
          ) : (
            <span className="fd-kpi-sub">Sin presupuesto definido</span>
          )}
        </button>

        <button className="fd-kpi-card fd-kpi-ahorro" onClick={() => onNavigate('ahorro')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Ahorro total</span>
            <span className="fd-kpi-icon">🎯</span>
          </div>
          <div className="fd-kpi-amount">S/ {totalAhorro.toFixed(2)}</div>
          {totalObjetivo > 0 ? (
            <>
              <div className="fd-kpi-bar-wrap">
                <div className="fd-kpi-bar" style={{ width: `${pctAhorro}%`, background: '#6bcb77' }} />
              </div>
              <span className="fd-kpi-sub">{pctAhorro.toFixed(0)}% de S/ {totalObjetivo.toFixed(2)} en {metas.length} meta{metas.length !== 1 ? 's' : ''}</span>
            </>
          ) : (
            <span className="fd-kpi-sub">Sin metas creadas</span>
          )}
        </button>

        <button className="fd-kpi-card fd-kpi-disponible" onClick={() => onNavigate('gastos')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Disponible</span>
            <span className="fd-kpi-icon">✓</span>
          </div>
          <div className="fd-kpi-amount" style={{ color: presupuesto > 0 && totalGastos > presupuesto ? '#ff6b6b' : '#6bcb77' }}>
            S/ {presupuesto > 0 ? (presupuesto - totalGastos).toFixed(2) : '—'}
          </div>
          <span className="fd-kpi-sub">{presupuesto > 0 ? `Resta del presupuesto de S/ ${presupuesto.toFixed(2)}` : 'Definí un presupuesto'}</span>
        </button>

        <button className="fd-kpi-card fd-kpi-laboral" onClick={() => onNavigate('laboral')}>
          <div className="fd-kpi-top">
            <span className="fd-kpi-label">Calculadora laboral</span>
            <span className="fd-kpi-icon">📋</span>
          </div>
          <div className="fd-kpi-amount" style={{ fontSize: 18 }}>CTS · Grati</div>
          <span className="fd-kpi-sub">Liquidación · Vacaciones</span>
        </button>
      </div>

      {/* ── gráfico + metas ── */}
      <div className="fd-dash-row">
        {/* gráfico de gastos */}
        <div className="fd-dash-panel">
          <div className="fd-panel-header">
            <span>Gastos por categoría</span>
            <button className="fd-panel-link" onClick={() => onNavigate('gastos')}>Ver todos →</button>
          </div>
          {barData.length > 0 ? (
            <BarChart data={barData} />
          ) : (
            <div className="fd-panel-empty">Sin gastos registrados este mes</div>
          )}
        </div>

        {/* metas de ahorro */}
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
                      <span>S/ {m.actual.toFixed(2)}</span>
                      <span>S/ {m.objetivo.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="fd-panel-empty">
              <button className="fd-empty-action" onClick={() => onNavigate('ahorro')}>+ Crear primera meta</button>
            </div>
          )}
        </div>
      </div>

      {/* ── accesos rápidos ── */}
      <div className="fd-quick-actions">
        <p className="fd-eyebrow" style={{ marginBottom: 12 }}>ACCESOS RÁPIDOS</p>
        <div className="fd-quick-grid">
          {[
            { icon: '➕', label: 'Registrar gasto', section: 'gastos' as Section },
            { icon: '🎯', label: 'Nueva meta de ahorro', section: 'ahorro' as Section },
            { icon: '💼', label: 'Calcular CTS', section: 'laboral' as Section },
            { icon: '📊', label: 'Ver gratificación', section: 'laboral' as Section },
          ].map((a) => (
            <button key={a.label} className="fd-quick-btn" onClick={() => onNavigate(a.section)}>
              <span className="fd-quick-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const NAV_ITEMS: Array<{ id: Section; icon: string; label: string }> = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'gastos',    icon: '💸', label: 'Gastos' },
  { id: 'ahorro',    icon: '🎯', label: 'Ahorro' },
  { id: 'laboral',   icon: '📋', label: 'Laboral' },
];

export default function FinanzasPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fd-shell">
      {/* ── sidebar ── */}
      <aside className={`fd-sidebar${menuOpen ? ' open' : ''}`}>
        <div className="fd-sidebar-brand">
          <span className="fd-brand-mark">₿</span>
          <div>
            <strong>Mis Finanzas</strong>
            <small>Perú · {new Date().getFullYear()}</small>
          </div>
        </div>

        <nav className="fd-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`fd-nav-item${section === item.id ? ' active' : ''}`}
              onClick={() => { setSection(item.id); setMenuOpen(false); }}
              aria-current={section === item.id ? 'page' : undefined}
            >
              <span className="fd-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="fd-sidebar-footer">
          <Link href="/" className="fd-back-link">← Ferretería</Link>
          <p className="fd-sidebar-note">Datos guardados solo en tu navegador</p>
        </div>
      </aside>

      {/* ── overlay móvil ── */}
      {menuOpen && <div className="fd-overlay" onClick={() => setMenuOpen(false)} />}

      {/* ── contenido principal ── */}
      <div className="fd-main">
        {/* topbar móvil */}
        <header className="fd-mobile-bar">
          <button className="fd-hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">☰</button>
          <span className="fd-mobile-title">
            {NAV_ITEMS.find((n) => n.id === section)?.label ?? 'Mis Finanzas'}
          </span>
          <span />
        </header>

        <div className="fd-content">
          {section === 'dashboard' && <Dashboard onNavigate={setSection} />}
          {section === 'gastos'    && <GastosTracker />}
          {section === 'ahorro'    && <PlanAhorro />}
          {section === 'laboral'   && <CalculosLaborales />}
        </div>

        <footer className="fd-footer-note">
          Cálculos referenciales · Legislación laboral peruana · Los datos no se envían a ningún servidor
        </footer>
      </div>
    </div>
  );
}
