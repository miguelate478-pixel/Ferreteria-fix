'use client';

import { useEffect, useState } from 'react';

interface MesData {
  key: string;      // YYYY-MM
  label: string;    // "Jun 2025"
  gastos: number;
  presupuesto: number;
  ingreso: number;
}

function getUltimosMeses(n: number): string[] {
  const result: string[] = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
    result.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

function mesLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
}

// Gráfico de línea SVG
function LineChart({ data, width = 500, height = 120 }: {
  data: { label: string; gastos: number; ingreso: number }[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const pad = { top: 12, right: 16, bottom: 28, left: 44 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const allVals = data.flatMap((d) => [d.gastos, d.ingreso]).filter((v) => v > 0);
  const maxVal = Math.max(...allVals, 1);

  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - (v / maxVal) * H;

  const pathGastos = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.gastos).toFixed(1)}`)
    .join(' ');

  const pathIngreso = data
    .filter((d) => d.ingreso > 0)
    .map((d, i, arr) => {
      const realI = data.indexOf(d);
      return `${i === 0 ? 'M' : 'L'} ${x(realI).toFixed(1)} ${y(d.ingreso).toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      aria-label="Historial de gastos mensual"
      style={{ overflow: 'visible' }}
    >
      <g transform={`translate(${pad.left},${pad.top})`}>
        {/* Líneas horizontales de referencia */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1={0} y1={y(maxVal * v)} x2={W} y2={y(maxVal * v)}
              stroke="rgba(255,255,255,.06)" strokeWidth="1" />
            <text x={-6} y={y(maxVal * v) + 4} textAnchor="end"
              fill="rgba(255,255,255,.3)" fontSize="9">
              {(maxVal * v / 1000).toFixed(1)}k
            </text>
          </g>
        ))}

        {/* Área bajo gastos */}
        <path
          d={`${pathGastos} L ${x(data.length - 1).toFixed(1)} ${H} L ${x(0).toFixed(1)} ${H} Z`}
          fill="rgba(124,131,253,.08)"
        />

        {/* Línea ingresos */}
        {pathIngreso && (
          <path d={pathIngreso} fill="none" stroke="#6bcb77" strokeWidth="1.5"
            strokeDasharray="5 3" opacity=".6" strokeLinecap="round" />
        )}

        {/* Línea gastos */}
        <path d={pathGastos} fill="none" stroke="#7c83fd" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Puntos */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.gastos)} r={3} fill="#7c83fd" />
            <title>{d.label}: S/ {d.gastos.toFixed(2)}</title>
          </g>
        ))}

        {/* Etiquetas eje X */}
        {data.map((d, i) => (
          <text key={i} x={x(i)} y={H + 16} textAnchor="middle"
            fill="rgba(255,255,255,.4)" fontSize="9">
            {d.label}
          </text>
        ))}
      </g>

      {/* Leyenda */}
      <g transform={`translate(${pad.left}, ${height - 4})`}>
        <rect x={0} y={-6} width={10} height={3} rx="1" fill="#7c83fd" />
        <text x={14} y={0} fill="rgba(255,255,255,.5)" fontSize="9">Gastos</text>
        <rect x={60} y={-6} width={10} height={3} rx="1" fill="#6bcb77" opacity=".6" />
        <text x={74} y={0} fill="rgba(255,255,255,.5)" fontSize="9">Ingresos</text>
      </g>
    </svg>
  );
}

