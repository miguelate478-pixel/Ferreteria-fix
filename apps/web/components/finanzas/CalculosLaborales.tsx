'use client';

import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Regimen = 'general' | 'pequena' | 'micro';
type TipoCese = 'renuncia' | 'despido_arbitrario' | 'mutuo_acuerdo' | 'vencimiento';

interface DatosLaborales {
  sueldoBruto: number;
  asignacionFamiliar: number; // S/ 102.50 si tiene hijos
  horasExtras: number;        // monto mensual promedio
  fechaIngreso: string;
  fechaCese: string;
  regimen: Regimen;
  tipoCese: TipoCese;
  vacacionesPendientes: number; // días no gozados
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

/** Diferencia en meses completos y días residuales entre dos fechas */
function diffMesesDias(ini: Date, fin: Date): { meses: number; dias: number } {
  let m = (fin.getFullYear() - ini.getFullYear()) * 12 + (fin.getMonth() - ini.getMonth());
  let d = fin.getDate() - ini.getDate();
  if (d < 0) { m--; d += 30; } // 30 días por mes (práctica laboral peruana)
  return { meses: Math.max(0, m), dias: Math.max(0, d) };
}

/** Años trabajados completos (para indemnización) */
function añosCompletos(ini: Date, fin: Date): number {
  const { meses, dias } = diffMesesDias(ini, fin);
  return Math.floor((meses + dias / 30) / 12);
}

// ─── CTS ─────────────────────────────────────────────────────────────────────
// Ley 25920 y D.S. 001-97-TR
// Período 1: nov 1 – abr 30 → depositar hasta 15 mayo
// Período 2: may 1 – oct 31 → depositar hasta 15 noviembre
// Remuneración computable: sueldo básico + asignación familiar + 1/6 grati + horas extras
// CTS = RemComp / 12 × (meses + días/30)   del período vigente
// Microempresa: NO tiene CTS

interface ResultadoCTS {
  tieneCTS: boolean;
  remComp: number;
  periodoLabel: string;
  periodoInicio: Date;
  periodoFin: Date;
  meses: number;
  dias: number;
  depositoEstimado: number;  // monto a depositar en el próximo depósito
  acumuladoPeriodo: number;  // lo que va acumulado hasta hoy
  deposAnterior: number;     // depósito del período anterior completo
}

function calcularCTS(d: DatosLaborales): ResultadoCTS {
  if (d.regimen === 'micro') {
    return {
      tieneCTS: false, remComp: 0, periodoLabel: '', periodoInicio: new Date(),
      periodoFin: new Date(), meses: 0, dias: 0, depositoEstimado: 0,
      acumuladoPeriodo: 0, deposAnterior: 0,
    };
  }

  // Remuneración computable (RC)
  // 1/6 de cada gratificación semestral = sueldo/6 mensualmente
  const rc = d.sueldoBruto + (d.asignacionFamiliar || 0) + d.sueldoBruto / 6 + (d.horasExtras || 0);

  const hoy = new Date();
  const ingreso = new Date(d.fechaIngreso);

  // Determinar período vigente
  const mesActual = hoy.getMonth(); // 0=ene … 11=dic
  let pIni: Date, pFin: Date, label: string;

  if (mesActual >= 10 || mesActual <= 3) {
    // nov–abr (depósito en mayo)
    const año = mesActual >= 10 ? hoy.getFullYear() : hoy.getFullYear() - 1;
    pIni = new Date(año, 10, 1);   // 1 nov
    pFin = new Date(año + 1, 3, 30); // 30 abr
    label = `Nov ${año} – Abr ${año + 1} (depósito mayo ${año + 1})`;
  } else {
    // may–oct (depósito en noviembre)
    pIni = new Date(hoy.getFullYear(), 4, 1);  // 1 may
    pFin = new Date(hoy.getFullYear(), 9, 31); // 31 oct
    label = `May–Oct ${hoy.getFullYear()} (depósito nov ${hoy.getFullYear()})`;
  }

  // Inicio real del período para este trabajador
  const inicioEfectivo = ingreso > pIni ? ingreso : pIni;
  const finEfectivo = hoy < pFin ? hoy : pFin;

  const { meses, dias } = diffMesesDias(inicioEfectivo, finEfectivo);
  const acumulado = (rc / 12) * (meses + dias / 30);

  // Período anterior completo (6 meses)
  const inicioAnt = ingreso <= pIni ? new Date(pIni.getFullYear(), pIni.getMonth() - 6, 1)
                                     : ingreso;
  const finAnt = new Date(pIni); finAnt.setDate(finAnt.getDate() - 1);
  const difAnt = diffMesesDias(inicioAnt > finAnt ? finAnt : inicioAnt, finAnt);
  const mesesAnt = Math.min(6, difAnt.meses + difAnt.dias / 30);
  const deposAnterior = (rc / 12) * mesesAnt;

  return {
    tieneCTS: true, remComp: rc, periodoLabel: label,
    periodoInicio: pIni, periodoFin: pFin,
    meses, dias, depositoEstimado: acumulado,
    acumuladoPeriodo: acumulado, deposAnterior,
  };
}

// ─── GRATIFICACIÓN ────────────────────────────────────────────────────────────
// Ley 27735 y D.S. 005-2002-TR
// Grati julio  → período ene 1 – jun 30  (pagar primera quincena de julio)
// Grati diciembre → período jul 1 – dic 31 (pagar primera quincena de diciembre)
// Monto = RemComp × mesesCompletos/6  + días residuales
// Bonificación extraordinaria 9% → SOLO régimen general (Ley 29351)
// Microempresa: NO tiene gratificación
// Pequeña empresa: SÍ tiene gratificación pero NO bonificación extraordinaria

interface ResultadoGrati {
  tieneGrati: boolean;
  remComp: number;
  periodoLabel: string;
  meses: number;
  dias: number;
  montoGrati: number;
  bonificacion: number; // 9% solo régimen general
  total: number;
  proxPago: string;
}

function calcularGratificacion(d: DatosLaborales): ResultadoGrati {
  if (d.regimen === 'micro') {
    return {
      tieneGrati: false, remComp: 0, periodoLabel: '', meses: 0,
      dias: 0, montoGrati: 0, bonificacion: 0, total: 0, proxPago: '',
    };
  }

  // Remuneración computable grati = sueldo + asignación familiar
  // (NO incluye 1/6 grati ni horas extras para grati, a diferencia de CTS)
  const rc = d.sueldoBruto + (d.asignacionFamiliar || 0);

  const hoy = new Date();
  const ingreso = new Date(d.fechaIngreso);
  const mesActual = hoy.getMonth(); // 0-11

  // Período vigente
  let pIni: Date, pFin: Date, label: string, proxPago: string;
  if (mesActual <= 5) {
    // Estamos en ene–jun → calculamos grati de julio
    pIni = new Date(hoy.getFullYear(), 0, 1);  // 1 ene
    pFin = new Date(hoy.getFullYear(), 5, 30); // 30 jun
    label = `Ene–Jun ${hoy.getFullYear()}`;
    proxPago = `Primera quincena de julio ${hoy.getFullYear()}`;
  } else {
    // Estamos en jul–dic → calculamos grati de diciembre
    pIni = new Date(hoy.getFullYear(), 6, 1);   // 1 jul
    pFin = new Date(hoy.getFullYear(), 11, 31); // 31 dic
    label = `Jul–Dic ${hoy.getFullYear()}`;
    proxPago = `Primera quincena de diciembre ${hoy.getFullYear()}`;
  }

  // Inicio efectivo para este trabajador en este período
  const inicioEfectivo = ingreso > pIni ? ingreso : pIni;
  const finEfectivo = hoy < pFin ? hoy : pFin;

  if (inicioEfectivo > finEfectivo) {
    return { tieneGrati: true, remComp: rc, periodoLabel: label, meses: 0, dias: 0, montoGrati: 0, bonificacion: 0, total: 0, proxPago };
  }

  const { meses, dias } = diffMesesDias(inicioEfectivo, finEfectivo);

  // Fórmula: RC × (meses + días/30) / 6
  const montoGrati = rc * (meses + dias / 30) / 6;

  // Bonificación extraordinaria: 9% solo régimen general (Ley 29351)
  const bonificacion = d.regimen === 'general' ? montoGrati * 0.09 : 0;

  return {
    tieneGrati: true, remComp: rc, periodoLabel: label,
    meses, dias, montoGrati,
    bonificacion, total: montoGrati + bonificacion,
    proxPago,
  };
}

// ─── LIQUIDACIÓN ──────────────────────────────────────────────────────────────

interface DetalleLinea { concepto: string; monto: number; nota: string; }

interface ResultadoLiquidacion {
  detalles: DetalleLinea[];
  total: number;
}

function calcularLiquidacion(d: DatosLaborales): ResultadoLiquidacion {
  const ingreso = new Date(d.fechaIngreso);
  const cese = new Date(d.fechaCese);
  const detalles: DetalleLinea[] = [];

  // ── 1. CTS proporcional al último período (no depositado aún) ──────────────
  let ctsProp = 0;
  if (d.regimen !== 'micro') {
    const rc = d.sueldoBruto + (d.asignacionFamiliar || 0) + d.sueldoBruto / 6 + (d.horasExtras || 0);
    // Determinar inicio del período en curso al momento del cese
    const mesCese = cese.getMonth();
    const pIniCTS = mesCese >= 10 || mesCese <= 3
      ? new Date(mesCese >= 10 ? cese.getFullYear() : cese.getFullYear() - 1, 10, 1)
      : new Date(cese.getFullYear(), 4, 1);
    const inicioEfectivoCTS = ingreso > pIniCTS ? ingreso : pIniCTS;
    const { meses: mC, dias: dC } = diffMesesDias(inicioEfectivoCTS, cese);
    ctsProp = (rc / 12) * (mC + dC / 30);
    if (ctsProp > 0) detalles.push({ concepto: 'CTS proporcional (período no depositado)', monto: ctsProp, nota: `${mC} meses y ${dC} días` });
  }

  // ── 2. Gratificación trunca (del semestre en curso) ───────────────────────
  let gratiTrunca = 0;
  if (d.regimen !== 'micro') {
    const rcG = d.sueldoBruto + (d.asignacionFamiliar || 0);
    const mesCese = cese.getMonth();
    const pIniG = mesCese <= 5
      ? new Date(cese.getFullYear(), 0, 1)
      : new Date(cese.getFullYear(), 6, 1);
    const inicioEfectivoG = ingreso > pIniG ? ingreso : pIniG;
    const { meses: mG, dias: dG } = diffMesesDias(inicioEfectivoG, cese);
    gratiTrunca = rcG * (mG + dG / 30) / 6;
    const bonG = d.regimen === 'general' ? gratiTrunca * 0.09 : 0;
    gratiTrunca += bonG;
    if (gratiTrunca > 0) detalles.push({ concepto: 'Gratificación trunca', monto: gratiTrunca, nota: `${mG} meses y ${dG} días${bonG > 0 ? ' + bonif. 9%' : ''}` });
  }

  // ── 3. Vacaciones truncas (del año en curso) ──────────────────────────────
  let vacTruncas = 0;
  if (d.regimen !== 'micro') {
    // Año de trabajo actual = desde último aniversario hasta cese
    const ult = new Date(ingreso);
    while (ult <= cese) {
      ult.setFullYear(ult.getFullYear() + 1);
    }
    ult.setFullYear(ult.getFullYear() - 1);
    const { meses: mV, dias: dV } = diffMesesDias(ult, cese);
    vacTruncas = (d.sueldoBruto / 12) * (mV + dV / 30);
    if (vacTruncas > 0) detalles.push({ concepto: 'Vacaciones truncas', monto: vacTruncas, nota: `${mV} meses y ${dV} días del último año` });
  }

  // ── 4. Vacaciones pendientes (días no gozados) ────────────────────────────
  const vacPend = d.regimen !== 'micro' && d.vacacionesPendientes > 0
    ? (d.sueldoBruto / 30) * d.vacacionesPendientes : 0;
  if (vacPend > 0) detalles.push({ concepto: 'Vacaciones no gozadas', monto: vacPend, nota: `${d.vacacionesPendientes} días × (S/ ${(d.sueldoBruto / 30).toFixed(2)}/día)` });

  // ── 5. Indemnización por despido arbitrario ───────────────────────────────
  let indem = 0;
  if (d.tipoCese === 'despido_arbitrario') {
    const años = añosCompletos(ingreso, cese);
    if (d.regimen === 'general') {
      // 1.5 sueldos por año (contrato indeterminado), mínimo 3 meses, máximo 12
      indem = Math.max(d.sueldoBruto * 1.5, d.sueldoBruto * 1.5 * años);
      indem = Math.min(indem, d.sueldoBruto * 12);
      detalles.push({ concepto: 'Indemnización por despido arbitrario', monto: indem, nota: `${años} año(s) — máx. 12 sueldos (régimen general)` });
    } else if (d.regimen === 'pequena') {
      // 20 remuneraciones diarias por año, máx 120 días
      const diariaIndem = d.sueldoBruto / 30;
      indem = Math.min(diariaIndem * 20 * años, diariaIndem * 120);
      detalles.push({ concepto: 'Indemnización por despido arbitrario', monto: indem, nota: `${años} año(s) — máx. 120 días (pequeña empresa)` });
    }
  }

  const total = ctsProp + gratiTrunca + vacTruncas + vacPend + indem;

  if (detalles.length === 0) {
    detalles.push({ concepto: 'Sin beneficios adicionales aplicables', monto: 0, nota: '' });
  }

  return { detalles, total };
}

// ─── Componente ──────────────────────────────────────────────────────────────

type TabCalculo = 'cts' | 'grati' | 'liquidacion';

const RMV = 1025; // Remuneración Mínima Vital 2024 (Perú)

export function CalculosLaborales() {
  const [tab, setTab] = useState<TabCalculo>('cts');
  const [datos, setDatos] = useState<DatosLaborales>({
    sueldoBruto: 0,
    asignacionFamiliar: 0,
    horasExtras: 0,
    fechaIngreso: '',
    fechaCese: new Date().toISOString().split('T')[0],
    regimen: 'general',
    tipoCese: 'renuncia',
    vacacionesPendientes: 0,
  });

  const set = (k: keyof DatosLaborales, v: string | number) =>
    setDatos((prev) => ({ ...prev, [k]: v }));

  const listo = datos.sueldoBruto > 0 && datos.fechaIngreso;
  const cts   = listo ? calcularCTS(datos)           : null;
  const grati = listo ? calcularGratificacion(datos)  : null;
  const liq   = listo && datos.fechaCese ? calcularLiquidacion(datos) : null;

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">CÁLCULOS LABORALES · PERÚ</p>
          <h3 className="fin-card-title">CTS · Gratificación · Liquidación</h3>
        </div>
      </div>

      {/* Datos base */}
      <div className="fin-form">
        <p className="fin-label">Datos del trabajador</p>
        <div className="fin-form-grid">
          <label className="fin-label-inline">
            Sueldo bruto mensual (S/)
            <input className="fin-input" type="number" min="0" step="0.01"
              placeholder={`Mínimo S/ ${RMV}`} value={datos.sueldoBruto || ''}
              onChange={(e) => set('sueldoBruto', Number(e.target.value))}
              aria-label="Sueldo bruto" />
          </label>
          <label className="fin-label-inline">
            Asignación familiar (S/) — si tiene hijos menores
            <input className="fin-input fin-input-sm" type="number" min="0" step="0.01"
              placeholder="S/ 102.50" value={datos.asignacionFamiliar || ''}
              onChange={(e) => set('asignacionFamiliar', Number(e.target.value))}
              aria-label="Asignación familiar" />
          </label>
          <label className="fin-label-inline">
            Fecha de ingreso
            <input className="fin-input" type="date" value={datos.fechaIngreso}
              onChange={(e) => set('fechaIngreso', e.target.value)}
              aria-label="Fecha de ingreso" />
          </label>
          <label className="fin-label-inline">
            Régimen laboral
            <select className="fin-select" value={datos.regimen}
              onChange={(e) => set('regimen', e.target.value as Regimen)}
              aria-label="Régimen">
              <option value="general">Régimen General</option>
              <option value="pequena">Pequeña Empresa (MYPE)</option>
              <option value="micro">Microempresa (sin CTS ni grati)</option>
            </select>
          </label>
          <label className="fin-label-inline">
            Promedio horas extras mensuales (S/)
            <input className="fin-input fin-input-sm" type="number" min="0"
              placeholder="0" value={datos.horasExtras || ''}
              onChange={(e) => set('horasExtras', Number(e.target.value))}
              aria-label="Horas extras" />
          </label>
        </div>
        {datos.sueldoBruto > 0 && datos.sueldoBruto < RMV && (
          <p style={{ color: '#9a2020', fontSize: 11, margin: '6px 0 0' }}>
            ⚠ El sueldo ingresado es menor a la RMV (S/ {RMV}).
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="fin-tabs">
        {(['cts', 'grati', 'liquidacion'] as TabCalculo[]).map((t) => (
          <button key={t} className={`fin-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'cts' ? 'CTS' : t === 'grati' ? 'Gratificación' : 'Liquidación'}
          </button>
        ))}
      </div>

      {!listo && <p className="fin-empty">Ingresá sueldo bruto y fecha de ingreso para calcular.</p>}

      {/* ══ CTS ══ */}
      {tab === 'cts' && cts && (
        <div className="fin-result">
          {!cts.tieneCTS ? (
            <div className="fin-result-note" style={{ marginTop: 16 }}>
              Las <b>microempresas</b> no están obligadas a depositar CTS (Ley N°28015). El trabajador no genera este beneficio.
            </div>
          ) : (
            <>
              <div className="fin-result-hero">
                <p className="eyebrow">DEPÓSITO ESTIMADO PRÓXIMO</p>
                <div className="fin-result-amount">S/ {cts.depositoEstimado.toFixed(2)}</div>
                <small>{cts.meses} meses y {cts.dias} días del período actual · {cts.periodoLabel}</small>
              </div>
              <div className="fin-result-rows">
                <div className="fin-result-row"><span>Sueldo bruto</span><b>S/ {datos.sueldoBruto.toFixed(2)}</b></div>
                {datos.asignacionFamiliar > 0 && <div className="fin-result-row"><span>Asignación familiar</span><b>S/ {datos.asignacionFamiliar.toFixed(2)}</b></div>}
                <div className="fin-result-row"><span>1/6 de gratificación (computable)</span><b>S/ {(datos.sueldoBruto / 6).toFixed(2)}</b></div>
                {datos.horasExtras > 0 && <div className="fin-result-row"><span>Horas extras promedio</span><b>S/ {datos.horasExtras.toFixed(2)}</b></div>}
                <div className="fin-result-row fin-result-row-total"><span>Remuneración computable</span><b>S/ {cts.remComp.toFixed(2)}</b></div>
                <div className="fin-result-row"><span>Depósito por período completo (6 meses)</span><b>S/ {(cts.remComp / 2).toFixed(2)}</b></div>
                <div className="fin-result-row"><span>Acumulado hasta hoy (período vigente)</span><b>S/ {cts.acumuladoPeriodo.toFixed(2)}</b></div>
              </div>
              <div className="fin-result-note">
                <b>¿Cómo se calcula?</b> Remuneración computable ÷ 12 × meses trabajados en el período. Se deposita dos veces al año: hasta el 15 de mayo y hasta el 15 de noviembre en una cuenta CTS a nombre del trabajador.
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ GRATIFICACIÓN ══ */}
      {tab === 'grati' && grati && (
        <div className="fin-result">
          {!grati.tieneGrati ? (
            <div className="fin-result-note" style={{ marginTop: 16 }}>
              Las <b>microempresas</b> no están obligadas a pagar gratificaciones (Ley N°28015).
            </div>
          ) : (
            <>
              <div className="fin-result-hero">
                <p className="eyebrow">GRATIFICACIÓN — {grati.periodoLabel.toUpperCase()}</p>
                <div className="fin-result-amount">S/ {grati.total.toFixed(2)}</div>
                <small>{grati.meses} meses y {grati.dias} días computados · Pago: {grati.proxPago}</small>
              </div>
              <div className="fin-result-rows">
                <div className="fin-result-row"><span>Sueldo bruto</span><b>S/ {datos.sueldoBruto.toFixed(2)}</b></div>
                {datos.asignacionFamiliar > 0 && <div className="fin-result-row"><span>Asignación familiar</span><b>S/ {datos.asignacionFamiliar.toFixed(2)}</b></div>}
                <div className="fin-result-row fin-result-row-total"><span>Remuneración computable grati</span><b>S/ {grati.remComp.toFixed(2)}</b></div>
                <div className="fin-result-row"><span>Fórmula</span><b>S/ {grati.remComp.toFixed(2)} × {grati.meses + grati.dias / 30 < 6 ? `${grati.meses + grati.dias / 30 < 1 ? (grati.dias + '/30') : ((grati.meses) + ' m ' + grati.dias + ' d')}` : '6'} ÷ 6</b></div>
                <div className="fin-result-row"><span>Monto gratificación</span><b>S/ {grati.montoGrati.toFixed(2)}</b></div>
                {grati.bonificacion > 0 && (
                  <div className="fin-result-row"><span>Bonificación extraordinaria (9%) — Ley 29351</span><b>S/ {grati.bonificacion.toFixed(2)}</b></div>
                )}
                {datos.regimen === 'pequena' && (
                  <div className="fin-result-row"><span>Bonificación extraordinaria</span><b>No aplica (pequeña empresa)</b></div>
                )}
                <div className="fin-result-row fin-result-row-total"><span>Total a recibir</span><b>S/ {grati.total.toFixed(2)}</b></div>
              </div>
              <div className="fin-result-note">
                <b>¿Cómo se calcula?</b> Remuneración computable × meses del período ÷ 6. La remuneración computable para grati incluye sueldo básico y asignación familiar, pero NO el 1/6 de grati ni horas extras (a diferencia de la CTS).
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ LIQUIDACIÓN ══ */}
      {tab === 'liquidacion' && (
        <>
          <div className="fin-form" style={{ marginTop: 0 }}>
            <div className="fin-form-grid">
              <label className="fin-label-inline">
                Fecha de cese
                <input className="fin-input" type="date" value={datos.fechaCese}
                  onChange={(e) => set('fechaCese', e.target.value)} aria-label="Fecha de cese" />
              </label>
              <label className="fin-label-inline">
                Motivo del cese
                <select className="fin-select" value={datos.tipoCese}
                  onChange={(e) => set('tipoCese', e.target.value as TipoCese)} aria-label="Motivo">
                  <option value="renuncia">Renuncia voluntaria</option>
                  <option value="despido_arbitrario">Despido arbitrario</option>
                  <option value="mutuo_acuerdo">Mutuo acuerdo</option>
                  <option value="vencimiento">Vencimiento de contrato</option>
                </select>
              </label>
              <label className="fin-label-inline">
                Vacaciones no gozadas (días)
                <input className="fin-input fin-input-sm" type="number" min="0"
                  placeholder="0" value={datos.vacacionesPendientes || ''}
                  onChange={(e) => set('vacacionesPendientes', Number(e.target.value))}
                  aria-label="Vacaciones pendientes" />
              </label>
            </div>
          </div>
          {liq && (
            <div className="fin-result">
              <div className="fin-result-hero">
                <p className="eyebrow">LIQUIDACIÓN TOTAL ESTIMADA</p>
                <div className="fin-result-amount">S/ {liq.total.toFixed(2)}</div>
              </div>
              <div className="fin-result-rows">
                {liq.detalles.map((det, i) => (
                  <div key={i} className="fin-result-row">
                    <span>{det.concepto}{det.nota && <small style={{ display: 'block', color: 'var(--muted)', fontSize: 10 }}>{det.nota}</small>}</span>
                    <b>S/ {det.monto.toFixed(2)}</b>
                  </div>
                ))}
                <div className="fin-result-row fin-result-row-total">
                  <span>TOTAL LIQUIDACIÓN</span><b>S/ {liq.total.toFixed(2)}</b>
                </div>
              </div>
              <div className="fin-result-note">
                Este cálculo incluye los beneficios proporcionales al momento del cese. No incluye CTS ya depositada en cuenta (que el trabajador ya tiene), ni gratificaciones ya cobradas. El empleador tiene 48 horas para entregar la liquidación tras el cese.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
