'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GastosTracker } from '../../components/finanzas/GastosTracker';
import { PlanAhorro } from '../../components/finanzas/PlanAhorro';
import { CalculosLaborales } from '../../components/finanzas/CalculosLaborales';

type Tab = 'gastos' | 'ahorro' | 'laboral';

export default function FinanzasPage() {
  const [tab, setTab] = useState<Tab>('gastos');

  return (
    <main className="fin-shell">
      {/* ── header ── */}
      <header className="fin-topbar">
        <div className="brand-lockup compact">
          <span className="brand-mark" style={{ fontFamily: 'Georgia, serif' }}>$</span>
          <div>
            <strong>Mis Finanzas</strong>
            <small>Gestión personal · Perú</small>
          </div>
        </div>
        <nav className="fin-nav">
          <Link href="/">← Inicio</Link>
        </nav>
      </header>

      {/* ── hero ── */}
      <div className="fin-hero">
        <p className="eyebrow">HERRAMIENTA GRATUITA</p>
        <h1 className="fin-hero-title">Controlá tus finanzas personales</h1>
        <p className="fin-hero-sub">
          Gastos del mes, plan de ahorro y cálculo de CTS, gratificación y liquidación.
          Todo se guarda en tu dispositivo, sin registros ni contraseñas.
        </p>
      </div>

      {/* ── tabs principales ── */}
      <div className="fin-main-tabs">
        <button className={`fin-main-tab${tab === 'gastos' ? ' active' : ''}`} onClick={() => setTab('gastos')}>
          <span className="fin-tab-icon">💰</span>
          <span>Gastos</span>
        </button>
        <button className={`fin-main-tab${tab === 'ahorro' ? ' active' : ''}`} onClick={() => setTab('ahorro')}>
          <span className="fin-tab-icon">🎯</span>
          <span>Ahorro</span>
        </button>
        <button className={`fin-main-tab${tab === 'laboral' ? ' active' : ''}`} onClick={() => setTab('laboral')}>
          <span className="fin-tab-icon">📋</span>
          <span>CTS / Grati / Liquidación</span>
        </button>
      </div>

      {/* ── contenido ── */}
      <div className="fin-content">
        {tab === 'gastos' && <GastosTracker />}
        {tab === 'ahorro' && <PlanAhorro />}
        {tab === 'laboral' && <CalculosLaborales />}
      </div>

      <footer className="fin-footer">
        <p>Los datos se guardan únicamente en tu navegador (localStorage). No se envía ninguna información a servidores externos.</p>
        <p>Los cálculos son referenciales según la legislación laboral peruana vigente. Consultá con un especialista para casos específicos.</p>
      </footer>
    </main>
  );
}
