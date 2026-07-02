import Link from 'next/link';
import { ColorRecipe } from '../../components/ColorRecipe';

export const metadata = {
  title: 'Receta de color | Taller de Color',
  description: 'Elegí el color que querés y el sistema te dice qué pinturas mezclar y en qué proporción para llegar a ese resultado.',
};

export default function RecetaPage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Receta de color</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/buscar">Buscar colores</Link>
          <Link href="/visualizar">Visualizador</Link>
          <Link href="/studio">Estudio</Link>
          <Link href="/">Inicio</Link>
        </nav>
      </header>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 0 80px' }}>
        <ColorRecipe />
      </div>
    </main>
  );
}
