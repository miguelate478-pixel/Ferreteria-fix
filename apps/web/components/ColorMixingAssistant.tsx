'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── tipos ───────────────────────────────────────────────────────────────────

interface ColorPart {
  hex: string;
  proportion: number;
  label: string;
}

interface CatalogColor {
  id: string;
  brand: string;
  code: string;
  name: string;
  rgbHex: string;
  family: string;
  distance: number;
  inStock: boolean;
  formulas: Array<{
    formula: unknown;
    productVariant: {
      sku: string;
      presentation: number;
      unit: string;
      product: { name: string; brand: string };
      inventoryBalances: Array<{
        available: number;
        location: { name: string; branch: { name: string } };
      }>;
    };
  }>;
}

interface MixResult {
  resultHex: string;
  parts: Array<{ hex: string; proportion: number }>;
  closestCatalogColors: CatalogColor[];
}

interface HarmonyResult {
  scheme: string;
  baseHex: string;
  colors: string[];
}

// ─── helpers de color ────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function textColor(bg: string): string {
  return luminance(bg) > 0.45 ? '#171815' : '#fffdf7';
}

// ─── componente ──────────────────────────────────────────────────────────────

const DEFAULT_PARTS: ColorPart[] = [
  { hex: '#FFFFFF', proportion: 70, label: 'Base blanca' },
  { hex: '#68705A', proportion: 30, label: 'Pigmento oliva' },
];

const SCHEMES = [
  { value: 'analogous', label: 'Análoga' },
  { value: 'complementary', label: 'Complementaria' },
  { value: 'triadic', label: 'Triádica' },
  { value: 'split', label: 'Split' },
] as const;

const FAMILY_LABELS: Record<string, string> = {
  NEUTRAL: 'Neutros',
  BEIGE: 'Beiges',
  GREEN: 'Verdes',
  BLUE: 'Azules',
  RED: 'Rojos',
  YELLOW: 'Amarillos',
  ORANGE: 'Naranjas',
  PURPLE: 'Violetas',
  BROWN: 'Marrones',
  GRAY: 'Grises',
  WHITE: 'Blancos',
  BLACK: 'Negros',
};

