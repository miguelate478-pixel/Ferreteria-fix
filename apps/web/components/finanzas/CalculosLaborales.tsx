'use client';

import { useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Regimen = 'general' | 'pequena' | 'micro';
type TipoCese = 'renuncia' | 'despido_arbitrario' | 'mutuo_acuerdo' | 'vencimiento';

interface DatosLaborales {
  sueldoBruto: number;
  fechaIngreso: string;
  fechaCese: string;
  regimen: Regimen;
  tipoCese: TipoCese;
  vacacionesPendientes: number; // días
  horasExtras: number;          // monto mensual extra
}

interface ResultadoCTS {
  remuneracionComputable: number;
  mesesCTS: number;
  diasCTS: number;
  montoTotal: number;
  porPeriodo: { periodo: string; monto: number }[];
}

interface ResultadoGrati {
  remuneracionComputable: number;
  mesesTrabajados: number;
  montoGrati: number;
  bonificacionExtraordinaria: number;
  totalNeto: number;
  periodoActual: string;
}

interface ResultadoLiquidacion {
  cts: number;
  gratificaciones: number;
  vacaciones: number;
  indemizacion: number;
  utilidades: number;
  total: number;
  detalles: Array<{ concepto: string; monto: number; nota?: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diffMesesDias(inicio: string, fin: string): { meses: number; dias: number; totalMeses: number } {
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  let meses = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  let dias = d2.getDate() - d1.getDate();
  if (dias < 0) { meses--; dias += 30; }
  return { meses: Math.max(0, meses), dias: Math.max(0, dias), totalMeses: Math.max(0, meses + dias / 30) };
}

function calcularCTS(d: DatosLaborales): ResultadoCTS {
  // Remuneración computable = sueldo + 1/6 gratificación + horas extras
  const gratoMensual = d.sueldoBruto / 6;
  const remComp = d.sueldoBruto + gratoMensual + (d.horasExtras || 0);

  const inicio = new Date(d.fechaIngreso);
  const hoy = new Date();

  // CTS se deposita en mayo (nov–abr) y noviembre (may–oct)
  // Calculamos los períodos completos desde ingreso hasta hoy
  const periodos: { periodo: string; monto: number }[] = [];

  // Período actual simplificado
  const { meses, dias, totalMeses } = diffMesesDias(d.fechaIngreso, hoy.toISOString().split('T')[0]);
  const mesesCTS = meses;
  const diasCTS = dias;
  const montoTotal = (remComp / 12) * totalMeses;

  // Períodos referenciales
  const añoActual = hoy.getFullYear();
  for (let a = inicio.getFullYear(); a <= añoActual; a++) {
    periodos.push({ periodo: `Mayo ${a} (nov–abr ${a - 1}/${a})`, monto: remComp / 2 });
    periodos.push({ periodo: `Nov ${a} (may–oct ${a})`, monto: remComp / 2 });
  }

  return {
    remuneracionComputable: remComp,
    mesesCTS,
    diasCTS,
    montoTotal,
    porPeriodo: periodos.slice(-4),
  };
}

function calcularGratificacion(d: DatosLaborales): ResultadoGrati {
  const hoy = new Date();
  const mes = hoy.getMonth() + 1; // 1-12
  const esDic = mes >= 7 && mes <= 12;
  const periodoActual = esDic ? 'Diciembre (ene–jun)' : 'Julio (jul–dic)';

  const inicioGrati = esDic
    ? new Date(hoy.getFullYear(), 0, 1)   // 1 ene
    : new Date(hoy.getFullYear(), 6, 1);  // 1 jul

  const finGrati = esDic
    ? new Date(hoy.getFullYear(), 5, 30)  // 30 jun
    : new Date(hoy.getFullYear(), 11, 31);// 31 dic

  const fechaRef = hoy < finGrati ? hoy : finGrati;
  const { totalMeses } = diffMesesDias(
    (hoy > inicioGrati ? inicioGrati : new Date(d.fechaIngreso)).toISOString().split('T')[0],
    fechaRef.toISOString().split('T')[0],
  );

  const mesesTrabajados = Math.min(6, Math.max(0, totalMeses));
  const montoGrati = d.sueldoBruto * (mesesTrabajados / 6);

  // Bonificación extraordinaria: 9% del monto grati (régimen general)
  const bonificacion = d.regimen === 'general' ? montoGrati * 0.09 : 0;

  return {
    remuneracionComputable: d.sueldoBruto,
    mesesTrabajados: Math.round(mesesTrabajados * 10) / 10,
    montoGrati,
    bonificacionExtraordinaria: bonificacion,
    totalNeto: montoGrati + bonificacion,
    periodoActual,
  };
}

function calcularLiquidacion(d: DatosLaborales): ResultadoLiquidacion {
  const { totalMeses } = diffMesesDias(d.fechaIngreso, d.fechaCese);
  const añosTrabajados = totalMeses / 12;

  // CTS acumulada (simplificada)
  const gratoMensual = d.sueldoBruto / 6;
  const remComp = d.sueldoBruto + gratoMensual;
  const cts = (remComp / 12) * totalMeses;

  // Gratificaciones pendientes (proporcional al último semestre)
  const mesesUltimoSem = Math.min(6, totalMeses % 6 || 6);
  const grati = d.sueldoBruto * (mesesUltimoSem / 6);
  const bonGrati = d.regimen === 'general' ? grati * 0.09 : 0;
  const gratiTotal = grati + bonGrati;

  // Vacaciones (truncas + pendientes)
  const vacTruncas = d.sueldoBruto * (totalMeses % 12) / 12;
  const vacPendientes = (d.sueldoBruto / 30) * d.vacacionesPendientes;
  const vacTotal = vacTruncas + vacPendientes;

  // Indemnización (solo si aplica)
  let indemnizacion = 0;
  const tieneIndem = d.tipoCese === 'despido_arbitrario';
  if (tieneIndem && d.regimen === 'general') {
    indemnizacion = d.sueldoBruto * Math.min(12, añosTrabajados);
  } else if (tieneIndem && d.regimen === 'pequena') {
    indemnizacion = (d.sueldoBruto / 2) * Math.min(12, añosTrabajados);
  }

  const detalles: Array<{ concepto: string; monto: number; nota?: string }> = [
    { concepto: 'CTS acumulada', monto: cts, nota: `${Math.round(totalMeses * 10) / 10} meses` },
    { concepto: 'Gratificación proporcional', monto: gratiTotal, nota: `${mesesUltimoSem} meses + bonif.` },
    { concepto: 'Vacaciones truncas', monto: vacTruncas, nota: `${Math.round(totalMeses % 12 * 10) / 10} meses no gozados` },
  ];

  if (d.vacacionesPendientes > 0) {
    detalles.push({ concepto: 'Vacaciones pendientes', monto: vacPendientes, nota: `${d.vacacionesPendientes} días` });
  }

  if (indemnizacion > 0) {
    detalles.push({ concepto: 'Indemnización por despido arbitrario', monto: indemnizacion, nota: `${Math.round(añosTrabajados * 10) / 10} años` });
  }

  const total = cts + gratiTotal + vacTotal + indemnizacion;

  return { cts, gratificaciones: gratiTotal, vacaciones: vacTotal, indemizacion: indemnizacion, utilidades: 0, total, detalles };
}

// ─── Componente ──────────────────────────────────────────────────────────────

type TabCalculo = 'cts' | 'grati' | 'liquidacion';

export function CalculosLaborales() {
  const [tab, setTab] = useState<TabCalculo>('cts');
  const [datos, setDatos] = useState<DatosLaborales>({
    sueldoBruto: 0,
    fechaIngreso: '',
    fechaCese: new Date().toISOString().split('T')[0],
    regimen: 'general',
    tipoCese: 'renuncia',
    vacacionesPendientes: 0,
    horasExtras: 0,
  });

  const set = (k: keyof DatosLaborales, v: string | number) =>
    setDatos((prev) => ({ ...prev, [k]: v }));

  const listo = datos.sueldoBruto > 0 && datos.fechaIngreso;

  const cts = listo ? calcularCTS(datos) : null;
  const grati = listo ? calcularGratificacion(datos) : null;
  const liq = listo && datos.fechaCese ? calcularLiquidacion(datos) : null;

  return (
    <div className="fin-card">
      <div className="fin-card-header">
        <div>
          <p className="eyebrow">CÁLCULOS LABORALES</p>
          <h3 className="fin-card-title">CTS · Gratificación · Liquidación</h3>
        </div>
      </div>

      {/* Datos base */}
      <div className="fin-form">
        <p className="fin-label">Datos del trabajador</p>
        <div className="fin-form-grid">
          <label className="fin-label-inline">
            Sueldo bruto mensual (S/)
            <input
              className="fin-input"
              type="number" min="0" step="0.01"
              placeholder="Ej. 1500"
              value={datos.sueldoBruto || ''}
              onChange={(e) => set('sueldoBruto', Number(e.target.value))}
              aria-label="Sueldo bruto"
            />
          </label>
          <label className="fin-label-inline">
            Fecha de ingreso
            <input
              className="fin-input"
              type="date"
              value={datos.fechaIngreso}
              onChange={(e) => set('fechaIngreso', e.target.value)}
              aria-label="Fecha de ingreso"
            />
          </label>
          <label className="fin-label-inline">
            Régimen laboral
            <select className="fin-select" value={datos.regimen} onChange={(e) => set('regimen', e.target.value as Regimen)} aria-label="Régimen">
              <option value="general">Régimen General</option>
              <option value="pequena">Pequeña Empresa (MYPE)</option>
              <option value="micro">Microempresa</option>
            </select>
          </label>
          <label className="fin-label-inline">
            Horas extras mensuales (S/)
            <input
              className="fin-input fin-input-sm"
              type="number" min="0"
              placeholder="0"
              value={datos.horasExtras || ''}
              onChange={(e) => set('horasExtras', Number(e.target.value))}
              aria-label="Horas extras"
            />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="fin-tabs">
        {(['cts', 'grati', 'liquidacion'] as TabCalculo[]).map((t) => (
          <button
            key={t}
            className={`fin-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'cts' ? 'CTS' : t === 'grati' ? 'Gratificación' : 'Liquidación'}
          </button>
        ))}
      </div>

      {!listo && (
        <p className="fin-empty">Ingresá sueldo bruto y fecha de ingreso para calcular.</p>
      )}

      {/* ── CTS ── */}
      {tab === 'cts' && cts && (
        <div className="fin-result">
          <div className="fin-result-hero">
            <p className="eyebrow">CTS ESTIMADA</p>
            <div className="fin-result-amount">S/ {cts.montoTotal.toFixed(2)}</div>
            <small>{cts.mesesCTS} meses y {cts.diasCTS} días trabajados</small>
          </div>
          <div className="fin-result-rows">
            <div className="fin-result-row"><span>Remuneración computable</span><b>S/ {cts.remuneracionComputable.toFixed(2)}</b></div>
            <div className="fin-result-row"><span>Sueldo base</span><b>S/ {datos.sueldoBruto.toFixed(2)}</b></div>
            <div className="fin-result-row"><span>1/6 gratificación</span><b>S/ {(datos.sueldoBruto / 6).toFixed(2)}</b></div>
            {datos.horasExtras > 0 && <div className="fin-result-row"><span>Horas extras</span><b>S/ {datos.horasExtras.toFixed(2)}</b></div>}
            <div className="fin-result-row fin-result-row-total"><span>Depósito semestral estimado</span><b>S/ {(cts.remuneracionComputable / 2).toFixed(2)}</b></div>
          </div>
          <div className="fin-result-note">
            La CTS se deposita en mayo y noviembre. El empleador deposita el equivalente a 1 remuneración por año (1/2 por semestre).
          </div>
        </div>
      )}

      {/* ── Gratificación ── */}
      {tab === 'grati' && grati && (
        <div className="fin-result">
          <div className="fin-result-hero">
            <p className="eyebrow">GRATIFICACIÓN — {grati.periodoActual.toUpperCase()}</p>
            <div className="fin-result-amount">S/ {grati.totalNeto.toFixed(2)}</div>
            <small>{grati.mesesTrabajados} meses del período computados</small>
          </div>
          <div className="fin-result-rows">
            <div className="fin-result-row"><span>Remuneración computable</span><b>S/ {grati.remuneracionComputable.toFixed(2)}</b></div>
            <div className="fin-result-row"><span>Meses del período</span><b>{grati.mesesTrabajados} de 6</b></div>
            <div className="fin-result-row"><span>Monto gratificación</span><b>S/ {grati.montoGrati.toFixed(2)}</b></div>
            {grati.bonificacionExtraordinaria > 0 && (
              <div className="fin-result-row"><span>Bonificación extraordinaria (9%)</span><b>S/ {grati.bonificacionExtraordinaria.toFixed(2)}</b></div>
            )}
            <div className="fin-result-row fin-result-row-total"><span>Total a recibir</span><b>S/ {grati.totalNeto.toFixed(2)}</b></div>
          </div>
          <div className="fin-result-note">
            Se paga en julio y diciembre. La bonificación extraordinaria del 9% aplica solo en régimen general (equivale al aporte que no se hace a EsSalud).
          </div>
        </div>
      )}

      {/* ── Liquidación ── */}
      {tab === 'liquidacion' && (
        <>
          <div className="fin-form" style={{ marginTop: 0 }}>
            <div className="fin-form-grid">
              <label className="fin-label-inline">
                Fecha de cese
                <input
                  className="fin-input"
                  type="date"
                  value={datos.fechaCese}
                  onChange={(e) => set('fechaCese', e.target.value)}
                  aria-label="Fecha de cese"
                />
              </label>
              <label className="fin-label-inline">
                Motivo del cese
                <select className="fin-select" value={datos.tipoCese} onChange={(e) => set('tipoCese', e.target.value as TipoCese)} aria-label="Tipo de cese">
                  <option value="renuncia">Renuncia voluntaria</option>
                  <option value="despido_arbitrario">Despido arbitrario</option>
                  <option value="mutuo_acuerdo">Mutuo acuerdo</option>
                  <option value="vencimiento">Vencimiento de contrato</option>
                </select>
              </label>
              <label className="fin-label-inline">
                Vacaciones pendientes (días)
                <input
                  className="fin-input fin-input-sm"
                  type="number" min="0"
                  placeholder="0"
                  value={datos.vacacionesPendientes || ''}
                  onChange={(e) => set('vacacionesPendientes', Number(e.target.value))}
                  aria-label="Días de vacaciones pendientes"
                />
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
                {liq.detalles.map((d, i) => (
                  <div key={i} className="fin-result-row">
                    <span>
                      {d.concepto}
                      {d.nota && <small style={{ display: 'block', color: 'var(--muted)', fontSize: 10 }}>{d.nota}</small>}
                    </span>
                    <b>S/ {d.monto.toFixed(2)}</b>
                  </div>
                ))}
                <div className="fin-result-row fin-result-row-total">
                  <span>TOTAL LIQUIDACIÓN</span>
                  <b>S/ {liq.total.toFixed(2)}</b>
                </div>
              </div>
              <div className="fin-result-note">
                Cálculo referencial. Los montos exactos dependen de los depósitos de CTS realizados, gratificaciones ya cobradas y lo que determine la liquidación formal de tu empresa. Consultá con un especialista laboral para casos complejos.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
