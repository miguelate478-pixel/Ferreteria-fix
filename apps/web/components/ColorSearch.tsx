'use client';

import { useRef, useState } from 'react';

// ─── Vocabulario de colores (funciona 100% offline, sin API) ─────────────────

const VOCAB = [
  { kw: ['blanco', 'white', 'nieve', 'puro'], hex: '#F8F5EE', desc: 'blanco puro' },
  { kw: ['crema', 'cream', 'marfil', 'ivory', 'hueso'], hex: '#FFF8E7', desc: 'blanco crema' },
  { kw: ['blanco roto', 'off white'], hex: '#F5F0E8', desc: 'blanco roto cálido' },
  { kw: ['gris claro', 'gris suave', 'gris palido'], hex: '#D4D4D4', desc: 'gris claro' },
  { kw: ['gris oscuro', 'gris carbon', 'carbon'], hex: '#5A5A5A', desc: 'gris oscuro' },
  { kw: ['gris calido', 'greige', 'gris arena'], hex: '#B8B0A0', desc: 'gris cálido' },
  { kw: ['gris frio', 'gris pizarra', 'gris azulado', 'pizarra', 'slate'], hex: '#8A9099', desc: 'gris pizarra' },
  { kw: ['gris', 'gray', 'grey', 'plata', 'silver'], hex: '#9E9E9E', desc: 'gris medio' },
  { kw: ['negro', 'black'], hex: '#1A1A1A', desc: 'negro' },
  { kw: ['beige claro', 'beige suave', 'lino', 'linen'], hex: '#E8DCCA', desc: 'beige claro' },
  { kw: ['beige', 'arena', 'sand', 'tostado'], hex: '#C8B89A', desc: 'beige arena' },
  { kw: ['nude', 'desnudo', 'piel', 'natural'], hex: '#D4B896', desc: 'nude natural' },
  { kw: ['taupe', 'gris topo'], hex: '#A89880', desc: 'taupe' },
  { kw: ['camel', 'camello', 'canela'], hex: '#C19A6B', desc: 'camel cálido' },
  { kw: ['cafe con leche', 'latte', 'cappuccino'], hex: '#A67B5B', desc: 'marrón claro' },
  { kw: ['marron', 'cafe', 'brown', 'chocolate'], hex: '#7B4F2E', desc: 'marrón café' },
  { kw: ['terracota', 'terra', 'arcilla', 'clay', 'barro'], hex: '#C2714F', desc: 'terracota' },
  { kw: ['cobre', 'copper', 'bronce'], hex: '#B87333', desc: 'cobre' },
  { kw: ['siena', 'ocre', 'ocher'], hex: '#D4904A', desc: 'siena ocre' },
  { kw: ['rojo suave', 'rojo calido', 'rojo tierra'], hex: '#B44040', desc: 'rojo suave' },
  { kw: ['burdeos', 'borgona', 'burgundy', 'vino', 'wine'], hex: '#722F37', desc: 'borgoña' },
  { kw: ['rojo', 'red', 'bermillon'], hex: '#CC2200', desc: 'rojo vivo' },
  { kw: ['rosa fuerte', 'magenta', 'fucsia', 'fuchsia'], hex: '#CC4488', desc: 'magenta' },
  { kw: ['palo de rosa', 'blush', 'rosa palido', 'rosa suave'], hex: '#F0C8C8', desc: 'rosa pálido' },
  { kw: ['rosa', 'pink', 'rosado'], hex: '#E8A0A0', desc: 'rosa' },
  { kw: ['salmon', 'coral'], hex: '#FA8072', desc: 'salmón coral' },
  { kw: ['durazno', 'peach', 'melocoton', 'naranja suave'], hex: '#FFCBA4', desc: 'durazno suave' },
  { kw: ['naranja quemado', 'burnt orange'], hex: '#BF5700', desc: 'naranja quemado' },
  { kw: ['naranja', 'orange', 'mandarina'], hex: '#E87020', desc: 'naranja vivo' },
  { kw: ['amarillo limon', 'limon', 'lemon', 'citrus'], hex: '#F8F058', desc: 'amarillo limón' },
  { kw: ['mantequilla', 'butter', 'champagne', 'vainilla', 'vanilla', 'amarillo suave'], hex: '#F5E6A3', desc: 'amarillo vainilla' },
  { kw: ['mostaza', 'mustard', 'curry'], hex: '#C8A800', desc: 'mostaza' },
  { kw: ['amarillo', 'yellow', 'dorado', 'golden', 'sol'], hex: '#F5C518', desc: 'amarillo dorado' },
  { kw: ['verde menta', 'menta', 'mint'], hex: '#AAD9B8', desc: 'verde menta' },
  { kw: ['verde agua', 'verde pastel', 'verde palido'], hex: '#C8E6C9', desc: 'verde pastel' },
  { kw: ['verde salvia', 'salvia', 'sage'], hex: '#87A878', desc: 'verde salvia' },
  { kw: ['verde oliva', 'oliva', 'olive', 'verde militar'], hex: '#6B7C4A', desc: 'verde oliva' },
  { kw: ['verde musgo', 'musgo', 'moss'], hex: '#4A6741', desc: 'verde musgo' },
  { kw: ['verde lima', 'lima', 'lime', 'verde claro', 'verde suave'], hex: '#8BC34A', desc: 'verde lima' },
  { kw: ['verde jade', 'jade'], hex: '#00A878', desc: 'verde jade' },
  { kw: ['verde bosque', 'verde oscuro', 'verde botella', 'forest'], hex: '#1B5E20', desc: 'verde bosque' },
  { kw: ['verde manzana', 'apple'], hex: '#6DB33F', desc: 'verde manzana' },
  { kw: ['verde', 'green', 'esmeralda', 'emerald'], hex: '#2E7D32', desc: 'verde medio' },
  { kw: ['azul cielo', 'azul claro', 'celeste', 'sky'], hex: '#87CEEB', desc: 'azul cielo' },
  { kw: ['azul suave', 'azul palido', 'azul bebe', 'baby blue'], hex: '#B3CCDD', desc: 'azul suave' },
  { kw: ['azul marino', 'navy', 'marine', 'azul oscuro', 'azul profundo'], hex: '#0D2B5E', desc: 'azul marino' },
  { kw: ['azul pizarra', 'gris azul', 'azul gris'], hex: '#607D8B', desc: 'azul pizarra' },
  { kw: ['azul petroleo', 'petroleo', 'teal'], hex: '#008080', desc: 'azul petróleo' },
  { kw: ['turquesa pastel', 'turquesa suave', 'cyan pastel'], hex: '#B2EBF2', desc: 'turquesa suave' },
  { kw: ['turquesa', 'turquoise', 'aqua', 'aguamarina'], hex: '#00BCD4', desc: 'turquesa' },
  { kw: ['azul', 'blue', 'indigo', 'cobalt', 'cobalto'], hex: '#1565C0', desc: 'azul medio' },
  { kw: ['lila', 'lilac', 'malva', 'mauve', 'lavanda suave'], hex: '#D4A8D4', desc: 'lila suave' },
  { kw: ['ciruela', 'plum', 'berenjena', 'morado oscuro', 'eggplant'], hex: '#6A1B9A', desc: 'ciruela profundo' },
  { kw: ['violeta', 'violet', 'morado', 'purple', 'lavanda', 'lavender'], hex: '#9C5FBC', desc: 'violeta medio' },
];

