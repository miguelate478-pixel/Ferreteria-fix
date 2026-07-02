'use client';

import { useState } from 'react';

/**
 * Componente showcase para demostrar las capacidades premium del nuevo diseño
 * Incluye ejemplos de todos los efectos y animaciones disponibles
 */
export function PremiumShowcase() {
  const [activeTab, setActiveTab] = useState<'effects' | 'components' | 'animations'>('effects');

  return (
    <div className="glass-card fade-in" style={{ padding: 'var(--space-2xl)', margin: 'var(--space-2xl) 0' }}>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 className="gradient-text" style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>
          Premium Design System
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18 }}>
          Explora todos los efectos y componentes premium disponibles
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap' }}>
        {(['effects', 'components', 'animations'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'var(--space-sm) var(--space-xl)',
              background: activeTab === tab ? 'var(--gradient-primary)' : 'transparent',
              border: `1px solid ${activeTab === tab ? 'var(--border-glow)' : 'var(--border-medium)'}`,
              borderRadius: 'var(--radius-full)',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all var(--duration-normal) ease',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Effects Tab */}
      {activeTab === 'effects' && (
        <div className="scale-in">
          <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>Glass Effects</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
            <div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
              <div style={{ fontSize: 32, marginBottom: 'var(--space-sm)' }}>🎨</div>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Glassmorphism</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Efecto de vidrio con blur y transparencia
              </p>
            </div>

            <div style={{
              padding: 'var(--space-xl)',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 'var(--space-sm)' }}>✨</div>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Glow Effect</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Sombras con brillo de neón
              </p>
            </div>

            <div className="shimmer" style={{
              padding: 'var(--space-xl)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{ fontSize: 32, marginBottom: 'var(--space-sm)' }}>💫</div>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Shimmer</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Efecto shimmer loading
              </p>
            </div>
          </div>

          <h3 style={{ margin: 'var(--space-2xl) 0 var(--space-lg)', color: 'var(--text-primary)' }}>Gradients</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            {[
              { name: 'Primary', gradient: 'var(--gradient-primary)' },
              { name: 'Aurora', gradient: 'var(--gradient-aurora)' },
              { name: 'Sunset', gradient: 'var(--gradient-sunset)' },
              { name: 'Ocean', gradient: 'var(--gradient-ocean)' },
              { name: 'Success', gradient: 'var(--gradient-success)' },
              { name: 'Secondary', gradient: 'var(--gradient-secondary)' },
            ].map((item) => (
              <div
                key={item.name}
                style={{
                  height: 120,
                  background: item.gradient,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 'var(--space-md)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Components Tab */}
      {activeTab === 'components' && (
        <div className="scale-in">
          <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>Buttons</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
            <button className="primary-action">Primary Action</button>
            <button className="glow-button" style={{
              padding: 'var(--space-sm) var(--space-xl)',
              background: 'var(--gradient-success)',
              borderRadius: 'var(--radius-full)',
              color: 'white',
              fontWeight: 600,
            }}>
              Glow Button
            </button>
            <button style={{
              padding: 'var(--space-sm) var(--space-xl)',
              background: 'transparent',
              border: '2px solid var(--border-glow)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              transition: 'all var(--duration-normal) ease',
            }}>
              Outline Button
            </button>
          </div>

          <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>Badges</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge" style={{
              background: 'rgba(157, 78, 221, 0.15)',
              color: 'var(--accent-purple)',
              border: '1px solid rgba(157, 78, 221, 0.3)',
            }}>
              Purple
            </span>
          </div>

          <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>Loading States</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xl)', alignItems: 'center' }}>
            <div className="spinner" />
            <div className="skeleton" style={{ width: 200, height: 20 }} />
            <div className="skeleton" style={{ width: 150, height: 20 }} />
          </div>
        </div>
      )}

      {/* Animations Tab */}
      {activeTab === 'animations' && (
        <div className="scale-in">
          <h3 style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>Entrance Animations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)' }}>
            <div className="fade-in glass-card" style={{ padding: 'var(--space-xl)' }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Fade In</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Aparece suavemente
              </p>
            </div>

            <div className="scale-in glass-card" style={{ padding: 'var(--space-xl)' }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Scale In</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Crece desde el centro
              </p>
            </div>

            <div className="floating glass-card" style={{ padding: 'var(--space-xl)' }}>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Floating</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Flota arriba y abajo
              </p>
            </div>
          </div>

          <h3 style={{ margin: 'var(--space-2xl) 0 var(--space-lg)', color: 'var(--text-primary)' }}>Hover Effects</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: 'var(--space-xl)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 'var(--space-sm)' }}>
                  {i === 1 ? '🎯' : i === 2 ? '⚡' : '🚀'}
                </div>
                <h4 style={{ marginBottom: 'var(--space-sm)' }}>Hover Me {i}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Efecto lift + glow en hover
                </p>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{
            marginTop: 'var(--space-2xl)',
            padding: 'var(--space-xl)',
            background: 'var(--gradient-primary)',
            color: 'white',
          }}>
            <h4 style={{ marginBottom: 'var(--space-sm)', fontSize: 24 }}>Pro Tip 💡</h4>
            <p style={{ fontSize: 14, opacity: 0.9 }}>
              Combina estas animaciones y efectos para crear experiencias únicas. 
              Usa <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>className</code> para aplicar múltiples efectos a la vez.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
