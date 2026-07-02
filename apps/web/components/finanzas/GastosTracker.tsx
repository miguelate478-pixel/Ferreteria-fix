'use client';

import { useEffect, useState } from 'react';

const CATEGORIAS = [
  { id: 'alimentacion', label: 'Alimentación', emoji: '🍽️' },
  { id: 'transporte', label: 'Transporte', emoji: '🚌' },
  { id: 'vivienda', label: 'Vivienda / Alquiler', emoji: '🏠' },
  { id: 'salud', label: 'Salud', emoji: '💊' },
  { id: 'educacion', label: 'Educación', emoji: '📚' },
  { id: 'entretenimiento', label: 'Entretenimiento', emoji: '🎬' },
  { id: 'ropa', label: 'Ropa', emoji: '👕' },
  { id: 'servicios', label: 'Servicios (luz/agua/internet)', emoji: '💡' },
  { id: 'otros', label: 'Otros', emoji: '📦' },
];

interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
}

function getMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function GastosTracker() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [desc, setDesc] = useState('');
  const [monto, setMonto] = useState('');
  const [cat, setCat] = useState('alimentacion');
  const [presupuesto, setPresupuesto] = useState('');
  const [editPres, setEditPres] = useState(false);
  const [mes, setMes] = useState(getMes());

  // Persistencia en localStorage — carga los gastos del mes seleccionado
  useEffect(() => {
    const saved = localStorage.getItem(`gastos_${mes}`);
    setGastos(saved ? JSON.parse(saved) : []);
    const pres = localStorage.getItem(`presupuesto_${mes}`);
    setPresupuesto(pres ?? '');
  }, [mes]);

  const save = (g: Gasto[]) => {
    setGastos(g);
    localStorage.setItem(`gastos_${mes}`, JSON.stringify(g));
  };

  const agregar = () => {
    if (!desc.trim() || !monto || isNaN(Number(monto)) || Number(monto) <= 0) return;
    const nuevo: Gasto = {
      id: Date.now().toString(),
      descripcion: desc.trim(),
      monto: Number(monto),
      categoria: cat,
      fecha: new Date().toLocaleDateString('es-PE'),
    };
    save([...gastos, nuevo]);
    setDesc(''); setMonto('');
  };

  const eliminar = (id: string) => save(gastos.filter((g) => g.id !== id));

  const total = gastos.reduce((s, g) => s + g.monto, 0);
  const pres = Number(presupuesto) || 0;
  const porcentaje = pres > 0 ? Math.min(100, (total / pres) * 100) : 0;

  const porCategoria = CATEGORIAS.map((c) => ({
    ...c,
    total: gastos.filter((g) => g.categoria === c.id).reduce((s, g) => s + g.monto, 0),
  })).filter((c) => c.total > 0).sort((a, b) => b.total - a.total);

  const guardarPresupuesto = () => {
    localStorage.setItem(`presupuesto_${mes}`, presupuesto);
    setEditPres(false);
  };

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">GASTOS DEL MES</p>
          <h3 className="fin-card-title">Registro mensual</h3>
        </div>
        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="fin-month-input"
          aria-label="Mes a registrar"
        />
      </div>

      {/* Barra de presupuesto */}
      <div className="fin-budget-row">
        {editPres ? (
          <div className="fin-budget-edit">
            <label className="fin-label">Presupuesto del mes (S/)</label>
            <div className="fin-row-gap">
              <input
                className="fin-input"
                type="number"
                min="0"
                placeholder="0.00"
                value={presupuesto}
                onChange={(e) => setPresupuesto(e.target.value)}
                aria-label="Presupuesto mensual"
              />
              <button className="fin-btn-primary" onClick={guardarPresupuesto}>Guardar</button>
              <button className="fin-btn-ghost" onClick={() => setEditPres(false)}>Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="fin-budget-display">
            <div className="fin-budget-nums">
              <span>
                <strong className="fin-amount">S/ {total.toFixed(2)}</strong>
                <small> gastado</small>
              </span>
              {pres > 0 && (
                <span className="fin-budget-limit">
                  de S/ {pres.toFixed(2)} presupuestado
                  <button className="fin-edit-link" onClick={() => setEditPres(true)}>Editar</button>
                </span>
              )}
              {pres === 0 && (
                <button className="fin-edit-link" onClick={() => setEditPres(true)}>+ Definir presupuesto</button>
              )}
            </div>
            {pres > 0 && (
              <div className="fin-progress-wrap">
                <div
                  className="fin-progress-bar"
                  style={{
                    width: `${porcentaje}%`,
                    background: porcentaje > 90 ? '#9a2020' : porcentaje > 70 ? '#a07020' : 'var(--accent)',
                  }}
                />
              </div>
            )}
            {pres > 0 && (
              <p className="fin-budget-note">
                {porcentaje >= 100
                  ? '⚠ Superaste el presupuesto'
                  : `Quedan S/ ${(pres - total).toFixed(2)} (${(100 - porcentaje).toFixed(0)}%)`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Formulario agregar gasto */}
      <div className="fin-form">
        <p className="fin-label">Agregar gasto</p>
        <div className="fin-form-grid">
          <input
            className="fin-input"
            placeholder="Descripción…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregar()}
            aria-label="Descripción del gasto"
          />
          <input
            className="fin-input fin-input-sm"
            type="number"
            min="0"
            step="0.01"
            placeholder="S/ Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && agregar()}
            aria-label="Monto del gasto"
          />
          <select
            className="fin-select"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            aria-label="Categoría"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
            ))}
          </select>
          <button className="fin-btn-primary" onClick={agregar}>+ Agregar</button>
        </div>
      </div>

      {/* Lista de gastos */}
      {gastos.length > 0 ? (
        <div className="fin-list">
          {[...gastos].reverse().map((g) => {
            const cat = CATEGORIAS.find((c) => c.id === g.categoria);
            return (
              <div key={g.id} className="fin-list-row">
                <span className="fin-cat-emoji">{cat?.emoji}</span>
                <div className="fin-list-info">
                  <b>{g.descripcion}</b>
                  <small>{cat?.label} · {g.fecha}</small>
                </div>
                <strong className="fin-list-amount">S/ {g.monto.toFixed(2)}</strong>
                <button
                  className="fin-del-btn"
                  onClick={() => eliminar(g.id)}
                  aria-label={`Eliminar ${g.descripcion}`}
                >×</button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="fin-empty">Aún no registraste gastos este mes.</p>
      )}

      {/* Distribución por categoría */}
      {porCategoria.length > 0 && (
        <div className="fin-breakdown">
          <p className="fin-label">Distribución por categoría</p>
          {porCategoria.map((c) => (
            <div key={c.id} className="fin-break-row">
              <span>{c.emoji} {c.label}</span>
              <div className="fin-break-bar-wrap">
                <div
                  className="fin-break-bar"
                  style={{ width: `${(c.total / total) * 100}%` }}
                />
              </div>
              <span className="fin-break-pct">{((c.total / total) * 100).toFixed(0)}%</span>
              <strong>S/ {c.total.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
