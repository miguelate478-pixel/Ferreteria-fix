'use client';

import { useMemo, useState } from 'react';
import { calculatePaint, optimizePackages } from '@ferreteria/calculation-engine';
import { ColorMixingAssistant } from './ColorMixingAssistant';
import { ColorSearch } from './ColorSearch';
import { PhotoVisualizer } from './PhotoVisualizer';
import { QuoteShare } from './QuoteShare';

const palettes = [
  {
    id: 'natural',
    name: 'Natural y luminosa',
    explanation: 'Los neutros cálidos amplían visualmente el ambiente y el oliva añade profundidad sin endurecerlo.',
    colors: ['#DDD6C8', '#B8AA91', '#68705A'],
  },
  {
    id: 'contemporary',
    name: 'Neutra contemporánea',
    explanation: 'Una base gris cálida ordena el espacio y el azul humo introduce contraste sereno con mobiliario claro.',
    colors: ['#D6D5CF', '#999C99', '#5D6872'],
  },
  {
    id: 'clay',
    name: 'Tierra editorial',
    explanation: 'La base crema recibe bien la luz media y el terracota crea un punto focal más expresivo.',
    colors: ['#E4D9C8', '#BFA58C', '#9A5E49'],
  },
];

const packages = [
  { id: '1L', liters: 1, price: 31.9, stock: 20 },
  { id: '4L', liters: 4, price: 104.9, stock: 12 },
  { id: '15L', liters: 15, price: 329.9, stock: 3 },
];

const LAYERS = ['Buscar color', 'Medidas', 'Superficies', 'Color', 'Visualizar', 'Cotización'];