const LIGHTNESS: Array<{ words: string[]; shift: number }> = [
  { words: ['claro', 'clara', 'suave', 'palido', 'palida', 'pastel', 'light', 'pale', 'soft'], shift: +1 },
  { words: ['oscuro', 'oscura', 'profundo', 'profunda', 'deep', 'dark'], shift: -1 },
];
const SATURATION: Array<{ words: string[]; shift: number }> = [
  { words: ['apagado', 'apagada', 'grisaceo', 'desaturado', 'muted', 'dusty', 'opaco'], shift: -1 },
  { words: ['vibrante', 'saturado', 'vivo', 'viva', 'intenso', 'bold', 'bright'], shift: +1 },
];

// ─── OkLab (sin dependencias) ────────────────────────────────────────────────

function hexToLin(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const toL = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return [toL(parseInt(h.slice(0,2),16)/255), toL(parseInt(h.slice(2,4),16)/255), toL(parseInt(h.slice(4,6),16)/255)];
}

function linToOk(r: number, g: number, b: number): [number,number,number] {
  const l = Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b);
  const m = Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b);
  const s = Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
  return [0.2104542553*l+0.793617785*m-0.0040720468*s, 1.9779984951*l-2.4285922050*m+0.4505937099*s, 0.0259040371*l+0.7827717662*m-0.808675766*s];
}

function okToLin(L: number, a: number, b: number): [number,number,number] {
  const l=(L+0.3963377774*a+0.2158037573*b)**3;
  const m=(L-0.1055613458*a-0.0638541728*b)**3;
  const s=(L-0.0894841775*a-1.2914855480*b)**3;
  return [4.0767416621*l-3.3077115913*m+0.2309699292*s, -1.2684380046*l+2.6097574011*m-0.3413193965*s, -0.0041960863*l-0.7034186147*m+1.7076147010*s];
}

function linToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round((Math.max(0,Math.min(1,v)) <= 0.0031308 ? 12.92*Math.max(0,Math.min(1,v)) : 1.055*Math.max(0,Math.min(1,v))**(1/2.4)-0.055)*255).toString(16).padStart(2,'0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function adjustOk(hex: string, ls: number, cs: number): string {
  const [L,a,b] = linToOk(...hexToLin(hex));
  const ch = Math.sqrt(a*a+b*b), hu = Math.atan2(b,a);
  const nL = Math.max(0.05, Math.min(0.95, L + ls * 0.15));
  const nC = Math.max(0, ch + cs * 0.06);
  return linToHex(...okToLin(nL, nC*Math.cos(hu), nC*Math.sin(hu)));
}

function okDist(h1: string, h2: string): number {
  const [L1,a1,b1] = linToOk(...hexToLin(h1));
  const [L2,a2,b2] = linToOk(...hexToLin(h2));
  return Math.sqrt((L1-L2)**2+(a1-a2)**2+(b1-b2)**2);
}

// ─── Tipos de resultado interno ───────────────────────────────────────────────

interface LocalResult {
  hex: string;
  name: string;
  distance: number;
  isExact: boolean;
}

interface Interpretation {
  referenceHex: string;
  adjustedHex: string;
  description: string;
  lightnessShift: number;
  chromaShift: number;
  confidence: number;
  keywords: string[];
}

// ─── Motor de búsqueda offline ────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function interpret(query: string): Interpretation | null {
  const q = normalize(query);
  let best: typeof VOCAB[0] | null = null;
  let bestScore = 0;
  const matched: string[] = [];

  for (const entry of VOCAB) {
    for (const kw of entry.kw) {
      const k = normalize(kw);
      if (q.includes(k) && k.length > bestScore) {
        bestScore = k.length;
        best = entry;
        if (!matched.includes(kw)) matched.push(kw);
      }
    }
  }

  if (!best) return null;

  let ls = 0, cs = 0;
  for (const mod of LIGHTNESS) {
    for (const w of mod.words) { if (q.includes(normalize(w))) { ls = mod.shift; break; } }
  }
  for (const mod of SATURATION) {
    for (const w of mod.words) { if (q.includes(normalize(w))) { cs = mod.shift; break; } }
  }

  const adjustedHex = (ls !== 0 || cs !== 0) ? adjustOk(best.hex, ls, cs) : best.hex;

  return {
    referenceHex: best.hex,
    adjustedHex,
    description: best.desc,
    lightnessShift: ls,
    chromaShift: cs,
    confidence: Math.min(1, bestScore / 8),
    keywords: matched,
  };
}

/** Genera una paleta de variaciones alrededor del color interpretado */
function buildVariations(hex: string): LocalResult[] {
  const variations: Array<{ hex: string; name: string; ls: number; cs: number }> = [
    { hex, name: 'Color exacto', ls: 0, cs: 0 },
    { hex, name: 'Más claro', ls: 1, cs: 0 },
    { hex, name: 'Más oscuro', ls: -1, cs: 0 },
    { hex, name: 'Más suave / apagado', ls: 0, cs: -1 },
    { hex, name: 'Más vibrante', ls: 0, cs: 1 },
    { hex, name: 'Claro y suave', ls: 1, cs: -1 },
    { hex, name: 'Oscuro y saturado', ls: -1, cs: 1 },
    { hex, name: 'Muy claro (pastel)', ls: 2, cs: -0.5 },
  ];

  return variations.map((v) => {
    const resultHex = (v.ls === 0 && v.cs === 0) ? v.hex : adjustOk(v.hex, v.ls, v.cs);
    return {
      hex: resultHex,
      name: v.name,
      distance: okDist(hex, resultHex),
      isExact: v.ls === 0 && v.cs === 0,
    };
  });
}

// ─── helpers visuales ────────────────────────────────────────────────────────

