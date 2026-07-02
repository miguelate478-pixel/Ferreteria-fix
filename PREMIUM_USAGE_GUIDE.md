# 🎨 Guía de Uso del Sistema de Diseño Premium

## 🚀 Inicio Rápido

### 1. Clases Predefinidas

El sistema incluye clases CSS listas para usar:

```tsx
import Link from 'next/link';

export function MyComponent() {
  return (
    <div className="glass-card fade-in">
      <h2 className="gradient-text">Título Premium</h2>
      <p>Contenido de la tarjeta</p>
      <button className="primary-action glow-button">
        Acción Principal
      </button>
    </div>
  );
}
```

### 2. Variables CSS Personalizadas

Usa variables CSS para mantener consistencia:

```tsx
<div style={{
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-xl)',
  backdropFilter: 'blur(20px)',
  boxShadow: 'var(--shadow-md)',
}}>
  Mi contenido
</div>
```

## 📚 Componentes Comunes

### Card con Efecto Glass

```tsx
<div className="glass-card" style={{ padding: 'var(--space-xl)' }}>
  <h3>Título de Card</h3>
  <p style={{ color: 'var(--text-secondary)' }}>
    Descripción del contenido
  </p>
</div>
```

### Botón Premium con Glow

```tsx
<button 
  className="primary-action glow-button"
  onClick={handleClick}
>
  Click Me
</button>
```

### Badge con Estado

```tsx
<span className="badge badge-success">Activo</span>
<span className="badge badge-warning">Pendiente</span>
<span className="badge badge-primary">Nuevo</span>
```

### Loader/Spinner

```tsx
// Spinner animado
<div className="spinner" />

// Skeleton loading
<div className="skeleton" style={{ width: 200, height: 20 }} />
```

### Texto con Gradiente

```tsx
<h1 className="gradient-text" style={{ fontSize: 48 }}>
  Título Impactante
</h1>
```

## 🎭 Animaciones

### Animaciones de Entrada

```tsx
// Fade in suave
<div className="fade-in">Aparece gradualmente</div>

// Scale desde el centro
<div className="scale-in">Crece desde pequeño</div>

// Floating continuo
<div className="floating">Flota arriba y abajo</div>

// Shimmer effect
<div className="shimmer">Efecto shimmer</div>
```

### Animaciones Personalizadas

```tsx
<div style={{
  animation: 'slideInLeft 0.6s ease',
}}>
  Entra desde la izquierda
</div>

<div style={{
  animation: 'slideInRight 1s ease 0.2s both',
}}>
  Entra con delay
</div>
```

## 🎨 Paleta de Colores

### Usando Gradientes

```tsx
// Gradiente de fondo
<div style={{ background: 'var(--gradient-primary)' }}>
  Fondo gradiente
</div>

// Gradientes disponibles:
// --gradient-primary (Violeta)
// --gradient-aurora (Violeta → Cyan → Violeta)
// --gradient-sunset (Rosa → Naranja → Amarillo)
// --gradient-ocean (Azul claro → Azul oscuro)
// --gradient-success (Azul → Cyan)
// --gradient-secondary (Rosa → Rojo)
```

### Colores de Acento

```tsx
<div style={{ color: 'var(--accent-primary)' }}>Texto violeta</div>
<div style={{ color: 'var(--accent-success)' }}>Texto verde</div>
<div style={{ color: 'var(--accent-warning)' }}>Texto rojo</div>
<div style={{ color: 'var(--accent-info)' }}>Texto azul</div>
<div style={{ color: 'var(--accent-purple)' }}>Texto púrpura</div>
<div style={{ color: 'var(--accent-cyan)' }}>Texto cian</div>
<div style={{ color: 'var(--accent-pink)' }}>Texto rosa</div>
```

## 📐 Espaciado

Sistema consistente de espaciado:

```tsx
<div style={{
  padding: 'var(--space-xs)',    // 4px
  margin: 'var(--space-sm)',     // 8px
  gap: 'var(--space-md)',        // 16px
  // --space-lg   → 24px
  // --space-xl   → 32px
  // --space-2xl  → 48px
  // --space-3xl  → 64px
  // --space-4xl  → 96px
}}>
  Contenido
</div>
```

## 🔘 Border Radius

```tsx
<div style={{
  borderRadius: 'var(--radius-sm)',    // 10px
  // --radius-md    → 14px
  // --radius-lg    → 20px
  // --radius-xl    → 28px
  // --radius-2xl   → 36px
  // --radius-full  → 9999px (pill shape)
}}>
  Contenido redondeado
</div>
```

