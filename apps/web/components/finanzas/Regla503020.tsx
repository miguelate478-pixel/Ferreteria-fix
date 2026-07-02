'use client';

import { useEffect, useState } from 'react';

// Regla 50/30/20:
// 50% → Necesidades (vivienda, alimentación, transporte, salud, servicios)
// 30% → Deseos (entretenimiento, ropa, salidas, suscripciones)
// 20% → Ahorro/inversión/deudas

const NECESIDADES_IDS = ['alimentacion', 'transporte', 'vivienda', 'salud', 'servicios', 'educacion'];
const DESEOS_IDS = ['entretenimiento', 'ropa', 'otros'];

function getMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface GastoItem { monto: number; categoria: string; }

// Mini arc SVG
function Arc({ pct, color, size = 100, label, amount }: {
  pct: number; color: string; size?: number; label: string; amount: string;
}) {
  const r = 38, cx = 50, cy = 50;
  const circ = Math.PI * r; // semicircle
  const dash = Math.min(1, pct / 100) * circ;
  return (
    <div className="fd-arc-wrap">
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 100 60`} aria-hidden="true">
        <path d={`M 12 50 A 38 38 0 0 1 88 50`} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" strokeLinecap="round" />
        <path d={`M 12 50 A 38 38 0 0 1 88 50`} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray .6s ease' }}
        />
        <text x="50" y="48" textAnchor="middle" fill={color} fontSize="14" fontWeight="700">{Math.round(pct)}%</text>
      </svg>
      <div className="fd-arc-label">{label}</div>
      <div className="fd-arc-amount">{amount}</div>
    </div>
  );
}

export function Regla503020() {
  const [ingreso, setIngreso] = useState('');
  const [savedIngreso, setSavedIngreso] = useState(0);
  const [editIngreso, setEditIngreso] = useState(false);
  const [gastos, setGastos] = useState<GastoItem[]>([]);

  useEffect(() => {
    const i = localStorage.getItem('ingreso_mensual');
    if (i) setSavedIngreso(Number(i));
    const g = localStorage.getItem(`gastos_${getMes()}`);
    if (g) setGastos(JSON.parse(g));
  }, []);

  const guardarIngreso = () => {
    const v = Number(ingreso);
    if (!v || v <= 0) return;
    setSavedIngreso(v);
    localStorage.setItem('ingreso_mensual', String(v));
    setEditIngreso(false);
  };

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const totalNecesidades = gastos
    .filter((g) => NECESIDADES_IDS.includes(g.categoria))
    .reduce((s, g) => s + g.monto, 0);
  const totalDeseos = gastos
    .filter((g) => DESEOS_IDS.includes(g.categoria))
    .reduce((s, g) => s + g.monto, 0);

  const meta50 = savedIngreso * 0.5;
  const meta30 = savedIngreso * 0.3;
  const meta20 = savedIngreso * 0.2;

  const pct50 = meta50 > 0 ? Math.min(100, (totalNecesidades / meta50) * 100) : 0;
  const pct30 = meta30 > 0 ? Math.min(100, (totalDeseos / meta30) * 100) : 0;
  const ahorroReal = savedIngreso > 0 ? Math.max(0, savedIngreso - totalGastos) : 0;
  const pct20 = meta20 > 0 ? Math.min(100, (ahorroReal / meta20) * 100) : 0;

  // Score de salud financiera 0-100
  const score = savedIngreso > 0
    ? Math.round(
        (Math.min(1, meta50 > 0 ? 1 - Math.max(0, totalNecesidades - meta50) / meta50 : 1) * 40) +
        (Math.min(1, meta30 > 0 ? 1 - Math.max(0, totalDeseos - meta30) / meta30 : 1) * 30) +
        (Math.min(1, meta20 > 0 ? ahorroReal / meta20 : 0) * 30)
      )
    : 0;

  const scoreColor = score >= 80 ? '#6bcb77' : score >= 50 ? '#ffd93d' : '#ff6b6b';
  const scoreLabel = score >= 80 ? 'Excelente' : score >= 60 ? 'Buenas' : score >= 40 ? 'En proceso' : 'Atención';

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">SALUD FINANCIERA</p>
          <h3 className="fin-card-title">Regla 50/30/20</h3>
        </div>
        {savedIngreso > 0 && (
          <button className="fin-btn-ghost" style={{ fontSize: 11 }} onClick={() => setEditIngreso((v) => !v)}>
            Ingreso: S/ {savedIngreso.toFixed(0)} ✎
          </button>
        )}
      </div>

      {/* Ingresar sueldo */}
      {(!savedIngreso || editIngreso) && (
        <div className="fin-form">
          <p className="fin-label">Ingreso mensual neto (lo que realmente recibes)</p>
          <div className="fin-row-gap">
            <input className="fin-input" type="number" min="0" placeholder="S/ Tu sueldo o ingreso"
              value={ingreso} onChange={(e) => setIngreso(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && guardarIngreso()} />
            <button className="fin-btn-primary" onClick={guardarIngreso}>Guardar</button>
            {editIngreso && <button className="fin-btn-ghost" onClick={() => setEditIngreso(false)}>Cancelar</button>}
          </div>
          <p className="fin-label" style={{ marginTop: 8 }}>
            La regla divide tu ingreso en: 50% necesidades, 30% deseos, 20% ahorro.
          </p>
        </div>
      )}

      {savedIngreso > 0 && (
        <>
          {/* Score */}
          <div className="fd-score-row">
            <div className="fd-score-circle" style={{ borderColor: scoreColor }}>
              <span className="fd-score-num" style={{ color: scoreColor }}>{score}</span>
              <small>/ 100</small>
            </div>
            <div>
              <b className="fd-score-label" style={{ color: scoreColor }}>{scoreLabel}</b>
              <p className="fd-score-desc">
                {score >= 80 ? 'Estás distribuyendo bien tu dinero. ¡Seguí así!' :
                 score >= 60 ? 'Vas bien, pequeños ajustes pueden mejorar tu balance.' :
                 score >= 40 ? 'Revisá tus gastos por categoría para optimizar.' :
                 'Tus gastos superan los límites recomendados. Revisá necesidades y deseos.'}
              </p>
            </div>
          </div>

          {/* Arcos de progreso */}
          <div className="fd-arcs-row">
            <Arc pct={pct50} color="#7c83fd" label="Necesidades" amount={`S/ ${totalNecesidades.toFixed(0)} / ${meta50.toFixed(0)}`} />
            <Arc pct={pct30} color="#ffd93d" label="Deseos" amount={`S/ ${totalDeseos.toFixed(0)} / ${meta30.toFixed(0)}`} />
            <Arc pct={pct20} color="#6bcb77" label="Ahorro" amount={`S/ ${ahorroReal.toFixed(0)} / ${meta20.toFixed(0)}`} />
          </div>

          {/* Detalle */}
          <div className="fd-503020-detail">
            {[
              { label: '50% Necesidades', meta: meta50, real: totalNecesidades, color: '#7c83fd', desc: 'Alquiler, comida, transporte, salud, servicios' },
              { label: '30% Deseos', meta: meta30, real: totalDeseos, color: '#ffd93d', desc: 'Entretenimiento, ropa, salidas, suscripciones' },
              { label: '20% Ahorro', meta: meta20, real: ahorroReal, color: '#6bcb77', desc: 'Lo que sobra después de todos los gastos' },
            ].map((row, i) => {
              const over = row.real > row.meta;
              return (
                <div key={i} className="fd-503020-row">
                  <div className="fd-503020-left">
                    <span className="fd-503020-label" style={{ color: row.color }}>{row.label}</span>
                    <span className="fd-503020-desc">{row.desc}</span>
                  </div>
                  <div className="fd-503020-right">
                    <div className="fd-503020-bar-wrap">
                      <div className="fd-503020-bar" style={{
                        width: `${Math.min(100, row.meta > 0 ? (row.real / row.meta) * 100 : 0)}%`,
                        background: over ? '#ff6b6b' : row.color,
                      }} />
                    </div>
                    <span className={over ? 'fd-503020-over' : 'fd-503020-ok'}>
                      {over ? `+S/ ${(row.real - row.meta).toFixed(2)} sobre el límite` : `S/ ${(row.meta - row.real).toFixed(2)} disponible`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="fin-result-note" style={{ margin: '0 20px 20px' }}>
            Basado en los gastos del mes actual. Las categorías "necesidades" incluyen alimentación, transporte, vivienda, salud y servicios. "Deseos" incluye entretenimiento, ropa y otros.
          </div>
        </>
      )}
    </div>
  );
}
