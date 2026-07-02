'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Colores base disponibles en ferretería ──────────────────────────────────
// Estas son las pinturas que el vendedor tiene en stock para mezclar.
// El cliente puede personalizarlas desde el panel de ajustes.

const BASE_PAINTS = [
  { id: 'blanco',    name: 'Blanco base',     hex: '#F8F5EE', group: 'Base' },
  { id: 'negro',     name: 'Negro',           hex: '#1C1C1C', group: 'Base' },
  { id: 'rojo',      name: 'Rojo primario',   hex: '#CC2200', group: 'Primario' },
  { id: 'amarillo',  name: 'Amarillo primario',hex: '#F5C518', group: 'Primario' },
  { id: 'azul',      name: 'Azul primario',   hex: '#1245A8', group: 'Primario' },
  { id: 'verde',     name: 'Verde hoja',      hex: '#2E7D32', group: 'Secundario' },
  { id: 'naranja',   name: 'Naranja',         hex: '#E07020', group: 'Secundario' },
  { id: 'violeta',   name: 'Violeta',         hex: '#7B3FA0', group: 'Secundario' },
  { id: 'ocre',      name: 'Ocre / Tierra',   hex: '#C89040', group: 'Tierra' },
  { id: 'siena',     name: 'Siena tostado',   hex: '#A0522D', group: 'Tierra' },
  { id: 'gris',      name: 'Gris medio',      hex: '#9E9E9E', group: 'Gris' },
];

// ─── OkLab puro (sin dependencias) ──────────────────────────────────────────

function hexToLinear(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const toL = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return [toL(r), toL(g), toL(b)];
}

function linearToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785  * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766  * s,
  ];
}

function oklabToLinear(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function linearToHex(r: number, g: number, b: number): string {
  const toS = (c: number) => {
    const x = Math.max(0, Math.min(1, c));
    return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055) * 255)
      .toString(16).padStart(2, '0');
  };
  return `#${toS(r)}${toS(g)}${toS(b)}`;
}

function mixOklab(parts: Array<{ hex: string; w: number }>): string {
  const total = parts.reduce((s, p) => s + p.w, 0);
  if (total === 0) return '#808080';
  let L = 0, a = 0, b = 0;
  for (const p of parts) {
    const wn = p.w / total;
    const [lL, la, lb] = linearToOklab(...hexToLinear(p.hex));
    L += wn * lL; a += wn * la; b += wn * lb;
  }
  return linearToHex(...oklabToLinear(L, a, b));
}

function okDist(h1: string, h2: string): number {
  const [L1, a1, b1] = linearToOklab(...hexToLinear(h1));
  const [L2, a2, b2] = linearToOklab(...hexToLinear(h2));
  return Math.sqrt((L1-L2)**2 + (a1-a2)**2 + (b1-b2)**2);
}

