'use client';

import { useEffect, useState } from 'react';

interface Recordatorio {
  id: string;
  titulo: string;
  monto: number;
  dia: number;      // 1-31
  categoria: string;
  repetir: boolean; // mensual
  completadoMes: string; // YYYY-MM si ya lo marcó
}

const CATEGORIAS_REC = [
  { id: 'alquiler', label: 'Alquiler', emoji: '🏠' },
  { id: 'servicios', label: 'Servicios', emoji: '💡' },
  { id: 'suscripcion', label: 'Suscripción', emoji: '📺' },
  { id: 'cuota', label: 'Cuota/préstamo', emoji: '💳' },
  { id: 'seguro', label: 'Seguro', emoji: '🛡️' },
  { id: 'otros', label: 'Otros', emoji: '📌' },
];

function getMes() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function Recordatorios() {
  const [recs, setRecs] = useState<Recordatorio[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', monto: '', dia: '5', categoria: 'alquiler', repetir: true });

  useEffect(() => {
    const r = localStorage.getItem('recordatorios');
    if (r) setRecs(JSON.parse(r));
  }, []);

  const save = (r: Recordatorio[]) => { setRecs(r); localStorage.setItem('recordatorios', JSON.stringify(r)); };

  const agregar = () => {
    if (!form.titulo.trim()) return;
    save([...recs, {
      id: Date.now().toString(),
      titulo: form.titulo.trim(),
      monto: Number(form.monto) || 0,
      dia: Number(form.dia),
      categoria: form.categoria,
      repetir: form.repetir,
      completadoMes: '',
    }]);
    setForm({ titulo: '', monto: '', dia: '5', categoria: 'alquiler', repetir: true });
    setShowForm(false);
  };

  const toggleCompletado = (id: string) => {
    const mes = getMes();
    save(recs.map((r) => r.id === id
      ? { ...r, completadoMes: r.completadoMes === mes ? '' : mes }
      : r));
  };

  const eliminar = (id: string) => save(recs.filter((r) => r.id !== id));

  const mes = getMes();
  const hoy = new Date().getDate();

  const pendientes = recs
    .filter((r) => r.completadoMes !== mes)
    .sort((a, b) => {
      const da = a.dia >= hoy ? a.dia : a.dia + 31;
      const db = b.dia >= hoy ? b.dia : b.dia + 31;
      return da - db;
    });

  const completados = recs.filter((r) => r.completadoMes === mes);
  const totalPendiente = pendientes.reduce((s, r) => s + r.monto, 0);

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">RECORDATORIOS DE PAGOS</p>
          <h3 className="fin-card-title">Vencimientos del mes</h3>
        </div>
        <button className="fin-btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>

      {pendientes.length > 0 && (
        <div className="fd-rec-summary">
          <span>{pendientes.length} pago{pendientes.length !== 1 ? 's' : ''} pendiente{pendientes.length !== 1 ? 's' : ''}</span>
          {totalPendiente > 0 && <strong>S/ {totalPendiente.toFixed(2)} total</strong>}
        </div>
      )}

      {showForm && (
        <div className="fin-form">
          <div className="fin-form-grid">
            <input className="fin-input" placeholder="Nombre del pago (ej. Alquiler, Netflix…)"
              value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
            <input className="fin-input fin-input-sm" type="number" min="0" placeholder="S/ Monto (opcional)"
              value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
            <label className="fin-label-inline">
              Día del mes
              <input className="fin-input fin-input-sm" type="number" min="1" max="31"
                value={form.dia} onChange={(e) => setForm({ ...form, dia: e.target.value })} />
            </label>
            <label className="fin-label-inline">
              Categoría
              <select className="fin-select" value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                {CATEGORIAS_REC.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </label>
            <button className="fin-btn-primary" onClick={agregar}>Guardar</button>
          </div>
        </div>
      )}

      {recs.length === 0 && !showForm && (
        <p className="fin-empty">Sin recordatorios. Agregá tus pagos fijos del mes.</p>
      )}

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <div className="fd-rec-list">
          {pendientes.map((r) => {
            const cat = CATEGORIAS_REC.find((c) => c.id === r.categoria);
            const diasRestantes = r.dia - hoy;
            const vencida = diasRestantes < 0;
            const hoyEs = diasRestantes === 0;
            return (
              <div key={r.id} className={`fd-rec-row${hoyEs ? ' vence-hoy' : vencida ? ' vencida' : ''}`}>
                <span className="fd-rec-emoji">{cat?.emoji}</span>
                <div className="fd-rec-info">
                  <b>{r.titulo}</b>
                  <small>
                    {hoyEs ? '⚠ Vence hoy' : vencida ? `⚠ Venció el día ${r.dia}` : `Día ${r.dia} · faltan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`}
                  </small>
                </div>
                {r.monto > 0 && <strong className="fd-rec-monto">S/ {r.monto.toFixed(2)}</strong>}
                <button
                  className="fd-rec-check"
                  onClick={() => toggleCompletado(r.id)}
                  aria-label="Marcar como pagado"
                  title="Marcar como pagado"
                >○</button>
                <button className="fin-del-btn" onClick={() => eliminar(r.id)} aria-label="Eliminar">×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completados */}
      {completados.length > 0 && (
        <div className="fd-rec-list" style={{ opacity: .6 }}>
          <p className="fin-label" style={{ padding: '8px 20px 0' }}>PAGADOS ESTE MES</p>
          {completados.map((r) => {
            const cat = CATEGORIAS_REC.find((c) => c.id === r.categoria);
            return (
              <div key={r.id} className="fd-rec-row fd-rec-done">
                <span className="fd-rec-emoji">{cat?.emoji}</span>
                <div className="fd-rec-info">
                  <b style={{ textDecoration: 'line-through' }}>{r.titulo}</b>
                  <small>✓ Pagado</small>
                </div>
                {r.monto > 0 && <strong className="fd-rec-monto" style={{ textDecoration: 'line-through' }}>S/ {r.monto.toFixed(2)}</strong>}
                <button className="fd-rec-check" onClick={() => toggleCompletado(r.id)} title="Desmarcar">✓</button>
                <button className="fin-del-btn" onClick={() => eliminar(r.id)} aria-label="Eliminar">×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