export function HistorialMensual() {
  const [historial, setHistorial] = useState<MesData[]>([]);
  const [mesesMostrar, setMesesMostrar] = useState(6);

  useEffect(() => {
    const ingresoBase = Number(localStorage.getItem('ingreso_mensual') || 0);
    const meses = getUltimosMeses(12);
    const data: MesData[] = meses.map((key) => {
      const g = localStorage.getItem(`gastos_${key}`);
      const gastos: Array<{ monto: number }> = g ? JSON.parse(g) : [];
      const pres = Number(localStorage.getItem(`presupuesto_${key}`) || 0);
      return {
        key,
        label: mesLabel(key),
        gastos: gastos.reduce((s, x) => s + x.monto, 0),
        presupuesto: pres,
        ingreso: ingresoBase,
      };
    });
    setHistorial(data);
  }, []);

  const visible = historial.slice(-mesesMostrar);
  const mesActual = historial[historial.length - 1];
  const mesAnterior = historial[historial.length - 2];

  const variacion = mesAnterior && mesAnterior.gastos > 0
    ? ((mesActual?.gastos - mesAnterior.gastos) / mesAnterior.gastos) * 100
    : 0;

  const totalAcumulado = historial.reduce((s, m) => s + m.gastos, 0);
  const promedioMensual = historial.filter((m) => m.gastos > 0).length > 0
    ? totalAcumulado / historial.filter((m) => m.gastos > 0).length
    : 0;

  const mejorMes = [...historial].filter((m) => m.gastos > 0).sort((a, b) => a.gastos - b.gastos)[0];
  const peorMes = [...historial].filter((m) => m.gastos > 0).sort((a, b) => b.gastos - a.gastos)[0];

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">HISTORIAL</p>
          <h3 className="fin-card-title">Evolución de gastos</h3>
        </div>
        <div className="fin-row-gap">
          {[3, 6, 12].map((n) => (
            <button key={n}
              className={mesesMostrar === n ? 'fin-btn-primary' : 'fin-btn-ghost'}
              style={{ fontSize: 11, minHeight: 30, padding: '0 10px' }}
              onClick={() => setMesesMostrar(n)}>
              {n}M
            </button>
          ))}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="fd-hist-stats">
        <div className="fd-hist-stat">
          <span>Variación vs mes anterior</span>
          <strong style={{ color: variacion > 0 ? '#ff6b6b' : variacion < 0 ? '#6bcb77' : 'var(--fd-muted)' }}>
            {variacion > 0 ? '+' : ''}{variacion.toFixed(1)}%
          </strong>
        </div>
        <div className="fd-hist-stat">
          <span>Promedio mensual</span>
          <strong>S/ {promedioMensual.toFixed(2)}</strong>
        </div>
        {mejorMes && (
          <div className="fd-hist-stat">
            <span>Mejor mes (menos gasto)</span>
            <strong style={{ color: '#6bcb77' }}>{mejorMes.label} · S/ {mejorMes.gastos.toFixed(0)}</strong>
          </div>
        )}
        {peorMes && peorMes.key !== mejorMes?.key && (
          <div className="fd-hist-stat">
            <span>Mes de mayor gasto</span>
            <strong style={{ color: '#ff6b6b' }}>{peorMes.label} · S/ {peorMes.gastos.toFixed(0)}</strong>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div className="fd-hist-chart">
        {visible.some((m) => m.gastos > 0) ? (
          <LineChart
            data={visible.map((m) => ({ label: m.label, gastos: m.gastos, ingreso: m.ingreso }))}
          />
        ) : (
          <div className="fd-panel-empty">Sin datos suficientes para mostrar el gráfico</div>
        )}
      </div>

      {/* Tabla */}
      <div className="fd-hist-table">
        <div className="fd-hist-thead">
          <span>Mes</span>
          <span>Gastos</span>
          <span>Presupuesto</span>
          <span>Estado</span>
        </div>
        {[...visible].reverse().map((m) => {
          const sobre = m.presupuesto > 0 && m.gastos > m.presupuesto;
          const ok = m.presupuesto > 0 && m.gastos <= m.presupuesto;
          return (
            <div key={m.key} className="fd-hist-row">
              <span>{m.label}</span>
              <strong>S/ {m.gastos.toFixed(2)}</strong>
              <span>{m.presupuesto > 0 ? `S/ ${m.presupuesto.toFixed(2)}` : '—'}</span>
              <span style={{ color: sobre ? '#ff6b6b' : ok ? '#6bcb77' : 'var(--fd-muted)', fontSize: 11 }}>
                {sobre ? '↑ Excedido' : ok ? '✓ OK' : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
