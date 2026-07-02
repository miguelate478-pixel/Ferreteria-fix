'use client';

import { useEffect, useState } from 'react';

interface Meta {
  id: string;
  nombre: string;
  objetivo: number;
  actual: number;
  plazo: string; // YYYY-MM
  color: string;
}

const COLORES = ['#68705A', '#5D6872', '#9A5E49', '#C8A800', '#008080', '#9C5FBC'];

export function PlanAhorro() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [nombre, setNombre] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [plazo, setPlazo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [aporteMeta, setAporteMeta] = useState<string>('');
  const [aporteId, setAporteId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('plan_ahorro');
    if (saved) setMetas(JSON.parse(saved));
    // Plazo default: 6 meses desde hoy
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setPlazo(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }, []);

  const save = (m: Meta[]) => {
    setMetas(m);
    localStorage.setItem('plan_ahorro', JSON.stringify(m));
  };

  const agregar = () => {
    if (!nombre.trim() || !objetivo || Number(objetivo) <= 0) return;
    const meta: Meta = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      objetivo: Number(objetivo),
      actual: 0,
      plazo,
      color: COLORES[metas.length % COLORES.length],
    };
    save([...metas, meta]);
    setNombre(''); setObjetivo(''); setShowForm(false);
  };

  const eliminar = (id: string) => save(metas.filter((m) => m.id !== id));

  const abonar = (id: string) => {
    const v = Number(aporteMeta);
    if (!v || v <= 0) return;
    save(metas.map((m) => m.id === id ? { ...m, actual: Math.min(m.objetivo, m.actual + v) } : m));
    setAporteId(null); setAporteMeta('');
  };

  const mesesRestantes = (plazo: string) => {
    const [y, mo] = plazo.split('-').map(Number);
    const hoy = new Date();
    return Math.max(0, (y - hoy.getFullYear()) * 12 + (mo - (hoy.getMonth() + 1)));
  };

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">PLAN DE AHORRO</p>
          <h3 className="fin-card-title">Mis metas</h3>
        </div>
        <button className="fin-btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Nueva meta'}
        </button>
      </div>

      {showForm && (
        <div className="fin-form">
          <div className="fin-form-grid">
            <input
              className="fin-input"
              placeholder="Nombre de la meta (ej. Viaje, Emergencia…)"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              aria-label="Nombre de la meta"
            />
            <input
              className="fin-input fin-input-sm"
              type="number"
              min="0"
              placeholder="S/ Objetivo"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              aria-label="Monto objetivo"
            />
            <label className="fin-label-inline">
              Plazo
              <input
                type="month"
                className="fin-input fin-input-sm"
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
                aria-label="Fecha límite"
              />
            </label>
            <button className="fin-btn-primary" onClick={agregar}>Crear meta</button>
          </div>
        </div>
      )}

      {metas.length === 0 && (
        <p className="fin-empty">No tenés metas de ahorro. ¡Creá tu primera!</p>
      )}

      <div className="fin-metas-grid">
        {metas.map((m) => {
          const pct = Math.min(100, (m.actual / m.objetivo) * 100);
          const meses = mesesRestantes(m.plazo);
          const porMes = meses > 0 ? (m.objetivo - m.actual) / meses : 0;
          const completada = m.actual >= m.objetivo;

          return (
            <div key={m.id} className="fin-meta-card">
              <div className="fin-meta-top">
                <div className="fin-meta-dot" style={{ background: m.color }} />
                <div className="fin-meta-info">
                  <b>{m.nombre}</b>
                  <small>{completada ? '✓ Completada' : `${meses} mes${meses !== 1 ? 'es' : ''} restante${meses !== 1 ? 's' : ''}`}</small>
                </div>
                <button className="fin-del-btn" onClick={() => eliminar(m.id)} aria-label="Eliminar meta">×</button>
              </div>

              <div className="fin-meta-progress-wrap">
                <div className="fin-meta-progress-bar" style={{ width: `${pct}%`, background: m.color }} />
              </div>

              <div className="fin-meta-nums">
                <span>S/ {m.actual.toFixed(2)} ahorrado</span>
                <strong>S/ {m.objetivo.toFixed(2)}</strong>
              </div>

              {!completada && porMes > 0 && (
                <p className="fin-meta-sugerencia">
                  Ahorrá S/ {porMes.toFixed(2)}/mes para llegar a tiempo
                </p>
              )}
              {!completada && porMes === 0 && meses === 0 && (
                <p className="fin-meta-sugerencia" style={{ color: '#ff6b6b' }}>
                  ⚠ El plazo venció. Extendé la fecha o aportá lo que puedas.
                </p>
              )}

              {aporteId === m.id ? (
                <div className="fin-row-gap" style={{ marginTop: 10 }}>
                  <input
                    className="fin-input fin-input-sm"
                    type="number"
                    min="0"
                    placeholder="S/ Aporte"
                    value={aporteMeta}
                    onChange={(e) => setAporteMeta(e.target.value)}
                    aria-label="Monto del aporte"
                  />
                  <button className="fin-btn-primary" onClick={() => abonar(m.id)}>Abonar</button>
                  <button className="fin-btn-ghost" onClick={() => setAporteId(null)}>×</button>
                </div>
              ) : (
                !completada && (
                  <button
                    className="fin-btn-ghost"
                    style={{ marginTop: 10, width: '100%' }}
                    onClick={() => setAporteId(m.id)}
                  >
                    + Registrar aporte
                  </button>
                )
              )}

              {completada && (
                <div className="fin-meta-completada">🎉 ¡Meta alcanzada!</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
