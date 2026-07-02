'use client';

import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Regimen = 'general' | 'pequena' | 'micro';
type TipoCese = 'renuncia' | 'despido_arbitrario' | 'mutuo_acuerdo' | 'vencimiento';

interface DatosLaborales {
  sueldoBruto: number;
  asignacionFamiliar: number;
  horasExtras: number;
  fechaIngreso: string;
  fechaCese: string;
  regimen: Regimen;
  tipoCese: TipoCese;
  vacacionesPendientes: number;
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

/**
 * Diferencia en meses completos y días residuales.
 * Usa el criterio de 30 días por mes (práctica laboral peruana, D.S. 001-97-TR).
 */
function diffMesesDias(ini: Date, fin: Date): { meses: number; dias: number } {
  if (ini >= fin) return { meses: 0, dias: 0 };
  let m = (fin.getFullYear() - ini.getFullYear()) * 12 + (fin.getMonth() - ini.getMonth());
  let d = fin.getDate() - ini.getDate();
  if (d < 0) { m--; d += 30; }
  return { meses: Math.max(0, m), dias: Math.max(0, d) };
}

function añosCompletos(ini: Date, fin: Date): number {
  const { meses, dias } = diffMesesDias(ini, fin);
  return Math.floor((meses + dias / 30) / 12);
}

// ─── CTS ─────────────────────────────────────────────────────────────────────
/*
  Ley 25920 y D.S. 001-97-TR
  Período nov 1 – abr 30 → depósito hasta 15 de mayo
  Período may 1 – oct 31 → depósito hasta 15 de noviembre
  RC = sueldo + asig. familiar + 1/6 grati + horas extras
  CTS semestral = RC / 12 × meses_trabajados_en_período
  Microempresa: NO tiene CTS (Ley 28015)
*/

interface ResultadoCTS {
  tieneCTS: boolean;
  remComp: number;
  periodoLabel: string;
  meses: number;
  dias: number;
  acumuladoHoy: number;
  depositoSemestral: number; // si trabajó el período completo
  nota: string;
}

function calcularCTS(d: DatosLaborales): ResultadoCTS {
  const vacio: ResultadoCTS = {
    tieneCTS: false, remComp: 0, periodoLabel: '', meses: 0,
    dias: 0, acumuladoHoy: 0, depositoSemestral: 0, nota: '',
  };
  if (d.regimen === 'micro') return vacio;

  const rc = d.sueldoBruto + (d.asignacionFamiliar || 0)
           + d.sueldoBruto / 6            // 1/6 de la grati semestral
           + (d.horasExtras || 0);

  const hoy = new Date();
  const ingreso = new Date(d.fechaIngreso);
  const mes = hoy.getMonth(); // 0=ene … 11=dic

  // Período CTS vigente
  let pIni: Date, pFin: Date, label: string;
  if (mes >= 10 || mes <= 3) {
    // nov–abr
    const año = mes >= 10 ? hoy.getFullYear() : hoy.getFullYear() - 1;
    pIni = new Date(año, 10, 1);
    pFin = new Date(año + 1, 3, 30);
    label = `Nov ${año} – Abr ${año + 1} (depósito hasta 15 mayo ${año + 1})`;
  } else {
    // may–oct
    pIni = new Date(hoy.getFullYear(), 4, 1);
    pFin = new Date(hoy.getFullYear(), 9, 31);
    label = `May ${hoy.getFullYear()} – Oct ${hoy.getFullYear()} (depósito hasta 15 nov ${hoy.getFullYear()})`;
  }

  const inicioEfectivo = ingreso > pIni ? ingreso : pIni;
  const finEfectivo    = hoy < pFin ? hoy : pFin;
  const { meses, dias } = diffMesesDias(inicioEfectivo, finEfectivo);
  const acumuladoHoy    = (rc / 12) * (meses + dias / 30);
  const depositoSemestral = rc / 2; // período completo = 6 meses

  return {
    tieneCTS: true, remComp: rc, periodoLabel: label,
    meses, dias, acumuladoHoy, depositoSemestral,
    nota: `RC = sueldo (S/ ${d.sueldoBruto}) + asig. fam. (S/ ${(d.asignacionFamiliar||0)}) + 1/6 grati (S/ ${(d.sueldoBruto/6).toFixed(2)}) + h.extras (S/ ${(d.horasExtras||0)})`,
  };
}

// ─── GRATIFICACIÓN ───────────────────────────────────────────────────────────
/*
  Ley 27735 y D.S. 005-2002-TR — Ley 29351 (bonificación extraordinaria)

  Grati JULIO     → computa ene 1 – jun 30  → pagar 1ra quincena de julio
  Grati DICIEMBRE → computa jul 1 – dic 31  → pagar 1ra quincena de diciembre

  RC grati = sueldo básico + asignación familiar
  (NO incluye 1/6 grati ni horas extras — eso es solo CTS)

  Monto = RC × meses_computados / 6
  Bonificación extraordinaria 9%: SOLO régimen general (Ley 29351)
  Pequeña empresa: SÍ tiene grati pero SIN bonificación extraordinaria
  Microempresa: SIN grati
*/

interface ResultadoGratiPeriodo {
  label: string;        // "Grati Julio 2026"
  periodoComp: string;  // "Ene–Jun 2026"
  meses: number;
  dias: number;
  montoGrati: number;
  bonificacion: number;
  total: number;
  proxPago: string;
  yaVencio: boolean;    // si ya pasó la quincena de pago
}

interface ResultadoGrati {
  tieneGrati: boolean;
  remComp: number;
  julio: ResultadoGratiPeriodo;
  diciembre: ResultadoGratiPeriodo;
}

function calcularUnPeriodoGrati(
  rc: number,
  ingreso: Date,
  pIni: Date,
  pFin: Date,
  hoy: Date,
  regimen: Regimen,
  labelGrati: string,
  proxPago: string,
): ResultadoGratiPeriodo {
  // Si el período todavía no empieza (futuro), devolver 0
  if (pIni > hoy) {
    return { label: labelGrati, periodoComp: `${pIni.toLocaleDateString('es-PE',{month:'short'})}–${pFin.toLocaleDateString('es-PE',{month:'short',year:'numeric'})}`, meses: 0, dias: 0, montoGrati: 0, bonificacion: 0, total: 0, proxPago, yaVencio: false };
  }

  const inicioEfectivo = ingreso > pIni ? ingreso : pIni;
  const finEfectivo    = hoy < pFin ? hoy : pFin;

  if (inicioEfectivo > finEfectivo) {
    return { label: labelGrati, periodoComp: '', meses: 0, dias: 0, montoGrati: 0, bonificacion: 0, total: 0, proxPago, yaVencio: pFin < hoy };
  }

  const { meses, dias } = diffMesesDias(inicioEfectivo, finEfectivo);
  const montoGrati  = rc * (meses + dias / 30) / 6;
  const bonificacion = regimen === 'general' ? montoGrati * 0.09 : 0;
  const total        = montoGrati + bonificacion;

  const periodoComp = `${pIni.toLocaleDateString('es-PE',{month:'short'})}–${pFin.toLocaleDateString('es-PE',{month:'short',year:'numeric'})}`;

  return { label: labelGrati, periodoComp, meses, dias, montoGrati, bonificacion, total, proxPago, yaVencio: pFin < hoy };
}

function calcularGratificacion(d: DatosLaborales): ResultadoGrati {
  if (d.regimen === 'micro') {
    const vacio: ResultadoGratiPeriodo = { label: '', periodoComp: '', meses: 0, dias: 0, montoGrati: 0, bonificacion: 0, total: 0, proxPago: '', yaVencio: false };
    return { tieneGrati: false, remComp: 0, julio: vacio, diciembre: vacio };
  }

  const rc      = d.sueldoBruto + (d.asignacionFamiliar || 0);
  const hoy     = new Date();
  const ingreso = new Date(d.fechaIngreso);
  const año     = hoy.getFullYear();

  // Grati julio → período ene–jun del año actual
  const julioIni = new Date(año, 0, 1);
  const julioFin = new Date(año, 5, 30);
  const julio = calcularUnPeriodoGrati(
    rc, ingreso, julioIni, julioFin, hoy, d.regimen,
    `Gratificación Julio ${año}`,
    `1ra quincena de julio ${año}`,
  );

  // Grati diciembre → período jul–dic del año actual
  const dicIni = new Date(año, 6, 1);
  const dicFin = new Date(año, 11, 31);
  const diciembre = calcularUnPeriodoGrati(
    rc, ingreso, dicIni, dicFin, hoy, d.regimen,
    `Gratificación Diciembre ${año}`,
    `1ra quincena de diciembre ${año}`,
  );

  return { tieneGrati: true, remComp: rc, julio, diciembre };
}

// ─── LIQUIDACIÓN ──────────────────────────────────────────────────────────────
/*
  Al cese el empleador debe liquidar:
  1. CTS proporcional del período no depositado
  2. Gratificación trunca (proporcional al semestre en curso)
  3. Vacaciones truncas (días del año en curso no descansados)
  4. Vacaciones pendientes (días ya ganados y no gozados)
  5. Indemnización por despido arbitrario (solo si aplica)

  Régimen general:
    - Indemnización = 1.5 sueldos × años completos (min 3 meses, max 12 sueldos)
  Pequeña empresa:
    - Indemnización = 20 días de sueldo × años completos (max 120 días)
  Microempresa:
    - No tiene CTS, grati ni indemnización
*/

interface DetalleLinea { concepto: string; monto: number; nota: string; }
interface ResultadoLiquidacion { detalles: DetalleLinea[]; total: number; }

function calcularLiquidacion(d: DatosLaborales): ResultadoLiquidacion {
  const ingreso = new Date(d.fechaIngreso);
  const cese    = new Date(d.fechaCese);
  if (ingreso >= cese) return { detalles: [{ concepto: 'Fecha de cese debe ser posterior al ingreso', monto: 0, nota: '' }], total: 0 };

  const detalles: DetalleLinea[] = [];

  if (d.regimen !== 'micro') {
    const rc = d.sueldoBruto + (d.asignacionFamiliar || 0)
             + d.sueldoBruto / 6 + (d.horasExtras || 0);

    // 1. CTS proporcional al período no depositado
    const mesCese = cese.getMonth();
    const pIniCTS = (mesCese >= 10 || mesCese <= 3)
      ? new Date(mesCese >= 10 ? cese.getFullYear() : cese.getFullYear() - 1, 10, 1)
      : new Date(cese.getFullYear(), 4, 1);
    const inicioEfCTS = ingreso > pIniCTS ? ingreso : pIniCTS;
    const { meses: mC, dias: dC } = diffMesesDias(inicioEfCTS, cese);
    const ctsProp = (rc / 12) * (mC + dC / 30);
    if (ctsProp > 0.01)
      detalles.push({ concepto: 'CTS proporcional (período pendiente de depósito)', monto: ctsProp, nota: `${mC} mes${mC!==1?'es':''} y ${dC} días · RC = S/ ${rc.toFixed(2)}` });

    // 2. Gratificación trunca del semestre en curso
    const rcG = d.sueldoBruto + (d.asignacionFamiliar || 0);
    const pIniG = mesCese <= 5
      ? new Date(cese.getFullYear(), 0, 1)
      : new Date(cese.getFullYear(), 6, 1);
    const inicioEfG = ingreso > pIniG ? ingreso : pIniG;
    const { meses: mG, dias: dG } = diffMesesDias(inicioEfG, cese);
    const montoGT   = rcG * (mG + dG / 30) / 6;
    const bonGT     = d.regimen === 'general' ? montoGT * 0.09 : 0;
    const gratiT    = montoGT + bonGT;
    if (gratiT > 0.01) {
      const periodoGLabel = mesCese <= 5 ? `ene–${cese.toLocaleDateString('es-PE',{month:'short'})} ${cese.getFullYear()}` : `jul–${cese.toLocaleDateString('es-PE',{month:'short'})} ${cese.getFullYear()}`;
      detalles.push({ concepto: 'Gratificación trunca', monto: gratiT, nota: `${mG} mes${mG!==1?'es':''} y ${dG} días (${periodoGLabel})${bonGT>0?' + bonif. extraord. 9%':''}` });
    }

    // 3. Vacaciones truncas del año en curso (desde último aniversario)
    let ultAniv = new Date(ingreso);
    while (ultAniv <= cese) ultAniv.setFullYear(ultAniv.getFullYear() + 1);
    ultAniv.setFullYear(ultAniv.getFullYear() - 1);
    const { meses: mV, dias: dV } = diffMesesDias(ultAniv, cese);
    const vacTruncas = (d.sueldoBruto / 12) * (mV + dV / 30);
    if (vacTruncas > 0.01)
      detalles.push({ concepto: 'Vacaciones truncas', monto: vacTruncas, nota: `${mV} mes${mV!==1?'es':''} y ${dV} días del último año laboral` });

    // 4. Vacaciones no gozadas
    if (d.vacacionesPendientes > 0) {
      const vacPend = (d.sueldoBruto / 30) * d.vacacionesPendientes;
      detalles.push({ concepto: 'Vacaciones no gozadas', monto: vacPend, nota: `${d.vacacionesPendientes} días × S/ ${(d.sueldoBruto/30).toFixed(2)}/día` });
    }
  } else {
    // Microempresa: solo vacaciones si las acumuló
    if (d.vacacionesPendientes > 0) {
      const vacPend = (d.sueldoBruto / 30) * d.vacacionesPendientes;
      detalles.push({ concepto: 'Vacaciones no gozadas', monto: vacPend, nota: `${d.vacacionesPendientes} días × S/ ${(d.sueldoBruto/30).toFixed(2)}/día` });
    }
  }

  // 5. Indemnización por despido arbitrario
  if (d.tipoCese === 'despido_arbitrario') {
    const años = añosCompletos(ingreso, cese);
    if (d.regimen === 'general') {
      // LPCL Art. 38: 1.5 remuneraciones por año, mínimo 3 meses, máximo 12 remuneraciones
      const indemBruta = d.sueldoBruto * 1.5 * Math.max(1, años);
      const indem = Math.min(Math.max(indemBruta, d.sueldoBruto * 3), d.sueldoBruto * 12);
      detalles.push({ concepto: 'Indemnización por despido arbitrario', monto: indem, nota: `${años} año${años!==1?'s':''} completo${años!==1?'s':''} · mín. 3 sueldos · máx. 12 sueldos (Régimen General)` });
    } else if (d.regimen === 'pequena') {
      // D.Leg. 1086: 20 días por año, máx 120 días
      const diariaIndem = d.sueldoBruto / 30;
      const indem = Math.min(diariaIndem * 20 * Math.max(1, años), diariaIndem * 120);
      detalles.push({ concepto: 'Indemnización por despido arbitrario', monto: indem, nota: `${años} año${años!==1?'s':''} · máx. 120 días (Pequeña Empresa)` });
    }
  }

  const total = detalles.reduce((s, d) => s + d.monto, 0);
  if (detalles.length === 0)
    detalles.push({ concepto: 'No corresponden beneficios adicionales al cese', monto: 0, nota: '' });

  return { detalles, total };
}

// ─── Componente ──────────────────────────────────────────────────────────────

type TabCalculo = 'cts' | 'grati' | 'liquidacion';
const RMV = 1025; // RMV Perú vigente 2025

// Bloque de un período de gratificación
function BloquePeriodo({ p, regimen, remComp }: { p: ReturnType<typeof calcularGratificacion>['julio']; regimen: Regimen; remComp: number }) {
  const pagada = p.yaVencio && p.total > 0;
  return (
    <div className={`fin-grati-periodo${pagada ? ' pagada' : ''}`}>
      <div className="fin-grati-periodo-header">
        <div>
          <b>{p.label}</b>
          <span className="fin-grati-periodo-sub">Período: {p.periodoComp}</span>
        </div>
        <div className="fin-result-row-total" style={{ textAlign: 'right', padding: 0 }}>
          <b style={{ fontFamily: 'inherit', fontSize: 22, color: p.total > 0 ? 'var(--fd-accent, var(--accent))' : 'var(--muted)' }}>
            S/ {p.total.toFixed(2)}
          </b>
        </div>
      </div>
      {pagada && <div className="fin-grati-pagada-badge">✓ Período cerrado — ya debería haberse pagado</div>}
      {p.total > 0 && (
        <div className="fin-result-rows" style={{ marginTop: 8 }}>
          <div className="fin-result-row"><span>Remuneración computable</span><b>S/ {remComp.toFixed(2)}</b></div>
          <div className="fin-result-row"><span>Meses computados</span><b>{p.meses} m {p.dias} d de 6 meses</b></div>
          <div className="fin-result-row"><span>Fórmula</span><b>S/ {remComp.toFixed(2)} × ({p.meses}+{p.dias}/30) ÷ 6</b></div>
          <div className="fin-result-row"><span>Monto gratificación</span><b>S/ {p.montoGrati.toFixed(2)}</b></div>
          {p.bonificacion > 0 && <div className="fin-result-row"><span>Bonificación extraordinaria (9%)</span><b>S/ {p.bonificacion.toFixed(2)}</b></div>}
          {regimen === 'pequena' && <div className="fin-result-row"><span>Bonificación extraordinaria</span><b>No aplica (pequeña empresa)</b></div>}
        </div>
      )}
      {p.total === 0 && p.meses === 0 && !p.yaVencio && (
        <p style={{ fontSize: 11, color: 'var(--muted)', padding: '8px 0 0' }}>
          {p.label.includes('Julio') ? 'El período ene–jun aún no comenzó o el trabajador ingresó después del cierre.' : 'El período jul–dic aún no comenzó.'}
        </p>
      )}
      {p.total > 0 && <div className="fin-grati-pago"><span>📅 Fecha de pago:</span> <b>{p.proxPago}</b></div>}
    </div>
  );
}

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

