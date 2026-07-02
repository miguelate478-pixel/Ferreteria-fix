import Link from 'next/link';
import { PhotoVisualizer } from '../../components/PhotoVisualizer';

export const metadata = {
  title: 'Visualizador de color | Taller de Color',
  description: 'Subí una foto de tu ambiente, pintá las paredes y ve cómo quedaría con distintas paletas de color.',
};

export default function VisualizarPage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Visualizador de color</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/buscar">Buscar colores</Link>
          <Link href="/color">Combinador</Link>
          <Link href="/studio">Estudio</Link>
          <Link href="/">Inicio</Link>
        </nav>
      </header>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 0 80px' }}>
        <PhotoVisualizer />
      </div>
    </main>
  );
}
