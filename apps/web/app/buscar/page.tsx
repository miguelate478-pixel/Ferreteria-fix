import Link from 'next/link';
import { ColorSearch } from '../../components/ColorSearch';

export const metadata = {
  title: 'Buscar colores | Taller de Color',
  description: 'Buscá el color que imaginás en lenguaje natural: verde menta suave, azul marino, terracota…',
};

export default function BuscarPage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Buscador de colores</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '24px' }}>
          <Link href="/visualizar">Visualizador</Link>
          <Link href="/color">Combinador</Link>
          <Link href="/studio">Estudio</Link>
          <Link href="/">Inicio</Link>
        </nav>
      </header>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 0 80px' }}>
        <ColorSearch />
      </div>
    </main>
  );
}