## 💫 Sombras

```tsx
<div style={{
  boxShadow: 'var(--shadow-sm)',         // Sombra pequeña
  // --shadow-md           → Sombra mediana
  // --shadow-lg           → Sombra grande
  // --shadow-xl           → Sombra extra grande
  // --shadow-glow         → Glow sutil
  // --shadow-glow-strong  → Glow intenso
  // --shadow-inner        → Sombra interior
}}>
  Contenido con sombra
</div>
```

## 🎯 Layouts Comunes

### Grid Responsive

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 'var(--space-xl)',
}}>
  <div className="glass-card">Card 1</div>
  <div className="glass-card">Card 2</div>
  <div className="glass-card">Card 3</div>
</div>
```

### Flex Container

```tsx
<div style={{
  display: 'flex',
  gap: 'var(--space-lg)',
  alignItems: 'center',
  justifyContent: 'space-between',
}}>
  <div>Izquierda</div>
  <div>Derecha</div>
</div>
```

### Contenedor Centrado

```tsx
<div style={{
  maxWidth: 1400,
  margin: '0 auto',
  padding: 'var(--space-xl)',
}}>
  Contenido centrado
</div>
```

## 🎨 Ejemplos Avanzados

### Hero Section Premium

```tsx
<section style={{
  minHeight: '80vh',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 'var(--space-4xl)',
  padding: 'var(--space-4xl)',
  alignItems: 'center',
}}>
  <div className="fade-in">
    <div className="eyebrow">NUEVA FUNCIÓN</div>
    <h1 className="gradient-text" style={{ fontSize: 64 }}>
      Título Impactante
    </h1>
    <p style={{ color: 'var(--text-secondary)', fontSize: 20 }}>
      Descripción atractiva del producto
    </p>
    <button className="primary-action">
      Comenzar ahora
    </button>
  </div>
  <div className="glass-card floating">
    Contenido visual
  </div>
</section>
```

### Card con Hover Effect

```tsx
<div 
  className="glass-card"
  style={{
    padding: 'var(--space-xl)',
    transition: 'all var(--duration-normal) ease',
    cursor: 'pointer',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-8px)';
    e.currentTarget.style.boxShadow = 'var(--shadow-glow-strong)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
  }}
>
  <h3>Hover sobre mí</h3>
  <p>Efecto lift + glow</p>
</div>
```

### Modal/Dialog Premium

```tsx
<div style={{
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 'var(--z-modal)',
}}>
  <div className="glass-card scale-in" style={{
    maxWidth: 500,
    padding: 'var(--space-2xl)',
  }}>
    <h2 className="gradient-text">Título del Modal</h2>
    <p>Contenido del modal</p>
    <button className="primary-action">Aceptar</button>
  </div>
</div>
```

## 📱 Responsive

### Breakpoints Recomendados

```tsx
// Mobile: 320px - 520px
// Tablet: 521px - 820px
// Desktop: 821px - 1180px
// Large: 1181px+

// Ejemplo de uso:
<div style={{
  padding: 'var(--space-xl)',
  '@media (max-width: 820px)': {
    padding: 'var(--space-md)',
  },
}}>
  Contenido responsive
</div>
```

## ♿ Accesibilidad

### Focus States

Todos los elementos interactivos tienen focus states:

```tsx
<button 
  style={{
    // El foco se aplica automáticamente
  }}
  aria-label="Descripción del botón"
>
  Click
</button>
```

### Motion Preferences

El sistema respeta `prefers-reduced-motion`:

```tsx
// Las animaciones se desactivan automáticamente
// si el usuario prefiere movimiento reducido
```

## 🎓 Tips Pro

1. **Combina efectos**: `className="glass-card fade-in floating"`
2. **Usa variables**: Mantén consistencia con CSS variables
3. **Animaciones con delay**: Crea efectos escalonados
4. **Hover states**: Añade interactividad a todos los elementos
5. **Responsive first**: Diseña mobile-first
6. **Accesibilidad**: Usa semantic HTML y ARIA labels
7. **Performance**: Usa `will-change` en animaciones críticas
8. **Z-index**: Usa las variables predefinidas de z-index

## 🔗 Enlaces Útiles

- Ver ejemplos en vivo: `/showcase`
- Documentación completa: `DESIGN_UPDATE.md`
- Componentes: `components/PremiumShowcase.tsx`

---

**Pro Tip**: Inspecciona la página `/showcase` con DevTools para ver todos los estilos en acción! 🎨
