import Link from 'next/link';
import { QuoteShareDemo } from '../../components/QuoteShareDemo';

export const metadata = {
  title: 'Compartir cotización | Taller de Color',
  description: 'Enviá la cotización por WhatsApp o email con un clic.',
};

export default function CotizarPage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Compartir cotización</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/buscar">Buscar colores</Link>
          <Link href="/studio">Estudio</Link>
          <Link href="/">Inicio</Link>
        </nav>
      </header>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 0 80px' }}>
        <QuoteShareDemo />
      </div>
    </main>
  );
}
