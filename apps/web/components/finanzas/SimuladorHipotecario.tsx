'use client';

import { useMemo, useState } from 'react';

// ─── Datos reales del mercado peruano (julio 2026) ────────────────────────────
// Fuente: SBS, simuladores bancarios, Fondo MiVivienda 2024-2025
// Content was paraphrased for compliance with licensing restrictions

const BANCOS = [
  {
    id: 'mivivienda',
    nombre: 'Crédito MiVivienda',
    logo: '🏛️',
    moneda: 'PEN',
    teaMin: 8.0,
    teaMax: 10.5,
    teaRef: 9.0,   // TEA fija promedio MiVivienda 2024
    tcfaRef: 10.2, // TCEA incluyendo seguros y comisiones
    plazoMin: 5,
    plazoMax: 25,
    cuotaInicialMin: 10,  // 10% mínimo
    montoMin: 60000,
    montoMax: 600000,
    nota: 'Programa estatal. Incluye Bono del Buen Pagador (BBP). Cuota inicial mínima 10%.',
    bonoBuenPagador: true,
    bbpMax: 35000, // S/ 35,000 máx según precio de inmueble
    seguros: true,
  },
  {
    id: 'bcp_soles',
    nombre: 'BCP — Soles',
    logo: '🏦',
    moneda: 'PEN',
    teaMin: 7.5,
    teaMax: 13.0,
    teaRef: 9.5,
    tcfaRef: 10.8,
    plazoMin: 5,
    plazoMax: 25,
    cuotaInicialMin: 10,
    montoMin: 50000,
    montoMax: 1500000,
    nota: 'Cuota inicial desde 10%. Tasa fija o variable según contrato. TCEA incluye seguro de desgravamen y seguro de inmueble.',
    bonoBuenPagador: false,
    bbpMax: 0,
    seguros: true,
  },
  {
    id: 'bbva_soles',
    nombre: 'BBVA — Soles',
    logo: '🔵',
    moneda: 'PEN',
    teaMin: 7.8,
    teaMax: 12.5,
    teaRef: 9.8,
    tcfaRef: 11.0,
    plazoMin: 5,
    plazoMax: 25,
    cuotaInicialMin: 10,
    montoMin: 50000,
    montoMax: 1200000,
    nota: 'Cuota inicial desde 10%. Incluye seguro multiriesgo obligatorio. Financiamiento hasta 90% del valor de tasación.',
    bonoBuenPagador: false,
    bbpMax: 0,
    seguros: true,
  },
  {
    id: 'interbank_soles',
    nombre: 'Interbank — Soles',
    logo: '🟢',
    moneda: 'PEN',
    teaMin: 8.0,
    teaMax: 13.5,
    teaRef: 10.2,
    tcfaRef: 11.4,
    plazoMin: 5,
    plazoMax: 20,
    cuotaInicialMin: 10,
    montoMin: 40000,
    montoMax: 1000000,
    nota: 'Cuota inicial desde 10%. Tasas desde 8% para buenos perfiles crediticios. Requiere seguro de vida y multiriesgo.',
    bonoBuenPagador: false,
    bbpMax: 0,
    seguros: true,
  },
  {
    id: 'scotiabank_soles',
    nombre: 'Scotiabank — Soles',
    logo: '🔴',
    moneda: 'PEN',
    teaMin: 7.5,
    teaMax: 12.0,
    teaRef: 9.2,
    tcfaRef: 10.5,
    plazoMin: 5,
    plazoMax: 25,
    cuotaInicialMin: 10,
    montoMin: 50000,
    montoMax: 1500000,
    nota: 'Cuota inicial desde 10%. Financiamiento hasta 90% del valor del inmueble. Tasa fija durante toda la vida del crédito.',
    bonoBuenPagador: false,
    bbpMax: 0,
    seguros: true,
  },
  {
    id: 'bcp_dolares',
    nombre: 'BCP — Dólares',
    logo: '🏦',
    moneda: 'USD',
    teaMin: 6.0,
    teaMax: 9.5,
    teaRef: 7.5,
    tcfaRef: 8.8,
    plazoMin: 5,
    plazoMax: 25,
    cuotaInicialMin: 10,
    montoMin: 20000,
    montoMax: 500000,
    nota: 'Cuota inicial desde 10%. Recomendado solo si ingresos son en dólares. Riesgo cambiario si se gana en soles.',
    bonoBuenPagador: false,
    bbpMax: 0,
    seguros: true,
  },
  {
    id: 'bbva_dolares',
    nombre: 'BBVA — Dólares',
    logo: '🔵',
    moneda: 'USD',
    teaMin: 5.8,
    teaMax: 9.0,
    teaRef: 7.2,
    tcfaRef: 8.5,
    plazoMin: 5,
    plazoMax: 25,
    cuotaInicialMin: 10,
    montoMin: 15000,
    montoMax: 400000,
    nota: 'Cuota inicial desde 10%. Tasas en dólares históricamente más bajas. Solo recomendado para ingresos en USD.',
    bonoBuenPagador: false,
    bbpMax: 0,
    seguros: true,
  },
  {
    id: 'personalizado',
    nombre: 'Tasa personalizada',
    logo: '⚙️',
    moneda: 'PEN',
    teaMin: 1,
    teaMax: 30,
    teaRef: 9.0,
    tcfaRef: 10.0,
    plazoMin: 1,
    plazoMax: 30,
    cuotaInicialMin: 0,
    montoMin: 10000,
    montoMax: 9999999,
    nota: 'Ingresá tu propia tasa para comparar ofertas.',
    bonoBuenPagador: false,
    bbpMax: 0,
    seguros: false,
  },
];

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CuotaAmort {
  n: number;
  cuota: number;
  interes: number;
  capital: number;
  saldo: number;
}