export function ProjectStudio() {
  const [length, setLength] = useState(5);
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(2.5);
  const [coats, setCoats] = useState(2);
  const [coverage, setCoverage] = useState(10);
  const [surfaceFactor, setSurfaceFactor] = useState(0.85);
  const [waste, setWaste] = useState(10);
  const [selectedPalette, setSelectedPalette] = useState(palettes[0]);
  // 0=Brief 1=Medidas 2=Superficies 3=Color 4=Materiales 5=Cotización
  const [activeLayer, setActiveLayer] = useState(1);

  const result = useMemo(
    () =>
      calculatePaint({
        length,
        width,
        height,
        openings: [
          { width: 0.9, height: 2.1 },
          { width: 1.5, height: 1.2 },
        ],
        coats,
        nominalCoverage: coverage,
        surfaceFactor,
        wastePercent: waste,
      }),
    [length, width, height, coats, coverage, surfaceFactor, waste],
  );

  const packageSolution = useMemo(
    () => optimizePackages(result.litersRequired, packages),
    [result.litersRequired],
  );

  const materialsTotal = 186.7;
  const paintTotal = packageSolution?.totalPrice ?? 0;
  const grandTotal = paintTotal + materialsTotal;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  return (
    <main className="studio-shell" style={{ '--accent': selectedPalette.colors[2] } as React.CSSProperties}>
      <header className="studio-header">
        <div className="brand-lockup compact">
          <span className="brand-mark">T</span>
          <div>
            <strong>Taller de Color</strong>
            <small>Proyecto Dormitorio 01</small>
          </div>
        </div>
        <div className="project-status">
          <span className="status-dot" /> Guardado localmente
        </div>
        <a className="quiet-action" href="/">
          Salir
        </a>
      </header>

      <section className="workspace">
        {/* ── rail de capas ── */}
        <aside className="tool-rail">
          <p className="rail-label">CAPAS DEL PROYECTO</p>
          {LAYERS.map((item, index) => (
            <button
              key={item}
              className={index === activeLayer ? 'rail-item active' : 'rail-item'}
              onClick={() => setActiveLayer(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item}
            </button>
          ))}
          <div className="rail-note">
            <b>Dato confirmado</b>
            <p>Los 20 m² corresponden al piso, no a las paredes.</p>
          </div>
        </aside>

        {/* ── canvas principal ── */}
        <section className="canvas-column">
          <div className="canvas-heading">
            <div>
              <p className="eyebrow">AMBIENTE CENTRAL</p>
              <h1>Dormitorio principal</h1>
            </div>
            <span className="confidence">Medición guiada · alta confianza</span>
          </div>

          {/* capa 0 → Buscar color */}
          {activeLayer === 0 ? (
            <ColorSearch />
          ) : activeLayer === 3 ? (
            /* capa 3 → Mezclar / armonías / catálogo */
            <ColorMixingAssistant />
          ) : activeLayer === 4 ? (
            /* capa 4 → Visualizador sobre foto */
            <PhotoVisualizer />
          ) : activeLayer === 5 ? (
            /* capa 5 → Compartir cotización */
            <QuoteShare
              quote={{
                projectName: 'Dormitorio principal',
                ambientName: `Dormitorio 01 · ${length}×${width}×${height} m`,
                paintableArea: result.netWallArea,
                litersRequired: result.litersRequired,
                coats,
                palette: { name: selectedPalette.name, colors: selectedPalette.colors },
                packages: (packageSolution?.packages ?? []).map((p) => ({
                  id: p.id,
                  quantity: p.quantity,
                  price: p.price,
                })),
                materialsTotal: 186.7,
                grandTotal: grandTotal,
                currency: 'S/',
                branch: 'Sucursal Miraflores',
                validUntil: '31/07/2026',
              }}
              pdfUrl={`${apiUrl}/api/quotes/demo/pdf`}
            />
          ) : (
            <>
              <div className="room-canvas">
                <div className="room-ceiling" />
                <div
                  className="room-wall main-wall"
                  style={{ background: selectedPalette.colors[0] }}
                >
                  <div className="window">
                    <span>Luz natural media</span>
                  </div>
                  <div className="dimension horizontal">{length.toFixed(2)} m</div>
                  <div className="dimension vertical">{height.toFixed(2)} m</div>
                </div>
                <div
                  className="room-wall accent-wall"
                  style={{ background: selectedPalette.colors[2] }}
                >
                  <div className="door" />
                </div>
                <div className="room-floor" />
                <div className="bed">
                  <div className="pillow" />
                  <div className="pillow second" />
                </div>
                <div className="canvas-caption">
                  Simulación referencial: pantalla, luz, textura y acabado pueden alterar el resultado.
                </div>
              </div>

              <div className="palette-section">
                <div className="section-title">
                  <span>Direcciones de color</span>
                  <small>Selecciona una para actualizar el ambiente</small>
                </div>
                <div className="palette-list">
                  {palettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => setSelectedPalette(palette)}
                      className={
                        selectedPalette.id === palette.id ? 'palette-row selected' : 'palette-row'
                      }
                    >
                      <div className="palette-colors">
                        {palette.colors.map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}
                      </div>
                      <div>
                        <b>{palette.name}</b>
                        <p>{palette.explanation}</p>
                      </div>
                      <span>{selectedPalette.id === palette.id ? 'Elegida' : 'Probar'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── ficha viva ── */}
        <aside className="live-sheet">
          <div className="sheet-header">
            <p className="eyebrow">FICHA VIVA</p>
            <h2>Cantidad y presupuesto</h2>
          </div>

          <fieldset className="measurement-form">
            <legend>Medidas del ambiente</legend>
            <label>
              Largo
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
              <span>m</span>
            </label>
            <label>
              Ancho
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
              <span>m</span>
            </label>
            <label>
              Altura
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
              <span>m</span>
            </label>
            <label>
              Manos
              <input
                type="number"
                min="1"
                max="6"
                value={coats}
                onChange={(e) => setCoats(Number(e.target.value))}
              />
              <span>×</span>
            </label>
            <label>
              Rendimiento
              <input
                type="number"
                min="1"
                value={coverage}
                onChange={(e) => setCoverage(Number(e.target.value))}
              />
              <span>m²/L</span>
            </label>
            <label>
              Factor superficie
              <input
                type="number"
                min="0.5"
                max="1.1"
                step="0.05"
                value={surfaceFactor}
                onChange={(e) => setSurfaceFactor(Number(e.target.value))}
              />
              <span>f</span>
            </label>
            <label>
              Desperdicio
              <input
                type="number"
                min="0"
                max="50"
                value={waste}
                onChange={(e) => setWaste(Number(e.target.value))}
              />
              <span>%</span>
            </label>
          </fieldset>

          <div className="metric-stack">
            <div>
              <span>Área de piso</span>
              <strong>{result.floorArea.toFixed(2)} m²</strong>
            </div>
            <div>
              <span>Paredes brutas</span>
              <strong>{result.grossWallArea.toFixed(2)} m²</strong>
            </div>
            <div>
              <span>Puerta + ventana</span>
              <strong>− {result.openingArea.toFixed(2)} m²</strong>
            </div>
            <div className="metric-emphasis">
              <span>Área pintable</span>
              <strong>{result.netWallArea.toFixed(2)} m²</strong>
            </div>
          </div>

          <div className="coverage-meter">
            <div className="paint-can">
              <div style={{ height: `${Math.min(100, result.litersRequired * 6)}%` }} />
            </div>
            <div>
              <span>Pintura requerida</span>
              <strong>{result.litersRequired.toFixed(2)} L</strong>
              <small>Incluye {waste}% de margen</small>
            </div>
          </div>

          <div className="package-block">
            <div className="section-title">
              <span>Presentación sugerida</span>
              <small>Stock validado</small>
            </div>
            {packageSolution?.packages.map((item) => (
              <div className="package-line" key={item.id}>
                <span>
                  {item.quantity} × {item.id}
                </span>
                <b>S/ {(item.price * item.quantity).toFixed(2)}</b>
              </div>
            ))}
            <div className="stock-line">
              <span className="status-dot" /> Disponible en sucursal Miraflores
            </div>
          </div>

          <div className="materials-summary">
            <span>Materiales complementarios</span>
            <b>S/ {materialsTotal.toFixed(2)}</b>
            <small>Masilla, lijas, cinta, protección, rodillo, brocha y bandeja.</small>
          </div>

          <div className="quote-total">
            <span>Total estimado</span>
            <strong>S/ {grandTotal.toFixed(2)}</strong>
          </div>
          <a
            className="primary-action full"
            href={`${apiUrl}/api/quotes/demo/pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Generar cotización PDF
          </a>
          <p className="fine-print">
            Precio y stock de demostración. La cotización real debe congelar versión, sucursal y
            vigencia.
          </p>
        </aside>
      </section>
    </main>
  );
}
