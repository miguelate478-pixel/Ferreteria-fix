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
          <Link href="/receta">Receta de color</Link>
          <Link href="/buscar">Buscar colores</Link>
          <Link href="/visualizar">Visualizador</Link>
          <Link href="/color">Combinador</Link>
          <Link href="/cotizar">Cotización</Link>
          <Link href="/studio">Estudio</Link>
        </nav>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">NO COMPRES PINTURA. DISEÑA EL RESULTADO.</p>
          <h1>¿Qué espacio quieres transformar?</h1>
          <p className="hero-lead">
            Describe el ambiente, mide las superficies y prueba una dirección de color.
            El sistema arma cantidades, materiales, stock y presupuesto alrededor de tu proyecto.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/studio">Empezar una habitación</Link>
            <span>Ejemplo inicial: dormitorio de 20 m² de piso</span>
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
        <article><span>01</span><h2>Medir</h2><p>Distingue piso, paredes, techo y aberturas.</p></article>
        <article><span>02</span><h2>Decidir</h2><p>Explica por qué una combinación funciona.</p></article>
        <article><span>03</span><h2>Resolver</h2><p>Completa pintura, materiales, stock y cotización.</p></article>
      </section>
    </main>
  );
}