interface Resultado {
  cuotaMensual: number;
  totalPagar: number;
  totalIntereses: number;
  tcem: number;  // tasa de costo efectivo mensual
  cuotaInicial: number;
  prestamo: number;
  amortizacion: CuotaAmort[];
  seguroDesgravamen: number;
  seguroInmueble: number;
  cuotaTotal: number;
  bbpDescuento: number;
  relacionCuotaIngreso: number;
}

// ─── Motor financiero ─────────────────────────────────────────────────────────

/**
 * Convierte TEA (tasa efectiva anual) a TEM (tasa efectiva mensual).
 * TEM = (1 + TEA/100)^(1/12) - 1
 */
function teaToTem(tea: number): number {
  return Math.pow(1 + tea / 100, 1 / 12) - 1;
}

/**
 * Calcula cuota mensual con fórmula de amortización francesa (cuota fija):
 * C = P × [r(1+r)^n] / [(1+r)^n - 1]
 * donde P = préstamo, r = TEM, n = meses
 */
function calcularCuota(prestamo: number, tem: number, meses: number): number {
  if (tem === 0) return prestamo / meses;
  return (prestamo * tem * Math.pow(1 + tem, meses)) / (Math.pow(1 + tem, meses) - 1);
}

/**
 * Genera la tabla de amortización completa (sistema francés).
 */
function generarAmortizacion(prestamo: number, tem: number, meses: number): CuotaAmort[] {
  const cuota = calcularCuota(prestamo, tem, meses);
  const tabla: CuotaAmort[] = [];
  let saldo = prestamo;
  for (let n = 1; n <= meses; n++) {
    const interes = saldo * tem;
    const capital = cuota - interes;
    saldo = Math.max(0, saldo - capital);
    tabla.push({
      n,
      cuota: Math.round(cuota * 100) / 100,
      interes: Math.round(interes * 100) / 100,
      capital: Math.round(capital * 100) / 100,
      saldo: Math.round(saldo * 100) / 100,
    });
  }
  return tabla;
}

