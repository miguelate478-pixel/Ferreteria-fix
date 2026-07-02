import Link from 'next/link';
import { SimuladorHipotecario } from '../../components/finanzas/SimuladorHipotecario';

export const metadata = {
  title: 'Simulador Hipotecario Perú | Calculadora de crédito vivienda',
  description: 'Calculá tu cuota hipotecaria, compará BCP, BBVA, Interbank, Scotiabank y MiVivienda. Tabla de amortización completa.',
};

export default function HipotecaPage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" style={{ fontFamily: 'Georgia' }}>🏠</span>
          <div>
            <strong>Simulador Hipotecario</strong>
            <small>Perú · Crédito vivienda</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 20 }}>
          <Link href="/finanzas">💰 Mis Finanzas</Link>
          <Link href="/">Inicio</Link>
        </nav>
      </header>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 0 80px' }}>
        <SimuladorHipotecario />
      </div>
    </main>
  );
}