function luminance(hex: string): number {
  const [r,g,b] = hexToLinear(hex);
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
function textOn(bg: string) { return luminance(bg) > 0.35 ? '#171815' : '#fffdf7'; }

// ─── Algoritmo: descomponer un color objetivo en pinturas base ───────────────

interface RecipePart { id: string; name: string; hex: string; proportion: number; percent: number }
interface Recipe {
  resultHex: string;
  distance: number;
  parts: RecipePart[];
  litersFor1L: Array<{ name: string; ml: number }>;
  litersFor4L: Array<{ name: string; ml: number }>;
}

/**
 * Busca la mejor combinación de 2-3 pinturas base que al mezclarse
 * se acerquen lo más posible al color objetivo.
 * Usa búsqueda exhaustiva sobre combinaciones candidatas con
 * resolución de proporción de 10% (100 ms, suficiente para UI).
 */
function findRecipe(targetHex: string, availableBases: typeof BASE_PAINTS): Recipe {
  const STEP = 5; // resolución en puntos de proporción (múltiplos de 5%)
  const STEPS = 100 / STEP;

  let bestDist = Infinity;
  let bestParts: Array<{ id: string; name: string; hex: string; w: number }> = [];

  // ── Combinaciones de 2 pinturas ──────────────────────────────────────────
  for (let i = 0; i < availableBases.length; i++) {
    for (let j = i + 1; j < availableBases.length; j++) {
      const a = availableBases[i];
      const b = availableBases[j];
      for (let wa = STEP; wa <= 100 - STEP; wa += STEP) {
        const wb = 100 - wa;
        const mixed = mixOklab([{ hex: a.hex, w: wa }, { hex: b.hex, w: wb }]);
        const dist = okDist(mixed, targetHex);
        if (dist < bestDist) {
          bestDist = dist;
          bestParts = [
            { id: a.id, name: a.name, hex: a.hex, w: wa },
            { id: b.id, name: b.name, hex: b.hex, w: wb },
          ];
        }
      }
    }
  }

  // ── Combinaciones de 3 pinturas (solo si quedan mejoras significativas) ──
  if (bestDist > 0.015) {
    for (let i = 0; i < availableBases.length; i++) {
      for (let j = i + 1; j < availableBases.length; j++) {
        for (let k = j + 1; k < availableBases.length; k++) {
          const a = availableBases[i];
          const b = availableBases[j];
          const c = availableBases[k];
          for (let wa = STEP; wa <= 100 - 2*STEP; wa += STEP) {
            for (let wb = STEP; wb <= 100 - wa - STEP; wb += STEP) {
              const wc = 100 - wa - wb;
              if (wc < STEP) continue;
              const mixed = mixOklab([
                { hex: a.hex, w: wa },
                { hex: b.hex, w: wb },
                { hex: c.hex, w: wc },
              ]);
              const dist = okDist(mixed, targetHex);
              if (dist < bestDist) {
                bestDist = dist;
                bestParts = [
                  { id: a.id, name: a.name, hex: a.hex, w: wa },
                  { id: b.id, name: b.name, hex: b.hex, w: wb },
                  { id: c.id, name: c.name, hex: c.hex, w: wc },
                ];
              }
            }
          }
        }
      }
    }
  }

  const total = bestParts.reduce((s, p) => s + p.w, 0);
  const resultHex = mixOklab(bestParts.map((p) => ({ hex: p.hex, w: p.w })));

  const parts: RecipePart[] = bestParts
    .filter((p) => p.w > 0)
    .sort((a, b) => b.w - a.w)
    .map((p) => ({
      id: p.id,
      name: p.name,
      hex: p.hex,
      proportion: p.w,
      percent: Math.round((p.w / total) * 100),
    }));

  // Calcular ml para envases de 1L y 4L (1L = 1000ml, 4L = 4000ml)
  const litersFor1L = parts.map((p) => ({
    name: p.name,
    ml: Math.round((p.percent / 100) * 1000),
  }));
  const litersFor4L = parts.map((p) => ({
    name: p.name,
    ml: Math.round((p.percent / 100) * 4000),
  }));

  return { resultHex, distance: Math.round(bestDist * 1000) / 1000, parts, litersFor1L, litersFor4L };
}

// ─── Componente ──────────────────────────────────────────────────────────────

const COLOR_SUGGESTIONS = [
  { label: 'Verde menta', hex: '#AAD9B8' },
  { label: 'Azul cielo', hex: '#87CEEB' },
  { label: 'Beige cálido', hex: '#E8DCCA' },
  { label: 'Terracota', hex: '#C2714F' },
  { label: 'Gris pizarra', hex: '#607D8B' },
  { label: 'Rosa suave', hex: '#F0C8C8' },
  { label: 'Mostaza', hex: '#C8A800' },
  { label: 'Azul marino', hex: '#1A3A6B' },
  { label: 'Verde oliva', hex: '#6B7C4A' },
  { label: 'Coral', hex: '#FF6B6B' },
];

export function ColorRecipe() {
  const [targetHex, setTargetHex] = useState('#AAD9B8');
  const [targetName, setTargetName] = useState('Verde menta');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [bases, setBases] = useState(BASE_PAINTS);
  const [showBases, setShowBases] = useState(false);
  const [volume, setVolume] = useState<'1L' | '4L'>('1L');
  const workerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Leer hex desde la URL si viene del buscador
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const hex = params.get('hex');
    if (hex && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setTargetHex(hex);
      setTargetName('');
      calculate(hex, BASE_PAINTS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const calculate = useCallback((hex: string, activeBases: typeof BASE_PAINTS) => {
    if (workerRef.current) clearTimeout(workerRef.current);
    setLoading(true);
    // setTimeout para no bloquear el render con el cálculo pesado
    workerRef.current = setTimeout(() => {
      const result = findRecipe(hex, activeBases);
      setRecipe(result);
      setLoading(false);
    }, 30);
  }, []);

  const handleColorChange = (hex: string) => {
    setTargetHex(hex);
    calculate(hex, bases);
  };

  const handleSuggestion = (hex: string, label: string) => {
    setTargetHex(hex);
    setTargetName(label);
    calculate(hex, bases);
  };

  const toggleBase = (id: string) => {
    setBases((prev) => {
      const next = prev.map((b) => b.id === id ? { ...b, _disabled: !('_disabled' in b) || !(b as any)._disabled } : b);
      const active = next.filter((b) => !(b as any)._disabled);
      if (active.length >= 2) calculate(targetHex, active);
      return next;
    });
  };

  const activeBases = bases.filter((b) => !(b as any)._disabled);

  // Calidad de la receta
  const quality = recipe
    ? recipe.distance < 0.02 ? { label: 'Excelente', color: '#426243' }
    : recipe.distance < 0.05 ? { label: 'Muy buena', color: '#5a7a30' }
    : recipe.distance < 0.10 ? { label: 'Buena', color: '#8a7020' }
    : { label: 'Aproximada', color: '#9a4020' }
    : null;

  return (
    <div className="cr-root">

      {/* ══ ENCABEZADO ══════════════════════════════════════════════════════ */}
      <div className="cr-header">
        <p className="eyebrow">RECETA DE COLOR</p>
        <h2 className="cr-title">¿Qué color querés lograr?</h2>
        <p className="cr-subtitle">
          Elegí el color que quiere el cliente y el sistema te dice exactamente qué pinturas mezclar
          y en qué proporción para llegar a ese resultado.
        </p>
      </div>

      {/* ══ SELECTOR DE COLOR OBJETIVO ══════════════════════════════════════ */}
      <div className="cr-target-section">
        <div className="cr-target-pick">
          <div className="cr-target-left">
            <p className="ca-section-label">COLOR OBJETIVO</p>

            {/* Picker grande + campo de texto hex */}
            <label className="cr-big-pick" aria-label="Seleccionar color objetivo">
              <div
                className="cr-big-swatch"
                style={{ background: targetHex, color: textOn(targetHex) }}
              >
                <span className="cr-big-hex">{targetHex.toUpperCase()}</span>
                <small>Tocá para cambiar</small>
              </div>
              <input
                type="color"
                value={targetHex}
                onChange={(e) => handleColorChange(e.target.value)}
                className="cr-hidden-input"
                aria-label="Color objetivo"
              />
            </label>

            {/* Input hex manual */}
            <div className="cr-hex-manual">
              <input
                className="ca-text-input"
                value={targetHex}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) handleColorChange(v);
                  else setTargetHex(v);
                }}
                placeholder="#RRGGBB"
                maxLength={7}
                aria-label="Código hex del color"
              />
              <button
                className="primary-action"
                style={{ minHeight: 36, padding: '0 16px', fontSize: 11 }}
                onClick={() => calculate(targetHex, activeBases)}
                disabled={loading}
              >
                {loading ? 'Calculando…' : 'Calcular receta'}
              </button>
            </div>
          </div>

          {/* Sugerencias rápidas */}
          <div className="cr-target-right">
            <p className="ca-section-label">COLORES FRECUENTES</p>
            <div className="cr-suggestions">
              {COLOR_SUGGESTIONS.map((s) => (
                <button
                  key={s.hex}
                  className={`cr-suggestion${targetHex === s.hex ? ' active' : ''}`}
                  onClick={() => handleSuggestion(s.hex, s.label)}
                  aria-pressed={targetHex === s.hex}
                >
                  <span className="cr-sug-dot" style={{ background: s.hex }} />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pinturas base disponibles */}
        <div className="cr-bases-toggle">
          <button
            className="ca-ghost-btn"
            onClick={() => setShowBases((v) => !v)}
            aria-expanded={showBases}
          >
            {showBases ? '▲ Ocultar' : '▼ Configurar'} pinturas base disponibles ({activeBases.length}/{bases.length})
          </button>
        </div>

        {showBases && (
          <div className="cr-bases-grid">
            {bases.map((b) => {
              const disabled = (b as any)._disabled;
              return (
                <button
                  key={b.id}
                  className={`cr-base-chip${disabled ? ' off' : ''}`}
                  onClick={() => toggleBase(b.id)}
                  aria-pressed={!disabled}
                  title={disabled ? 'No disponible' : 'Disponible'}
                >
                  <span className="cr-base-dot" style={{ background: b.hex, opacity: disabled ? 0.3 : 1 }} />
                  <span>{b.name}</span>
                  {disabled && <span className="cr-base-off">✕</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ RESULTADO DE LA RECETA ══════════════════════════════════════════ */}
      {recipe && !loading && (
        <div className="cr-result">

          {/* Comparación visual */}
          <div className="cr-compare">
            <div className="cr-compare-col">
              <p className="ca-section-label">COLOR PEDIDO</p>
              <div className="cr-compare-swatch" style={{ background: targetHex, color: textOn(targetHex) }}>
                <span>{targetHex.toUpperCase()}</span>
                {targetName && <small>{targetName}</small>}
              </div>
            </div>
            <div className="cr-compare-arrow">→</div>
            <div className="cr-compare-col">
              <p className="ca-section-label">RESULTADO DE LA MEZCLA</p>
              <div className="cr-compare-swatch" style={{ background: recipe.resultHex, color: textOn(recipe.resultHex) }}>
                <span>{recipe.resultHex.toUpperCase()}</span>
                {quality && <small style={{ color: quality.color }}>{quality.label} (Δ {recipe.distance})</small>}
              </div>
            </div>
          </div>

          {recipe.distance > 0.12 && (
            <p className="cr-warn">
              ⚠ La diferencia es perceptible. Ninguna combinación de las pinturas disponibles
              llega exactamente a este color. Activá más colores base o buscá una pintura premezclada.
            </p>
          )}

          {/* Receta en proporciones */}
          <div className="cr-recipe-card">
            <div className="cr-recipe-header">
              <p className="ca-section-label">RECETA DE MEZCLA</p>
              <div className="cr-vol-toggle">
                {(['1L', '4L'] as const).map((v) => (
                  <button
                    key={v}
                    className={`cr-vol-btn${volume === v ? ' active' : ''}`}
                    onClick={() => setVolume(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Barra de proporciones */}
            <div className="cr-bar">
              {recipe.parts.map((p) => (
                <div
                  key={p.id}
                  className="cr-bar-seg"
                  style={{ flex: p.proportion, background: p.hex }}
                  title={`${p.name}: ${p.percent}%`}
                />
              ))}
            </div>

            {/* Detalle de cada parte */}
            {recipe.parts.map((p, i) => {
              const mlData = volume === '1L' ? recipe.litersFor1L[i] : recipe.litersFor4L[i];
              return (
                <div key={p.id} className="cr-part-row">
                  <div className="cr-part-swatch" style={{ background: p.hex }} />
                  <div className="cr-part-info">
                    <b>{p.name}</b>
                    <span>{p.percent}% de la mezcla</span>
                  </div>
                  <div className="cr-part-amount">
                    <strong>{mlData.ml} ml</strong>
                    <span>para {volume}</span>
                  </div>
                </div>
              );
            })}

            {/* Instrucciones de mezcla */}
            <div className="cr-instructions">
              <p className="ca-section-label" style={{ marginTop: 0 }}>CÓMO MEZCLAR</p>
              <ol className="cr-steps">
                <li>Medí cada pintura en la cantidad indicada usando una probeta o balanza.</li>
                <li>Empezá con la pintura en mayor cantidad (la base).</li>
                <li>Agregá las pinturas de menor cantidad de a poco, mezclando constantemente.</li>
                <li>Mezclar al menos 3 minutos hasta lograr un color uniforme sin vetas.</li>
                <li>Probá una pincelada en un cartón antes de aplicar en la pared.</li>
                <li>Preparar toda la cantidad necesaria de una vez para garantizar uniformidad.</li>
              </ol>
            </div>
          </div>

          {/* Tabla de cantidades para múltiples litros */}
          <div className="cr-quantities">
            <p className="ca-section-label">TABLA DE CANTIDADES (ml por cada litro de mezcla final)</p>
            <div className="cr-qty-table">
              <div className="cr-qty-header">
                <span>Pintura</span>
                {[1, 2, 4, 8, 15].map((l) => (
                  <span key={l}>{l} L</span>
                ))}
              </div>
              {recipe.parts.map((p) => (
                <div key={p.id} className="cr-qty-row">
                  <span>
                    <i className="cr-qty-dot" style={{ background: p.hex }} />
                    {p.name}
                  </span>
                  {[1, 2, 4, 8, 15].map((l) => (
                    <span key={l}>{Math.round((p.percent / 100) * l * 1000)} ml</span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Advertencia */}
          <p className="ca-fine-print" style={{ marginTop: 16 }}>
            Resultado referencial calculado en espacio OkLab. El color real puede variar según la marca
            de pintura, el pigmento exacto, la superficie, el acabado (mate/satinado/brillante) y las
            condiciones de luz. Siempre probá una muestra antes de aplicar.
          </p>
        </div>
      )}

      {!recipe && !loading && (
        <div className="ca-empty-result" style={{ padding: '48px 0' }}>
          <div className="ca-empty-swatch" style={{ background: `linear-gradient(135deg, ${targetHex} 50%, #fff 50%)` }} />
          <p>Elegí un color arriba y presioná <strong>Calcular receta</strong></p>
        </div>
      )}

      {loading && (
        <div className="ca-empty-result" style={{ padding: '48px 0' }}>
          <div className="cs-spinner" style={{ position: 'static', marginBottom: 8 }} />
          <p style={{ color: 'var(--muted)', fontSize: 12 }}>Calculando la mejor combinación…</p>
        </div>
      )}
    </div>
  );
}