      {/* Datos del trabajador */}
      <div className="fin-form">
        <p className="fin-label">Datos del trabajador</p>
        <div className="fin-form-grid">
          <label className="fin-label-inline">
            Sueldo bruto mensual (S/)
            <input className="fin-input" type="number" min="0" step="0.01"
              placeholder={`Mín. S/ ${RMV} (RMV)`} value={datos.sueldoBruto || ''}
              onChange={(e) => set('sueldoBruto', Number(e.target.value))} />
          </label>
          <label className="fin-label-inline">
            Asignación familiar (S/) — si tiene hijos menores de edad
            <input className="fin-input fin-input-sm" type="number" min="0" step="0.01"
              placeholder="S/ 102.50" value={datos.asignacionFamiliar || ''}
              onChange={(e) => set('asignacionFamiliar', Number(e.target.value))} />
          </label>
          <label className="fin-label-inline">
            Fecha de ingreso
            <input className="fin-input" type="date" value={datos.fechaIngreso}
              onChange={(e) => set('fechaIngreso', e.target.value)} />
          </label>
          <label className="fin-label-inline">
            Régimen laboral
            <select className="fin-select" value={datos.regimen}
              onChange={(e) => set('regimen', e.target.value as Regimen)}>
              <option value="general">Régimen General</option>
              <option value="pequena">Pequeña Empresa (MYPE)</option>
              <option value="micro">Microempresa (sin CTS ni grati)</option>
            </select>
          </label>
          <label className="fin-label-inline">
            Promedio horas extras mensuales (S/)
            <input className="fin-input fin-input-sm" type="number" min="0"
              placeholder="0" value={datos.horasExtras || ''}
              onChange={(e) => set('horasExtras', Number(e.target.value))} />
          </label>
        </div>
        {datos.sueldoBruto > 0 && datos.sueldoBruto < RMV && (
          <p style={{ color: '#9a2020', fontSize: 11, margin: '6px 0 0' }}>
            ⚠ El sueldo es menor a la RMV vigente (S/ {RMV}).
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
              Las <b>microempresas</b> no depositan CTS (Ley N°28015). No aplica para este régimen.
            </div>
          ) : (
            <>
              <div className="fin-result-hero">
                <p className="eyebrow">ACUMULADO PERÍODO VIGENTE</p>
                <div className="fin-result-amount">S/ {cts.acumuladoHoy.toFixed(2)}</div>
                <small>{cts.meses} meses y {cts.dias} días · {cts.periodoLabel}</small>
              </div>
              <div className="fin-result-rows">
                <div className="fin-result-row"><span>Sueldo bruto</span><b>S/ {datos.sueldoBruto.toFixed(2)}</b></div>
                {datos.asignacionFamiliar > 0 && <div className="fin-result-row"><span>Asignación familiar</span><b>S/ {datos.asignacionFamiliar.toFixed(2)}</b></div>}
                <div className="fin-result-row"><span>+ 1/6 gratificación semestral</span><b>S/ {(datos.sueldoBruto / 6).toFixed(2)}</b></div>
                {datos.horasExtras > 0 && <div className="fin-result-row"><span>+ Horas extras promedio</span><b>S/ {datos.horasExtras.toFixed(2)}</b></div>}
                <div className="fin-result-row fin-result-row-total"><span>Remuneración computable (RC)</span><b>S/ {cts.remComp.toFixed(2)}</b></div>
                <div className="fin-result-row"><span>Depósito semestral completo (RC ÷ 2)</span><b>S/ {cts.depositoSemestral.toFixed(2)}</b></div>
                <div className="fin-result-row"><span>Depósito diario equivalente (RC ÷ 360)</span><b>S/ {(cts.remComp / 360).toFixed(4)}</b></div>
              </div>
              <div className="fin-result-note">
                <b>Fórmula:</b> RC ÷ 12 × meses_del_período.<br />
                El empleador deposita dos veces al año: hasta el <b>15 de mayo</b> y el <b>15 de noviembre</b>,
                en una cuenta CTS intangible a nombre del trabajador.
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ GRATIFICACIÓN (JULIO + DICIEMBRE) ══ */}
      {tab === 'grati' && grati && (
        <div className="fin-result">
          {!grati.tieneGrati ? (
            <div className="fin-result-note" style={{ marginTop: 16 }}>
              Las <b>microempresas</b> no pagan gratificaciones (Ley N°28015).
            </div>
          ) : (
            <>
              <div className="fin-grati-rc-row">
                <span className="eyebrow">REMUNERACIÓN COMPUTABLE</span>
                <b>S/ {grati.remComp.toFixed(2)}</b>
                <small>(sueldo + asig. familiar · sin 1/6 grati ni h.extras)</small>
              </div>

              {/* GRATI JULIO */}
              <BloquePeriodo p={grati.julio} regimen={datos.regimen} remComp={grati.remComp} />

              {/* GRATI DICIEMBRE */}
              <BloquePeriodo p={grati.diciembre} regimen={datos.regimen} remComp={grati.remComp} />

              <div className="fin-grati-total">
                <span>Total gratificaciones {new Date().getFullYear()}</span>
                <strong>S/ {(grati.julio.total + grati.diciembre.total).toFixed(2)}</strong>
              </div>

              <div className="fin-result-note">
                <b>Ley 27735:</b> El trabajador tiene derecho a una gratificación equivalente a una remuneración
                mensual por cada período semestral completo trabajado. Si no completó el semestre, recibe
                el proporcional de meses y días. La <b>bonificación extraordinaria del 9%</b> (Ley 29351) aplica solo
                en Régimen General y equivale al aporte a EsSalud que el empleador no hace sobre la grati.
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
                  onChange={(e) => set('fechaCese', e.target.value)} />
              </label>
              <label className="fin-label-inline">
                Motivo del cese
                <select className="fin-select" value={datos.tipoCese}
                  onChange={(e) => set('tipoCese', e.target.value as TipoCese)}>
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
                  onChange={(e) => set('vacacionesPendientes', Number(e.target.value))} />
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
                    <span>
                      {det.concepto}
                      {det.nota && <small style={{ display: 'block', color: 'var(--muted)', fontSize: 10 }}>{det.nota}</small>}
                    </span>
                    <b>S/ {det.monto.toFixed(2)}</b>
                  </div>
                ))}
                <div className="fin-result-row fin-result-row-total">
                  <span>TOTAL LIQUIDACIÓN</span><b>S/ {liq.total.toFixed(2)}</b>
                </div>
              </div>
              <div className="fin-result-note">
                No incluye la CTS ya depositada en cuenta (el trabajador ya la tiene) ni las gratificaciones
                previamente cobradas. El empleador tiene <b>48 horas</b> para entregar la liquidación desde el cese.
                Los montos son referenciales — la liquidación formal la calcula el área de RRHH.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
