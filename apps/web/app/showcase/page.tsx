import Link from 'next/link';
import { PremiumShowcase } from '../../components/PremiumShowcase';

export const metadata = {
  title: 'Premium Design Showcase | Taller de Color',
  description: 'Explora el nuevo sistema de diseño premium con efectos glassmorphism, animaciones y componentes modernos.',
};

export default function ShowcasePage() {
  return (
    <main className="landing-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Premium Design System</small>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/studio">Estudio</Link>
          <Link href="/color">Colores</Link>
          <Link href="/">Inicio</Link>
        </nav>
      </header>

      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto', 
        padding: 'var(--space-3xl) var(--space-lg) var(--space-4xl)' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4xl)' }} className="fade-in">
          <div className="eyebrow" style={{ 
            display: 'inline-flex', 
            marginBottom: 'var(--space-xl)' 
          }}>
            DESIGN SYSTEM V2.0
          </div>
          
          <h1 style={{
            fontSize: 'clamp(48px, 6vw, 96px)',
            fontWeight: 800,
            lineHeight: 1.05,
            marginBottom: 'var(--space-lg)',
            background: 'var(--gradient-aurora)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.04em',
          }}>
            Premium Design
            <br />
            Made Simple
          </h1>

          <p style={{
            maxWidth: 720,
            margin: '0 auto var(--space-3xl)',
            fontSize: 'clamp(18px, 2.2vw, 24px)',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
          }}>
            Un sistema de diseño moderno con efectos glassmorphism, animaciones fluidas 
            y componentes premium listos para usar. Todo construido con CSS moderno y cero dependencias.
          </p>

          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-lg)', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 'var(--space-2xl)',
          }}>
            <Link className="primary-action" href="/studio">
              Ver en acción
            </Link>
            <a 
              href="#components"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 var(--space-2xl)',
                minHeight: 64,
                background: 'transparent',
                border: '2px solid var(--border-glow)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--accent-primary)',
                fontWeight: 600,
                fontSize: 17,
                transition: 'all var(--duration-normal) ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Explorar componentes
            </a>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--space-lg)',
            maxWidth: 800,
            margin: '0 auto',
          }}>
            {[
              { value: '50+', label: 'Componentes' },
              { value: '100%', label: 'Responsive' },
              { value: '0', label: 'Dependencias' },
              { value: 'A11y', label: 'Accesible' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card" style={{
                padding: 'var(--space-lg)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: 32,
                  fontWeight: 700,
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: 'var(--space-xs)',
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="components">
          <PremiumShowcase />
        </div>

        {/* Features Grid */}
        <div style={{
          marginTop: 'var(--space-4xl)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-xl)',
        }}>
          {[
            {
              icon: '🎨',
              title: 'Glassmorphism',
              description: 'Efectos de vidrio modernos con backdrop-filter y transparencias perfectamente balanceadas.',
            },
            {
              icon: '✨',
              title: 'Animaciones Fluidas',
              description: 'Transiciones suaves con cubic-bezier y animaciones optimizadas para 60fps.',
            },
            {
              icon: '🌈',
              title: 'Gradientes Premium',
              description: 'Paleta extendida con gradientes Aurora, Sunset, Ocean y más combinaciones.',
            },
            {
              icon: '📱',
              title: 'Mobile First',
              description: 'Diseño responsive desde el primer pixel. Touch targets optimizados.',
            },
            {
              icon: '♿',
              title: 'Accesible',
              description: 'WCAG compliance, keyboard navigation, focus states y motion preferences.',
            },
            {
              icon: '⚡',
              title: 'Performance',
              description: 'CSS optimizado, GPU acceleration, y código minimalista sin bloat.',
            },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="glass-card"
              style={{
                padding: 'var(--space-2xl)',
                animation: `slideInLeft 0.6s ease ${i * 0.1}s both`,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 'var(--space-sm)',
                color: 'var(--text-primary)',
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                fontSize: 15,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="glass-card" style={{
          marginTop: 'var(--space-4xl)',
          padding: 'var(--space-3xl)',
          textAlign: 'center',
          background: 'var(--gradient-primary)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 800,
              marginBottom: 'var(--space-md)',
              color: 'white',
            }}>
              Listo para empezar?
            </h2>
            <p style={{
              fontSize: 18,
              marginBottom: 'var(--space-2xl)',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: 600,
              margin: '0 auto var(--space-2xl)',
            }}>
              Explora nuestras herramientas de diseño y crea proyectos increíbles con el nuevo sistema premium.
            </p>
            <Link 
              className="primary-action"
              href="/studio"
              style={{
                background: 'white',
                color: 'var(--accent-primary)',
              }}
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
