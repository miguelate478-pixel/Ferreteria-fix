'use client';

import { useEffect, useState } from 'react';

interface Deuda {
  id: string;
  nombre: string;
  montoTotal: number;
  montoPagado: number;
  cuotaMensual: number;
  diaPago: number; // 1-31
  color: string;
}

const COLORES = ['#7c83fd', '#ff6b6b', '#ffd93d', '#6bcb77', '#ff9f43', '#c56cf0'];

export function Deudas() {
  const [deudas, setDeudas] = useState<Deuda[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', montoTotal: '', cuotaMensual: '', diaPago: '5' });
  const [pagoId, setPagoId] = useState<string | null>(null);
  const [montoPago, setMontoPago] = useState('');

  useEffect(() => {
    const d = localStorage.getItem('deudas');
    if (d) setDeudas(JSON.parse(d));
  }, []);

  const save = (d: Deuda[]) => { setDeudas(d); localStorage.setItem('deudas', JSON.stringify(d)); };

  const agregar = () => {
    if (!form.nombre.trim() || !form.montoTotal || !form.cuotaMensual) return;
    save([...deudas, {
      id: Date.now().toString(),
      nombre: form.nombre.trim(),
      montoTotal: Number(form.montoTotal),
      montoPagado: 0,
      cuotaMensual: Number(form.cuotaMensual),
      diaPago: Number(form.diaPago),
      color: COLORES[deudas.length % COLORES.length],
    }]);
    setForm({ nombre: '', montoTotal: '', cuotaMensual: '', diaPago: '5' });
    setShowForm(false);
  };

  const registrarPago = (id: string) => {
    const v = Number(montoPago);
    if (!v || v <= 0) return;
    save(deudas.map((d) => d.id === id
      ? { ...d, montoPagado: Math.min(d.montoTotal, d.montoPagado + v) }
      : d));
    setPagoId(null); setMontoPago('');
  };

  const eliminar = (id: string) => save(deudas.filter((d) => d.id !== id));

  const totalDeuda = deudas.reduce((s, d) => s + (d.montoTotal - d.montoPagado), 0);
  const totalCuotas = deudas.filter((d) => d.montoPagado < d.montoTotal)
    .reduce((s, d) => s + d.cuotaMensual, 0);

  // Próximos vencimientos este mes
  const hoy = new Date().getDate();
  const proximos = deudas
    .filter((d) => d.montoPagado < d.montoTotal)
    .sort((a, b) => {
      const da = a.diaPago >= hoy ? a.diaPago : a.diaPago + 31;
      const db = b.diaPago >= hoy ? b.diaPago : b.diaPago + 31;
      return da - db;
    });

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">DEUDAS Y CUOTAS</p>
          <h3 className="fin-card-title">Control de pagos</h3>
        </div>
        <button className="fin-btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancelar' : '+ Agregar deuda'}
        </button>
      </div>

      {/* Resumen */}
      {deudas.length > 0 && (
        <div className="fd-deuda-summary">
          <div className="fd-deuda-kpi">
            <span>Deuda total pendiente</span>
            <strong style={{ color: 'var(--fd-red)' }}>S/ {totalDeuda.toFixed(2)}</strong>
          </div>
          <div className="fd-deuda-kpi">
            <span>Cuotas mensuales</span>
            <strong style={{ color: 'var(--fd-yellow)' }}>S/ {totalCuotas.toFixed(2)}/mes</strong>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fin-form">
          <div className="fin-form-grid">
            <input className="fin-input" placeholder="Nombre (ej. Préstamo banco, Tarjeta…)"
              value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <input className="fin-input fin-input-sm" type="number" min="0" placeholder="S/ Monto total"
              value={form.montoTotal} onChange={(e) => setForm({ ...form, montoTotal: e.target.value })} />
            <input className="fin-input fin-input-sm" type="number" min="0" placeholder="S/ Cuota mensual"
              value={form.cuotaMensual} onChange={(e) => setForm({ ...form, cuotaMensual: e.target.value })} />
            <label className="fin-label-inline">
              Día de pago (del mes)
              <input className="fin-input fin-input-sm" type="number" min="1" max="31"
                value={form.diaPago} onChange={(e) => setForm({ ...form, diaPago: e.target.value })} />
            </label>
            <button className="fin-btn-primary" onClick={agregar}>Guardar</button>
          </div>
        </div>
      )}

      {deudas.length === 0 && !showForm && (
        <p className="fin-empty">Sin deudas registradas. ¡Excelente! 🎉</p>
      )}

      {/* Lista */}
      <div className="fd-deuda-list">
        {proximos.map((d) => {
          const pct = Math.min(100, (d.montoPagado / d.montoTotal) * 100);
          const restante = d.montoTotal - d.montoPagado;
          const cuotasRestantes = Math.ceil(restante / d.cuotaMensual);
          const vencida = d.diaPago < hoy;
          const hoyEs = d.diaPago === hoy;

          return (
            <div key={d.id} className={`fd-deuda-row${hoyEs ? ' vence-hoy' : vencida ? ' vencida' : ''}`}>
              <div className="fd-deuda-dot" style={{ background: d.color }} />
              <div className="fd-deuda-info">
                <div className="fd-deuda-top">
                  <b>{d.nombre}</b>
                  <span className={`fd-vence-tag${hoyEs ? ' hoy' : vencida ? ' atrasado' : ''}`}>
                    {hoyEs ? '⚠ Vence hoy' : vencida ? `⚠ Venció el ${d.diaPago}` : `Pagar el ${d.diaPago}`}
                  </span>
                </div>
                <div className="fd-deuda-bar-wrap">
                  <div className="fd-deuda-bar" style={{ width: `${pct}%`, background: d.color }} />
                </div>
                <div className="fd-deuda-nums">
                  <span>S/ {d.montoPagado.toFixed(2)} pagado</span>
                  <span>S/ {restante.toFixed(2)} restante · ~{cuotasRestantes} cuota{cuotasRestantes !== 1 ? 's' : ''}</span>
                </div>
                <div className="fd-deuda-cuota">Cuota: S/ {d.cuotaMensual.toFixed(2)}/mes</div>
              </div>

              <div className="fd-deuda-actions">
                {pagoId === d.id ? (
                  <div className="fin-row-gap">
                    <input className="fin-input fin-input-sm" type="number" min="0"
                      placeholder="S/ monto" value={montoPago}
                      onChange={(e) => setMontoPago(e.target.value)} style={{ width: 100 }} />
                    <button className="fin-btn-primary" style={{ fontSize: 11 }} onClick={() => registrarPago(d.id)}>✓</button>
                    <button className="fin-btn-ghost" style={{ fontSize: 11 }} onClick={() => setPagoId(null)}>×</button>
                  </div>
                ) : (
                  <button className="fin-btn-ghost" style={{ fontSize: 11 }} onClick={() => setPagoId(d.id)}>
                    + Pago
                  </button>
                )}
                <button className="fin-del-btn" onClick={() => eliminar(d.id)} aria-label="Eliminar">×</button>
              </div>
            </div>
          );
        })}

        {/* Deudas completadas */}
        {deudas.filter((d) => d.montoPagado >= d.montoTotal).map((d) => (
          <div key={d.id} className="fd-deuda-row fd-deuda-completada">
            <div className="fd-deuda-dot" style={{ background: d.color, opacity: .4 }} />
            <div className="fd-deuda-info">
              <b style={{ textDecoration: 'line-through', opacity: .5 }}>{d.nombre}</b>
              <span style={{ fontSize: 11, color: 'var(--fd-green)' }}>✓ Completada — S/ {d.montoTotal.toFixed(2)}</span>
            </div>
            <button className="fin-del-btn" onClick={() => eliminar(d.id)} aria-label="Eliminar">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