export function ColorMixingAssistant() {
  const apiUrl =
    typeof process !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000')
      : 'http://localhost:4000';

  const [parts, setParts] = useState<ColorPart[]>(DEFAULT_PARTS);
  const [mixResult, setMixResult] = useState<MixResult | null>(null);
  const [harmony, setHarmony] = useState<HarmonyResult | null>(null);
  const [scheme, setScheme] = useState<'analogous' | 'complementary' | 'triadic' | 'split'>('analogous');
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState<CatalogColor[]>([]);
  const [loadingMix, setLoadingMix] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [activeTab, setActiveTab] = useState<'mix' | 'harmony' | 'catalog'>('mix');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── catálogo ──────────────────────────────────────────────────────────────

  const fetchCatalog = useCallback(
    async (q: string) => {
      setLoadingCatalog(true);
      try {
        const params = new URLSearchParams();
        if (q) params.set('search', q);
        const res = await fetch(`${apiUrl}/api/colors?${params.toString()}`);
        if (res.ok) {
          const data = (await res.json()) as CatalogColor[];
          setCatalog(data);
        }
      } catch {
        // API no disponible en modo demo
      } finally {
        setLoadingCatalog(false);
      }
    },
    [apiUrl],
  );

  useEffect(() => {
    if (activeTab !== 'catalog') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCatalog(search), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeTab, fetchCatalog]);

  // ── mezcla ────────────────────────────────────────────────────────────────

  const doMix = async () => {
    setLoadingMix(true);
    setMixResult(null);
    try {
      const res = await fetch(`${apiUrl}/api/colors/mix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts: parts.map(({ hex, proportion }) => ({ hex, proportion })) }),
      });
      if (res.ok) {
        const data = (await res.json()) as MixResult;
        setMixResult(data);
      }
    } catch {
      // demo offline: calcular localmente
      const resultHex = mixLocal(parts);
      setMixResult({ resultHex, parts, closestCatalogColors: [] });
    } finally {
      setLoadingMix(false);
    }
  };

  // ── armonía ───────────────────────────────────────────────────────────────

  const doHarmony = async () => {
    const base = mixResult?.resultHex ?? parts[0]?.hex ?? '#DDD6C8';
    try {
      const res = await fetch(
        `${apiUrl}/api/colors/harmony?hex=${encodeURIComponent(base)}&scheme=${scheme}`,
      );
      if (res.ok) {
        const data = (await res.json()) as HarmonyResult;
        setHarmony(data);
      }
    } catch {
      /* offline */
    }
  };

  // ── parts CRUD ────────────────────────────────────────────────────────────

  const updatePart = (i: number, field: keyof ColorPart, value: string | number) => {
    setParts((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };

  const addPart = () => {
    setParts((prev) => [...prev, { hex: '#A0A0A0', proportion: 10, label: `Color ${prev.length + 1}` }]);
  };

  const removePart = (i: number) => {
    if (parts.length <= 2) return;
    setParts((prev) => prev.filter((_, idx) => idx !== i));
  };

  // ── total de proporciones ─────────────────────────────────────────────────

  const totalProp = parts.reduce((s, p) => s + p.proportion, 0);

  return (
    <div className="color-assistant">
      {/* ─ header ─ */}
      <div className="ca-header">
        <p className="eyebrow">ASISTENTE DE COLOR</p>
        <h2 className="ca-title">Combinador de colores</h2>
        <p className="ca-subtitle">
          Mezcla colores por proporción y encuentra el equivalente más cercano en el catálogo con stock.
        </p>
      </div>

      {/* ─ tabs ─ */}
      <div className="ca-tabs">
        {(['mix', 'harmony', 'catalog'] as const).map((tab) => (
          <button
            key={tab}
            className={`ca-tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'mix' ? 'Mezclar' : tab === 'harmony' ? 'Armonías' : 'Catálogo'}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: MEZCLAR ══════════ */}
      {activeTab === 'mix' && (
        <div className="ca-body">
          <div className="ca-mix-grid">
            {/* columna izquierda: inputs */}
            <div>
              <p className="ca-section-label">PARTES DE LA MEZCLA</p>

              {parts.map((part, i) => (
                <div key={i} className="ca-part-row">
                  {/* swatch del color */}
                  <label className="ca-color-pick" aria-label={`Color ${i + 1}`}>
                    <span className="ca-color-dot" style={{ background: part.hex }} />
                    <input
                      type="color"
                      value={part.hex}
                      onChange={(e) => updatePart(i, 'hex', e.target.value)}
                      className="ca-color-input"
                      aria-label={`Seleccionar color ${i + 1}`}
                    />
                  </label>

                  {/* nombre */}
                  <input
                    className="ca-text-input"
                    placeholder="Nombre…"
                    value={part.label}
                    onChange={(e) => updatePart(i, 'label', e.target.value)}
                    aria-label={`Nombre del color ${i + 1}`}
                  />

                  {/* proporción */}
                  <div className="ca-prop-group">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={part.proportion}
                      onChange={(e) => updatePart(i, 'proportion', Math.max(1, Number(e.target.value)))}
                      className="ca-num-input"
                      aria-label={`Proporción del color ${i + 1}`}
                    />
                    <span className="ca-unit">%</span>
                  </div>

                  {/* barra de proporción */}
                  <div className="ca-prop-bar-wrap" title={`${Math.round((part.proportion / totalProp) * 100)}% de la mezcla`}>
                    <div
                      className="ca-prop-bar"
                      style={{
                        width: `${Math.round((part.proportion / totalProp) * 100)}%`,
                        background: part.hex,
                      }}
                    />
                  </div>

                  <button
                    className="ca-remove-btn"
                    onClick={() => removePart(i)}
                    disabled={parts.length <= 2}
                    aria-label={`Eliminar color ${i + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="ca-actions-row">
                <button className="ca-ghost-btn" onClick={addPart}>
                  + Agregar color
                </button>
                <button className="primary-action ca-mix-btn" onClick={doMix} disabled={loadingMix}>
                  {loadingMix ? 'Calculando…' : 'Mezclar'}
                </button>
              </div>
            </div>

            {/* columna derecha: resultado */}
            <div>
              <p className="ca-section-label">RESULTADO</p>
              {mixResult ? (
                <>
                  {/* swatch grande del resultado */}
                  <div
                    className="ca-result-swatch"
                    style={{ background: mixResult.resultHex, color: textColor(mixResult.resultHex) }}
                  >
                    <span className="ca-result-hex">{mixResult.resultHex.toUpperCase()}</span>
                    <div className="ca-result-parts">
                      {mixResult.parts.map((p, i) => (
                        <div key={i} className="ca-result-part-dot" style={{ background: p.hex }} title={`${p.proportion}%`} />
                      ))}
                    </div>
                  </div>

                  {/* preview de la proporción como bandas */}
                  <div className="ca-mix-bands">
                    {parts.map((p, i) => (
                      <div
                        key={i}
                        className="ca-band"
                        style={{ flex: p.proportion, background: p.hex }}
                        title={`${p.label}: ${Math.round((p.proportion / totalProp) * 100)}%`}
                      />
                    ))}
                  </div>
                  <p className="ca-band-caption">Proporciones relativas de la mezcla</p>

                  {/* coincidencias del catálogo */}
                  {mixResult.closestCatalogColors.length > 0 && (
                    <div className="ca-matches">
                      <p className="ca-section-label" style={{ marginTop: 20 }}>
                        COLORES MÁS CERCANOS EN CATÁLOGO
                      </p>
                      {mixResult.closestCatalogColors.map((c) => (
                        <div key={c.id} className="ca-match-row">
                          <div
                            className="ca-match-dot"
                            style={{ background: c.rgbHex }}
                            title={c.rgbHex}
                          />
                          <div className="ca-match-info">
                            <b>{c.name}</b>
                            <span>{c.brand} · {c.code} · {FAMILY_LABELS[c.family] ?? c.family}</span>
                          </div>
                          <div className="ca-match-meta">
                            <span className="ca-delta" title="Diferencia perceptual (menor = más parecido)">
                              Δ {c.distance}
                            </span>
                            <span className={`ca-stock-badge${c.inStock ? ' in' : ' out'}`}>
                              {c.inStock ? 'En stock' : 'Sin stock'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {mixResult.closestCatalogColors.length === 0 && (
                    <p className="ca-offline-note">
                      API no disponible · El color resultante es una aproximación local.
                      Conecta la API para ver coincidencias del catálogo.
                    </p>
                  )}
                </>
              ) : (
                <div className="ca-empty-result">
                  <div className="ca-empty-swatch" />
                  <p>Configura los colores y presiona <strong>Mezclar</strong></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: ARMONÍAS ══════════ */}
      {activeTab === 'harmony' && (
        <div className="ca-body">
          <p className="ca-section-label">COLOR BASE</p>
          <div className="ca-harmony-controls">
            <label className="ca-color-pick large" aria-label="Color base para armonía">
              <span
                className="ca-color-dot large"
                style={{ background: mixResult?.resultHex ?? parts[0]?.hex ?? '#DDD6C8' }}
              />
              <input
                type="color"
                value={mixResult?.resultHex ?? parts[0]?.hex ?? '#DDD6C8'}
                onChange={(e) => setParts((prev) => [{ ...prev[0], hex: e.target.value }, ...prev.slice(1)])}
                className="ca-color-input"
                aria-label="Seleccionar color base"
              />
            </label>
            <span className="ca-hex-label">{(mixResult?.resultHex ?? parts[0]?.hex ?? '#DDD6C8').toUpperCase()}</span>

            <select
              value={scheme}
              onChange={(e) => setScheme(e.target.value as typeof scheme)}
              className="ca-select"
              aria-label="Esquema armónico"
            >
              {SCHEMES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <button className="primary-action" onClick={doHarmony}>
              Generar
            </button>
          </div>

          {harmony && (
            <>
              <p className="ca-section-label" style={{ marginTop: 24 }}>PALETA {harmony.scheme.toUpperCase()}</p>
              <div className="ca-harmony-swatches">
                {harmony.colors.map((hex, i) => (
                  <div key={i} className="ca-harmony-swatch" style={{ background: hex, color: textColor(hex) }}>
                    <span>{hex.toUpperCase()}</span>
                    {i === 0 && <small>Base</small>}
                  </div>
                ))}
              </div>
              <p className="ca-fine-print">
                Paleta generada en espacio OkLCh. Los colores son referenciales; la pantalla, la textura y el acabado alteran el resultado final.
              </p>
            </>
          )}

          {!harmony && (
            <div className="ca-empty-result" style={{ marginTop: 32 }}>
              <p>Selecciona un esquema y presiona <strong>Generar</strong></p>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB: CATÁLOGO ══════════ */}
      {activeTab === 'catalog' && (
        <div className="ca-body">
          <div className="ca-catalog-search">
            <input
              className="ca-text-input wide"
              placeholder="Buscar por nombre o código…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar en el catálogo de colores"
            />
          </div>

          {loadingCatalog && <p className="ca-loading">Buscando…</p>}

          {!loadingCatalog && catalog.length === 0 && (
            <p className="ca-offline-note">
              No se encontraron colores. Verifica que la API esté corriendo y tenga datos cargados.
            </p>
          )}

          {!loadingCatalog && catalog.length > 0 && (
            <div className="ca-catalog-list">
              {catalog.map((c) => (
                <div key={c.id} className="ca-catalog-row">
                  <div className="ca-catalog-swatch" style={{ background: c.rgbHex }} title={c.rgbHex} />
                  <div className="ca-catalog-info">
                    <b>{c.name}</b>
                    <span>{c.code} · {c.brand} · {FAMILY_LABELS[c.family] ?? c.family}</span>
                    <span className="ca-catalog-hex">{c.rgbHex.toUpperCase()}</span>
                  </div>
                  <div className="ca-catalog-status">
                    {c.formulas.length > 0 ? (
                      c.formulas.map((f, fi) => {
                        const totalStock = f.productVariant.inventoryBalances.reduce(
                          (s, ib) => s + Number(ib.available),
                          0,
                        );
                        return (
                          <div key={fi} className="ca-formula-line">
                            <span className="ca-formula-product">{f.productVariant.product.name}</span>
                            <span className="ca-formula-pres">
                              {f.productVariant.presentation} {f.productVariant.unit}
                            </span>
                            <span className={`ca-stock-badge${totalStock > 0 ? ' in' : ' out'}`}>
                              {totalStock > 0 ? `${totalStock} en stock` : 'Sin stock'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <span className="ca-no-formula">Sin fórmula asignada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── fallback de mezcla local (sin API) ──────────────────────────────────────

function mixLocal(parts: ColorPart[]): string {
  const total = parts.reduce((s, p) => s + p.proportion, 0);
  if (total === 0) return '#808080';
  let r = 0, g = 0, b = 0;
  for (const p of parts) {
    const w = p.proportion / total;
    const h = p.hex.replace('#', '');
    r += w * parseInt(h.substring(0, 2), 16);
    g += w * parseInt(h.substring(2, 4), 16);
    b += w * parseInt(h.substring(4, 6), 16);
  }
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}