function lum(hex: string) {
  const [r,g,b] = hexToLin(hex);
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
function textOn(bg: string) { return lum(bg) > 0.35 ? '#171815' : '#fffdf7'; }

const SUGGESTIONS = [
  'verde menta suave', 'azul marino profundo', 'beige cálido',
  'gris pizarra', 'terracota', 'rosa pálido',
  'mostaza', 'verde salvia', 'azul cielo',
  'blanco roto', 'naranja quemado', 'lila suave',
];

// ─── Componente ──────────────────────────────────────────────────────────────

export function ColorSearch() {
  const [query, setQuery] = useState('');
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [variations, setVariations] = useState<LocalResult[]>([]);
  const [selected, setSelected] = useState<LocalResult | null>(null);
  const [hasResult, setHasResult] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = (q: string) => {
    if (!q.trim()) {
      setInterpretation(null); setVariations([]); setHasResult(false); setSelected(null);
      return;
    }
    const interp = interpret(q);
    setInterpretation(interp);
    setSelected(null);
    if (interp) {
      setVariations(buildVariations(interp.adjustedHex));
    } else {
      setVariations([]);
    }
    setHasResult(true);
  };

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSuggestion = (s: string) => {
    setQuery(s);
    doSearch(s);
  };

  return (
    <div className="cs-root">

      {/* ── header ── */}
      <div className="cs-hero">
        <p className="eyebrow">BUSCADOR INTELIGENTE</p>
        <h2 className="cs-title">¿Qué color tenés en mente?</h2>
        <p className="cs-subtitle">
          Escribí como lo imaginás: "verde menta suave", "azul marino profundo", "terracota apagada"…
        </p>

        <div className="cs-search-wrap">
          <input
            className="cs-search-input"
            type="search"
            placeholder="Describí el color…"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            aria-label="Buscar color por descripción"
            autoComplete="off"
          />
        </div>

        {!query && (
          <div className="cs-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="cs-chip" onClick={() => handleSuggestion(s)}>{s}</button>
            ))}
          </div>
        )}
      </div>

      {/* ── interpretación ── */}
      {interpretation && (
        <div className="cs-interpretation">
          <div
            className="cs-ref-swatch"
            style={{ background: interpretation.adjustedHex, color: textOn(interpretation.adjustedHex) }}
          >
            <span>{interpretation.adjustedHex.toUpperCase()}</span>
            <small>Referencia</small>
          </div>
          <div className="cs-interp-info">
            <b>Interpreté: {interpretation.description}</b>
            <span>
              {interpretation.lightnessShift > 0 && 'más claro · '}
              {interpretation.lightnessShift < 0 && 'más oscuro · '}
              {interpretation.chromaShift < 0 && 'más apagado · '}
              {interpretation.chromaShift > 0 && 'más saturado · '}
              Confianza: {Math.round(interpretation.confidence * 100)}%
            </span>
            <div className="cs-keywords">
              {interpretation.keywords.map((k) => (
                <span key={k} className="cs-kw">{k}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── no encontró ── */}
      {hasResult && !interpretation && (
        <div className="cs-results-section">
          <p className="ca-offline-note">
            No reconocí ese color. Probá con: "verde menta", "azul marino", "terracota", "rosa suave"…
          </p>
        </div>
      )}

      {/* ── variaciones ── */}
      {variations.length > 0 && (
        <div className="cs-results-section">
          <p className="ca-section-label">VARIACIONES DEL COLOR — elegí la que más se acerca</p>
          <div className="cs-grid">
            {variations.map((v, i) => (
              <button
                key={i}
                className={`cs-card${selected?.hex === v.hex && selected?.name === v.name ? ' selected' : ''}`}
                onClick={() => setSelected(selected?.hex === v.hex && selected?.name === v.name ? null : v)}
                aria-pressed={selected?.hex === v.hex && selected?.name === v.name}
              >
                <div className="cs-card-swatch" style={{ background: v.hex }} aria-label={v.name} />
                <div className="cs-card-body">
                  <b>{v.name}</b>
                  <span>{v.hex.toUpperCase()}</span>
                  {v.isExact && (
                    <div className="cs-card-footer">
                      <span className="ca-stock-badge in">Exacto</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── detalle del seleccionado + acción ir a receta ── */}
      {selected && (
        <div className="cs-detail">
          <div
            className="cs-detail-swatch"
            style={{ background: selected.hex, color: textOn(selected.hex) }}
          >
            <div>
              <p className="eyebrow" style={{ color: 'inherit', opacity: 0.7 }}>COLOR SELECCIONADO</p>
              <h3 className="cs-detail-name">{selected.name}</h3>
            </div>
            <div>
              <span className="cs-detail-hex">{selected.hex.toUpperCase()}</span>
              {/* mini variaciones de mezcla */}
              <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
                {[selected.hex, adjustOk(selected.hex, 1, 0), adjustOk(selected.hex, -1, 0)].map((h, i) => (
                  <div
                    key={i}
                    style={{ width: 24, height: 24, background: h, border: '1px solid rgba(255,255,255,.3)' }}
                    title={i === 0 ? 'Exacto' : i === 1 ? 'Más claro' : 'Más oscuro'}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cs-detail-info">
            <div className="cs-detail-row"><span>Hex</span><b>{selected.hex.toUpperCase()}</b></div>
            <div className="cs-detail-row"><span>Variación</span><b>{selected.name}</b></div>

            {/* Acción principal: ver receta */}
            <div style={{ marginTop: 20 }}>
              <p className="ca-section-label">SIGUIENTE PASO</p>
              <a
                href={`/receta?hex=${encodeURIComponent(selected.hex)}`}
                className="primary-action full"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 44, fontSize: 12, textDecoration: 'none' }}
              >
                Ver cómo mezclar este color →
              </a>
              <p className="ca-fine-print" style={{ marginTop: 8 }}>
                Te mostramos qué pinturas base combinar y en qué proporción para llegar a este color exacto.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
