import Link from 'next/link';
import { ColorMixingAssistant } from '../../components/ColorMixingAssistant';

export const metadata = {
  title: 'Combinador de colores | Taller de Color',
  description: 'Mezcla colores por proporción y encuentra el equivalente más cercano en el catálogo con stock.',
};

export default function ColorPage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Asistente de combinación</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/studio">Estudio</Link>
          <Link href="/">Inicio</Link>
        </nav>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 0 80px' }}>
        <ColorMixingAssistant />
      </div>
    </main>
  );
}
