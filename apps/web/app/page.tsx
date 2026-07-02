import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Estudio digital de proyectos</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/finanzas" style={{ fontWeight: 700 }}>💰 Mis Finanzas</Link>
          <Link href="/showcase" style={{ fontWeight: 700 }}>✨ Showcase</Link>
          <Link href="/hipoteca">🏠 Hipoteca</Link>
          <Link href="/receta">Receta de color</Link>
          <Link href="/buscar">Buscar colores</Link>
          <Link href="/visualizar">Visualizador</Link>
          <Link href="/studio">Estudio</Link>
        </nav>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">DISEÑO PROFESIONAL HECHO SIMPLE</p>
          <h1>Transforma tu espacio con precisión profesional</h1>
          <p className="hero-lead">
            Visualiza, calcula y cotiza proyectos de pintura completos en minutos. 
            Sistema inteligente que combina diseño, mediciones precisas y presupuestos automáticos para crear tu espacio ideal.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/studio">Comenzar mi proyecto</Link>
            <span>Crea tu primer diseño en 5 minutos</span>
          </div>
        </div>

        <div className="editorial-swatch" aria-label="Composición de colores de demostración">
          <div className="swatch swatch-main"><span>65%</span><b>Calma mineral</b></div>
          <div className="swatch swatch-secondary"><span>25%</span><b>Arena suave</b></div>
          <div className="swatch swatch-accent"><span>10%</span><b>Oliva sereno</b></div>
          <div className="measurement-note">41.31 m² de paredes netas</div>
        </div>
      </section>

      <section className="principles-strip">
        <article>
          <span>01</span>
          <h2>Medir</h2>
          <p>Calcula superficies exactas con nuestra herramienta inteligente. Distingue paredes, techos y aberturas automáticamente.</p>
        </article>
        <article>
          <span>02</span>
          <h2>Diseñar</h2>
          <p>Explora paletas de color profesionales y visualiza el resultado en tiempo real. Armonía garantizada.</p>
        </article>
        <article>
          <span>03</span>
          <h2>Cotizar</h2>
          <p>Genera presupuestos detallados instantáneos con materiales, cantidades exactas y disponibilidad en stock.</p>
        </article>
      </section>
    </main>
  );
}
