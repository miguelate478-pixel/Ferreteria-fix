'use client';

import { useCallback, useRef, useState } from 'react';

// ─── tipos ───────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  brand: string;
  code: string;
  name: string;
  rgbHex: string;
  family: string;
  distance: number;
  inStock: boolean;
  formulas: Array<{
    productVariant: {
      sku: string;
      presentation: number;
      unit: string;
      product: { name: string; brand: string };
      inventoryBalances: Array<{ available: number; location: { branch: { name: string } } }>;
    };
  }>;
}

interface SearchResponse {
  query: string;
  interpreted: {
    referenceHex: string;
    description: string;
    confidence: number;
    lightnessShift: number;
    chromaShift: number;
    matchedKeywords: string[];
  } | null;
  results: SearchResult[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function textOn(bg: string) { return luminance(bg) > 0.45 ? '#171815' : '#fffdf7'; }

const SUGGESTIONS = [
  'verde menta suave',
  'azul marino profundo',
  'beige cálido',
  'gris pizarra',
  'terracota',
  'rosa pálido',
  'mostaza',
  'verde salvia',
  'azul cielo',
  'blanco roto',
  'naranja quemado',
  'lila suave',
];

// ─── componente ──────────────────────────────────────────────────────────────

export function ColorSearch() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) { setResponse(null); return; }
      setLoading(true);
      try {
        const res = await fetch(
          `${apiUrl}/api/colors/search?q=${encodeURIComponent(q)}&limit=8`,
        );
        if (res.ok) setResponse((await res.json()) as SearchResponse);
      } catch {
        // offline: mostrar estado vacío con mensaje
        setResponse({ query: q, interpreted: null, results: [] });
      } finally {
        setLoading(false);
      }
    },
    [apiUrl],
  );

  const handleInput = (val: string) => {
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 420);
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
          Escribí como lo imaginas: "verde menta suave", "azul marino profundo", "terracota apagada"…
        </p>

        {/* campo de búsqueda */}
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
          {loading && <span className="cs-spinner" aria-label="Buscando" />}
        </div>

        {/* sugerencias */}
        {!query && (
          <div className="cs-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="cs-chip"
                onClick={() => handleSuggestion(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── interpretación ── */}
      {response?.interpreted && (
        <div className="cs-interpretation">
          <div
            className="cs-ref-swatch"
            style={{
              background: response.interpreted.referenceHex,
              color: textOn(response.interpreted.referenceHex),
            }}
          >
            <span>{response.interpreted.referenceHex.toUpperCase()}</span>
            <small>Referencia</small>
          </div>
          <div className="cs-interp-info">
            <b>Interpreté: {response.interpreted.description}</b>
            <span>
              {response.interpreted.lightnessShift > 0 && 'más claro · '}
              {response.interpreted.lightnessShift < 0 && 'más oscuro · '}
              {response.interpreted.chromaShift > 0 && 'más saturado · '}
              {response.interpreted.chromaShift < 0 && 'más apagado · '}
              Confianza: {Math.round(response.interpreted.confidence * 100)}%
            </span>
            <div className="cs-keywords">
              {response.interpreted.matchedKeywords.map((k) => (
                <span key={k} className="cs-kw">{k}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── resultados ── */}
      {response && (
        <div className="cs-results-section">
          {response.results.length === 0 ? (
            <p className="ca-offline-note">
              {response.interpreted === null
                ? 'No se pudo interpretar la búsqueda. Probá con otra descripción.'
                : 'No hay colores en el catálogo todavía. Cargá colores desde el panel de administración.'}
            </p>
          ) : (
            <>
              <p className="ca-section-label">{response.results.length} COLORES MÁS CERCANOS</p>
              <div className="cs-grid">
                {response.results.map((c) => (
                  <button
                    key={c.id}
                    className={`cs-card${selected?.id === c.id ? ' selected' : ''}`}
                    onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    aria-pressed={selected?.id === c.id}
                  >
                    <div
                      className="cs-card-swatch"
                      style={{ background: c.rgbHex }}
                      aria-label={`Color ${c.name}`}
                    />
                    <div className="cs-card-body">
                      <b>{c.name}</b>
                      <span>{c.code} · {c.brand}</span>
                      <div className="cs-card-footer">
                        <span className="cs-delta" title="Distancia perceptual OkLab">Δ {c.distance}</span>
                        <span className={`ca-stock-badge${c.inStock ? ' in' : ' out'}`}>
                          {c.inStock ? 'En stock' : 'Sin stock'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── detalle del color seleccionado ── */}
      {selected && (
        <div className="cs-detail">
          <div
            className="cs-detail-swatch"
            style={{ background: selected.rgbHex, color: textOn(selected.rgbHex) }}
          >
            <div>
              <p className="eyebrow" style={{ color: 'inherit', opacity: 0.7 }}>COLOR SELECCIONADO</p>
              <h3 className="cs-detail-name">{selected.name}</h3>
            </div>
            <div>
              <span className="cs-detail-hex">{selected.rgbHex.toUpperCase()}</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[selected.rgbHex, '#FFFFFF', '#DDD6C8'].map((mix, i) => (
                  <div
                    key={i}
                    style={{ width: 22, height: 22, background: mix, border: '1px solid rgba(255,255,255,.3)' }}
                    title={i === 0 ? 'Color puro' : i === 1 ? 'Con blanco' : 'Con base neutra'}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="cs-detail-info">
            <div className="cs-detail-row"><span>Código</span><b>{selected.code}</b></div>
            <div className="cs-detail-row"><span>Marca</span><b>{selected.brand}</b></div>
            <div className="cs-detail-row"><span>Familia</span><b>{selected.family}</b></div>
            <div className="cs-detail-row"><span>Hex</span><b>{selected.rgbHex.toUpperCase()}</b></div>

            {selected.formulas.length > 0 ? (
              <>
                <p className="ca-section-label" style={{ marginTop: 16 }}>PRESENTACIONES CON FÓRMULA</p>
                {selected.formulas.map((f, i) => {
                  const stock = f.productVariant.inventoryBalances.reduce(
                    (s, ib) => s + Number(ib.available), 0,
                  );
                  return (
                    <div key={i} className="cs-formula-card">
                      <div>
                        <b>{f.productVariant.product.name}</b>
                        <span>{f.productVariant.presentation} {f.productVariant.unit} · SKU: {f.productVariant.sku}</span>
                        {f.productVariant.inventoryBalances.map((ib, j) => (
                          <span key={j} className="cs-branch">
                            {ib.location.branch.name}: {Number(ib.available)} uds
                          </span>
                        ))}
                      </div>
                      <span className={`ca-stock-badge${stock > 0 ? ' in' : ' out'}`}>
                        {stock > 0 ? `${stock} en stock` : 'Sin stock'}
                      </span>
                    </div>
                  );
                })}
              </>
            ) : (
              <p className="ca-offline-note" style={{ marginTop: 12 }}>
                Sin fórmula asignada. Consultá con el vendedor.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