function calcularHipoteca(
  precioInmueble: number,
  pctCuotaInicial: number,
  tea: number,
  plazoAnios: number,
  bancoId: string,
  ingresoMensual: number,
): Resultado {
  const banco = BANCOS.find((b) => b.id === bancoId) ?? BANCOS[0];
  const bbpDescuento = banco.bonoBuenPagador ? Math.min(banco.bbpMax, precioInmueble * 0.04) : 0;
  const precioFinal = precioInmueble - bbpDescuento;

  const cuotaInicial = precioFinal * (pctCuotaInicial / 100);
  const prestamo = precioFinal - cuotaInicial;
  const meses = plazoAnios * 12;
  const tem = teaToTem(tea);

  const cuotaMensual = calcularCuota(prestamo, tem, meses);

  // Seguros (estimaciones de mercado peruano)
  const seguroDesgravamen = banco.seguros ? prestamo * 0.00028 : 0; // ~0.028% mensual del saldo
  const seguroInmueble = banco.seguros ? precioInmueble * 0.000083 : 0; // ~0.1% anual

  const cuotaTotal = cuotaMensual + seguroDesgravamen + seguroInmueble;
  const totalPagar = cuotaTotal * meses + cuotaInicial;
  const totalIntereses = totalPagar - precioFinal;
  const tcem = tem * 100;
  const relacionCuotaIngreso = ingresoMensual > 0 ? (cuotaTotal / ingresoMensual) * 100 : 0;

  const amortizacion = generarAmortizacion(prestamo, tem, meses);

  return {
    cuotaMensual,
    totalPagar,
    totalIntereses,
    tcem,
    cuotaInicial,
    prestamo,
    amortizacion,
    seguroDesgravamen,
    seguroInmueble,
    cuotaTotal,
    bbpDescuento,
    relacionCuotaIngreso,
  };
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function fmt(n: number, sym = 'S/') {
  return `${sym} ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtK(n: number, sym = 'S/') {
  if (n >= 1000000) return `${sym} ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${sym} ${(n / 1000).toFixed(0)}K`;
  return fmt(n, sym);
}

// Gráfico de torta SVG: capital vs intereses
function PieChart({ capital, intereses }: { capital: number; intereses: number }) {
  const total = capital + intereses;
  if (total === 0) return null;
  const pctCap = capital / total;
  const r = 40, cx = 50, cy = 50, circ = 2 * Math.PI * r;
  const dashCap = pctCap * circ;
  return (
    <svg viewBox="0 0 100 100" width="120" height="120" aria-label="Distribución capital vs intereses">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ff6b6b" strokeWidth="20" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#7c83fd" strokeWidth="20"
        strokeDasharray={`${dashCap} ${circ - dashCap}`}
        transform="rotate(-90 50 50)" strokeLinecap="butt" />
      <text x="50" y="46" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
        {(pctCap * 100).toFixed(0)}%
      </text>
      <text x="50" y="57" textAnchor="middle" fill="rgba(255,255,255,.6)" fontSize="7">capital</text>
    </svg>
  );
}

// Gráfico de línea SVG para evolución de saldo
function SaldoChart({ amort, meses }: { amort: CuotaAmort[]; meses: number }) {
  if (amort.length === 0) return null;
  const W = 400, H = 80, pad = { l: 8, r: 8, t: 8, b: 20 };
  const maxSaldo = amort[0].saldo + amort[0].capital;
  const step = Math.max(1, Math.floor(amort.length / 60));
  const puntos = amort.filter((_, i) => i % step === 0 || i === amort.length - 1);

  const x = (i: number) => pad.l + (i / (puntos.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxSaldo) * (H - pad.t - pad.b);

  const pathSaldo = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.saldo).toFixed(1)}`).join(' ');
  const area = `${pathSaldo} L ${x(puntos.length - 1).toFixed(1)} ${(H - pad.b).toFixed(1)} L ${pad.l} ${(H - pad.b).toFixed(1)} Z`;

  // Años como eje X
  const añoLabels = [0, Math.floor(meses / 4), Math.floor(meses / 2), Math.floor(meses * 3 / 4), meses - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="Evolución del saldo pendiente">
      <path d={area} fill="rgba(124,131,253,.12)" />
      <path d={pathSaldo} fill="none" stroke="#7c83fd" strokeWidth="1.5" strokeLinecap="round" />
      {añoLabels.map((idx) => {
        const p = puntos[Math.min(idx, puntos.length - 1)];
        const xi = puntos.indexOf(p);
        return (
          <text key={idx} x={x(xi < 0 ? 0 : xi)} y={H - 4} textAnchor="middle"
            fill="rgba(255,255,255,.3)" fontSize="7">
            Año {Math.round(amort[Math.min(idx, amort.length - 1)].n / 12)}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SimuladorHipotecario() {
  const [precioInmueble, setPrecioInmueble] = useState(350000);
  const [pctCuotaInicial, setPctCuotaInicial] = useState(10);
  const [plazoAnios, setPlazoAnios] = useState(20);
  const [bancoId, setBancoId] = useState('bcp_soles');
  const [teaPersonalizada, setTeaPersonalizada] = useState(9.0);
  const [ingresoMensual, setIngresoMensual] = useState(0);
  const [verTabla, setVerTabla] = useState(false);
  const [paginaTabla, setPaginaTabla] = useState(0);
  const [compareMode, setCompareMode] = useState(false);

  const banco = BANCOS.find((b) => b.id === bancoId) ?? BANCOS[0];
  const sym = banco.moneda === 'USD' ? 'US$' : 'S/';
  const tea = bancoId === 'personalizado' ? teaPersonalizada : banco.teaRef;

  const resultado = useMemo(
    () => calcularHipoteca(precioInmueble, pctCuotaInicial, tea, plazoAnios, bancoId, ingresoMensual),
    [precioInmueble, pctCuotaInicial, tea, plazoAnios, bancoId, ingresoMensual],
  );

  // Comparación entre todos los bancos en soles
  const comparacion = useMemo(() => {
    return BANCOS.filter((b) => b.id !== 'personalizado').map((b) => {
      const r = calcularHipoteca(precioInmueble, Math.max(b.cuotaInicialMin, pctCuotaInicial), b.teaRef, plazoAnios, b.id, 0);
      return { banco: b, cuota: r.cuotaTotal, total: r.totalPagar, tcea: b.tcfaRef };
    }).sort((a, b) => a.cuota - b.cuota);
  }, [precioInmueble, pctCuotaInicial, plazoAnios]);

  const relacionOK = resultado.relacionCuotaIngreso > 0 && resultado.relacionCuotaIngreso <= 30;
  const relacionWarn = resultado.relacionCuotaIngreso > 30 && resultado.relacionCuotaIngreso <= 40;

  const FILAS_PAGINA = 24;
  const totalPaginas = Math.ceil(resultado.amortizacion.length / FILAS_PAGINA);
  const filasPagina = resultado.amortizacion.slice(paginaTabla * FILAS_PAGINA, (paginaTabla + 1) * FILAS_PAGINA);

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">SIMULADOR HIPOTECARIO · PERÚ</p>
          <h3 className="fin-card-title">Calculadora de crédito para vivienda</h3>
        </div>
        <button className={`fin-btn-ghost${compareMode ? ' active' : ''}`} style={{ fontSize: 11 }}
          onClick={() => setCompareMode((v) => !v)}>
          {compareMode ? '← Volver' : '⇄ Comparar bancos'}
        </button>
      </div>

      {/* ══ MODO COMPARACIÓN ══ */}
      {compareMode && (
        <div className="fd-hipot-compare">
          <p className="fin-label" style={{ padding: '12px 20px 8px' }}>
            COMPARACIÓN — Inmueble {fmt(precioInmueble, sym)} · {pctCuotaInicial}% inicial · {plazoAnios} años
          </p>
          <div className="fd-compare-table">
            <div className="fd-compare-head">
              <span>Banco</span><span>TEA ref.</span><span>TCEA est.</span><span>Cuota mensual</span><span>Total a pagar</span>
            </div>
            {comparacion.map((row, i) => (
              <div key={row.banco.id} className={`fd-compare-row${i === 0 ? ' mejor' : ''}`}>
                <span>{row.banco.logo} {row.banco.nombre}</span>
                <span>{row.banco.teaRef.toFixed(1)}%</span>
                <span>{row.tcea.toFixed(1)}%</span>
                <strong style={{ color: i === 0 ? '#6bcb77' : 'var(--fd-text)' }}>{fmt(row.cuota, row.banco.moneda === 'USD' ? 'US$' : 'S/')}</strong>
                <span>{fmtK(row.total, row.banco.moneda === 'USD' ? 'US$' : 'S/')}</span>
              </div>
            ))}
          </div>
          <p className="fin-result-note" style={{ margin: '0 20px 16px' }}>
            Tasas de referencia del mercado peruano (2025). Las tasas reales dependen de tu perfil crediticio, historial y el banco.
            TCEA incluye estimación de seguros. Datos con fines informativos.
          </p>
        </div>
      )}

      {/* ══ FORMULARIO ══ */}
      {!compareMode && (
        <>
          <div className="fin-form">
            <div className="fd-hipot-form-grid">
              {/* Precio del inmueble */}
              <div className="fd-hipot-field">
                <label className="fin-label-inline">
                  Precio del inmueble ({sym})
                  <input className="fin-input" type="number" min="10000" step="1000"
                    value={precioInmueble}
                    onChange={(e) => setPrecioInmueble(Math.max(10000, Number(e.target.value)))} />
                </label>
                <input type="range" min="50000" max="2000000" step="5000"
                  value={precioInmueble} onChange={(e) => setPrecioInmueble(Number(e.target.value))}
                  className="fd-range" aria-label="Precio del inmueble" />
                <div className="fd-range-labels"><span>S/ 50K</span><span>S/ 2M</span></div>
              </div>

              {/* Cuota inicial */}
              <div className="fd-hipot-field">
                <label className="fin-label-inline">
                  Cuota inicial: {pctCuotaInicial}% = {fmt(precioInmueble * pctCuotaInicial / 100, sym)}
                  <input className="fin-input fin-input-sm" type="number" min={banco.cuotaInicialMin} max="80"
                    value={pctCuotaInicial}
                    onChange={(e) => setPctCuotaInicial(Math.max(banco.cuotaInicialMin, Math.min(80, Number(e.target.value))))} />                </label>
                <input type="range" min={banco.cuotaInicialMin} max="60" step="5"
                  value={pctCuotaInicial} onChange={(e) => setPctCuotaInicial(Number(e.target.value))}
                  className="fd-range" aria-label="Cuota inicial porcentaje" />
                <div className="fd-range-labels"><span>{banco.cuotaInicialMin}%</span><span>60%</span></div>              </div>

              {/* Plazo */}
              <div className="fd-hipot-field">
                <label className="fin-label-inline">
                  Plazo: {plazoAnios} años ({plazoAnios * 12} cuotas)
                </label>
                <input type="range" min={banco.plazoMin} max={banco.plazoMax} step="1"
                  value={plazoAnios} onChange={(e) => setPlazoAnios(Number(e.target.value))}
                  className="fd-range" aria-label="Plazo en años" />
                <div className="fd-range-labels"><span>{banco.plazoMin}a</span><span>{banco.plazoMax}a</span></div>
              </div>

              {/* Banco / entidad */}
              <div className="fd-hipot-field">
                <label className="fin-label-inline">
                  Banco / modalidad
                  <select className="fin-select" value={bancoId} onChange={(e) => setBancoId(e.target.value)}>
                    <optgroup label="Soles">
                      {BANCOS.filter((b) => b.moneda === 'PEN' && b.id !== 'personalizado').map((b) => (
                        <option key={b.id} value={b.id}>{b.logo} {b.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Dólares">
                      {BANCOS.filter((b) => b.moneda === 'USD').map((b) => (
                        <option key={b.id} value={b.id}>{b.logo} {b.nombre}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Personalizar">
                      <option value="personalizado">⚙️ Tasa personalizada</option>
                    </optgroup>
                  </select>
                </label>
              </div>

              {/* TEA */}
              {bancoId === 'personalizado' ? (
                <div className="fd-hipot-field">
                  <label className="fin-label-inline">
                    TEA (Tasa Efectiva Anual) %
                    <input className="fin-input fin-input-sm" type="number" min="1" max="30" step="0.1"
                      value={teaPersonalizada} onChange={(e) => setTeaPersonalizada(Number(e.target.value))} />
                  </label>
                </div>
              ) : (
                <div className="fd-hipot-field">
                  <label className="fin-label-inline">
                    TEA referencial del banco
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <span className="fd-tea-badge">{banco.teaRef}%</span>
                      <span style={{ fontSize: 10, color: 'var(--fd-muted)' }}>rango: {banco.teaMin}%–{banco.teaMax}%</span>
                    </div>
                  </label>
                </div>
              )}

              {/* Ingreso mensual */}
              <div className="fd-hipot-field">
                <label className="fin-label-inline">
                  Ingreso mensual neto (opcional — para calcular relación cuota/ingreso)
                  <input className="fin-input" type="number" min="0"
                    placeholder="S/ 0"
                    value={ingresoMensual || ''}
                    onChange={(e) => setIngresoMensual(Number(e.target.value))} />
                </label>
              </div>
            </div>
          </div>

          {/* Nota del banco */}
          <div className="fd-banco-nota">
            <span>{banco.logo}</span>
            <div>
              <b>{banco.nombre}</b>
              <p>{banco.nota}</p>
              {banco.moneda === 'USD' && (
                <p style={{ color: '#ffd93d' }}>⚠ Crédito en dólares: el riesgo cambiario es tuyo si percibes soles.</p>
              )}
            </div>
          </div>

          {/* Bono Buen Pagador */}
          {resultado.bbpDescuento > 0 && (
            <div className="fd-bbp-banner">
              🎁 <strong>Bono del Buen Pagador aplicado:</strong> {fmt(resultado.bbpDescuento)} descontado del precio del inmueble.
            </div>
          )}

          {/* ══ RESULTADOS ══ */}
          <div className="fd-hipot-results">
            {/* KPIs principales */}
            <div className="fd-hipot-kpis">
              <div className="fd-hipot-kpi main">
                <span>Cuota mensual total</span>
                <strong>{fmt(resultado.cuotaTotal, sym)}</strong>
                <small>Capital + intereses + seguros</small>
              </div>
              <div className="fd-hipot-kpi">
                <span>Monto del préstamo</span>
                <strong>{fmt(resultado.prestamo, sym)}</strong>
              </div>
              <div className="fd-hipot-kpi">
                <span>Cuota inicial</span>
                <strong>{fmt(resultado.cuotaInicial, sym)}</strong>
                <small>{pctCuotaInicial}% del precio</small>
              </div>
              <div className="fd-hipot-kpi">
                <span>Total a pagar</span>
                <strong>{fmt(resultado.totalPagar, sym)}</strong>
              </div>
              <div className="fd-hipot-kpi" style={{ color: resultado.totalIntereses > resultado.prestamo ? '#ff6b6b' : 'inherit' }}>
                <span>Total intereses</span>
                <strong>{fmt(resultado.totalIntereses, sym)}</strong>
                <small>{((resultado.totalIntereses / resultado.prestamo) * 100).toFixed(0)}% del préstamo</small>
              </div>
              <div className="fd-hipot-kpi">
                <span>TEM (tasa mensual)</span>
                <strong>{resultado.tcem.toFixed(4)}%</strong>
                <small>TEA {tea}% anual</small>
              </div>
            </div>

            {/* Seguros */}
            {banco.seguros && (
              <div className="fd-seguros-row">
                <span>Seguro de desgravamen ~{fmt(resultado.seguroDesgravamen, sym)}/mes</span>
                <span>Seguro multiriesgo ~{fmt(resultado.seguroInmueble, sym)}/mes</span>
                <span className="fd-seguros-nota">Estimaciones de mercado. El banco define los montos exactos.</span>
              </div>
            )}

            {/* Relación cuota/ingreso */}
            {ingresoMensual > 0 && (
              <div className={`fd-relacion-row ${relacionOK ? 'ok' : relacionWarn ? 'warn' : 'bad'}`}>
                <div className="fd-relacion-bar-wrap">
                  <div className="fd-relacion-bar" style={{
                    width: `${Math.min(100, resultado.relacionCuotaIngreso)}%`,
                    background: relacionOK ? '#6bcb77' : relacionWarn ? '#ffd93d' : '#ff6b6b',
                  }} />
                  <div className="fd-relacion-mark30" title="Límite recomendado 30%" />
                  <div className="fd-relacion-mark40" title="Límite máximo 40%" />
                </div>
                <div className="fd-relacion-info">
                  <strong style={{ color: relacionOK ? '#6bcb77' : relacionWarn ? '#ffd93d' : '#ff6b6b' }}>
                    {resultado.relacionCuotaIngreso.toFixed(1)}% de tu ingreso
                  </strong>
                  <span>
                    {relacionOK ? '✓ Dentro del límite recomendado (máx. 30%)' :
                     relacionWarn ? '⚠ Entre 30%–40%: los bancos suelen aceptar hasta el 40%' :
                     '✕ Supera el 40%: riesgo de rechazo del crédito. Considerá aumentar la cuota inicial o el plazo.'}
                  </span>
                </div>
              </div>
            )}

            {/* Gráfico */}
            <div className="fd-hipot-charts">
              <div className="fd-hipot-chart-block">
                <p className="fd-hipot-chart-label">Capital vs Intereses</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <PieChart capital={resultado.prestamo} intereses={resultado.totalIntereses} />
                  <div className="fd-pie-legend">
                    <div><span className="fd-legend-dot" style={{ background: '#7c83fd' }} />Capital: {fmt(resultado.prestamo, sym)}</div>
                    <div><span className="fd-legend-dot" style={{ background: '#ff6b6b' }} />Intereses: {fmt(resultado.totalIntereses, sym)}</div>
                  </div>
                </div>
              </div>
              <div className="fd-hipot-chart-block" style={{ flex: 1 }}>
                <p className="fd-hipot-chart-label">Evolución del saldo pendiente</p>
                <SaldoChart amort={resultado.amortizacion} meses={plazoAnios * 12} />
              </div>
            </div>

            {/* Tabla de amortización */}
            <div className="fd-amort-section">
              <button className="fin-btn-ghost" style={{ width: '100%', margin: '4px 0' }}
                onClick={() => { setVerTabla((v) => !v); setPaginaTabla(0); }}>
                {verTabla ? '▲ Ocultar tabla' : '▼ Ver tabla de amortización completa'}
              </button>

              {verTabla && (
                <>
                  <div className="fd-amort-table">
                    <div className="fd-amort-head">
                      <span>#</span><span>Cuota</span><span>Interés</span><span>Capital</span><span>Saldo</span>
                    </div>
                    {filasPagina.map((fila) => (
                      <div key={fila.n} className="fd-amort-row">
                        <span className="fd-amort-n">{fila.n}</span>
                        <span>{fmt(fila.cuota, sym)}</span>
                        <span style={{ color: '#ff6b6b' }}>{fmt(fila.interes, sym)}</span>
                        <span style={{ color: '#6bcb77' }}>{fmt(fila.capital, sym)}</span>
                        <span>{fmt(fila.saldo, sym)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="fd-amort-pag">
                    <button className="fin-btn-ghost" disabled={paginaTabla === 0}
                      onClick={() => setPaginaTabla((p) => p - 1)}>← Anterior</button>
                    <span>{paginaTabla + 1} / {totalPaginas}</span>
                    <button className="fin-btn-ghost" disabled={paginaTabla >= totalPaginas - 1}
                      onClick={() => setPaginaTabla((p) => p + 1)}>Siguiente →</button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="fin-result-note" style={{ margin: '0 20px 20px' }}>
            <b>Aviso legal:</b> Los resultados son estimativos y con fines informativos. Las tasas pueden variar según perfil crediticio, historial en la SBS y condiciones del banco. La TCEA real la informa el banco antes de firmar el contrato. Consultá con un asesor financiero certificado.
          </div>
        </>
      )}
    </div>
  );
}
