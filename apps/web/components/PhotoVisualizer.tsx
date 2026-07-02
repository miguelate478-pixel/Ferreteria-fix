'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ─── tipos ───────────────────────────────────────────────────────────────────

type Tool = 'brush' | 'eraser';

interface Palette {
  id: string;
  name: string;
  colors: string[];
}

// ─── paletas de demo ─────────────────────────────────────────────────────────

const DEMO_PALETTES: Palette[] = [
  { id: 'natural', name: 'Natural y luminosa', colors: ['#DDD6C8', '#B8AA91', '#68705A'] },
  { id: 'contemporary', name: 'Neutra contemporánea', colors: ['#D6D5CF', '#999C99', '#5D6872'] },
  { id: 'clay', name: 'Tierra editorial', colors: ['#E4D9C8', '#BFA58C', '#9A5E49'] },
  { id: 'mint', name: 'Verde menta', colors: ['#AAD9B8', '#C8E6C9', '#6B9E7A'] },
  { id: 'navy', name: 'Azul marino', colors: ['#B3CCDD', '#607D8B', '#0D2B5E'] },
];

const COLOR_ROLE_LABELS = ['Principal', 'Secundario', 'Acento'];

// ─── helpers de canvas ───────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha = 1): [number, number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    Math.round(alpha * 255),
  ];
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function textOn(bg: string) { return luminance(bg) > 0.45 ? '#171815' : '#fffdf7'; }

// ─── componente ──────────────────────────────────────────────────────────────

export function PhotoVisualizer() {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [tool, setTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState(28);
  const [selectedPalette, setSelectedPalette] = useState<Palette>(DEMO_PALETTES[0]);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showBefore, setShowBefore] = useState(false);
  const [opacity, setOpacity] = useState(0.72);
  const historyRef = useRef<ImageData[]>([]);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const activeColor = selectedPalette.colors[selectedColorIdx];

  // ── cargar imagen ────────────────────────────────────────────────────────

  const loadImage = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Redimensionar a máximo 900px de ancho
        const MAX_W = 900;
        const scale = img.width > MAX_W ? MAX_W / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        setImgSize({ w, h });
        setImageSrc(src);

        // Limpiar máscara cuando se carga nueva imagen
        requestAnimationFrame(() => {
          const mask = maskRef.current;
          if (mask) {
            mask.width = w;
            mask.height = h;
            mask.getContext('2d')?.clearRect(0, 0, w, h);
          }
          historyRef.current = [];
        });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) loadImage(file);
  };

  // ── dibujar máscara ──────────────────────────────────────────────────────

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = maskRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const saveHistory = useCallback(() => {
    const mask = maskRef.current;
    if (!mask) return;
    const ctx = mask.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, mask.width, mask.height);
    historyRef.current = [...historyRef.current.slice(-20), data];
  }, []);

  const drawStroke = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const mask = maskRef.current;
      if (!mask) return;
      const ctx = mask.getContext('2d');
      if (!ctx) return;

      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = tool === 'eraser' ? 1 : opacity;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      renderResult();
    },
    [tool, activeColor, brushSize, opacity],
  );

  const onPointerDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      saveHistory();
      const pos = getPos(e);
      if (!pos) return;
      setIsDrawing(true);
      lastPosRef.current = pos;

      // Punto único
      const mask = maskRef.current;
      if (!mask) return;
      const ctx = mask.getContext('2d');
      if (!ctx) return;
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.fillStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : activeColor;
      ctx.globalAlpha = tool === 'eraser' ? 1 : opacity;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      renderResult();
    },
    [getPos, saveHistory, tool, activeColor, brushSize, opacity],
  );

  const onPointerMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      if (!pos || !lastPosRef.current) return;
      drawStroke(lastPosRef.current, pos);
      lastPosRef.current = pos;
    },
    [isDrawing, getPos, drawStroke],
  );

  const onPointerUp = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  // ── renderizar resultado ─────────────────────────────────────────────────

  const renderResult = useCallback(() => {
    const canvas = canvasRef.current;
    const mask = maskRef.current;
    const result = resultRef.current;
    if (!canvas || !mask || !result || !imageSrc) return;

    const ctx = result.getContext('2d');
    if (!ctx) return;

    result.width = canvas.width;
    result.height = canvas.height;

    // 1. Dibujar foto original
    ctx.drawImage(canvas, 0, 0);

    // 2. Aplicar máscara encima con blend mode multiply para respetar sombras
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }, [imageSrc]);

  // ── cargar imagen en canvas base ─────────────────────────────────────────

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = imgSize.w;
      canvas.height = imgSize.h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, imgSize.w, imgSize.h);
      renderResult();
    };
    img.src = imageSrc;
  }, [imageSrc, imgSize, renderResult]);

  // ── re-renderizar cuando cambia la paleta/color/opacidad ────────────────

  useEffect(() => {
    if (imageSrc) renderResult();
  }, [selectedPalette, selectedColorIdx, opacity, renderResult, imageSrc]);

  // ── deshacer ─────────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const mask = maskRef.current;
    if (!mask) return;
    const ctx = mask.getContext('2d');
    if (!ctx) return;
    const prev = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    ctx.putImageData(prev, 0, 0);
    renderResult();
  }, [renderResult]);

  // ── limpiar máscara ──────────────────────────────────────────────────────

  const clearMask = useCallback(() => {
    const mask = maskRef.current;
    if (!mask) return;
    saveHistory();
    mask.getContext('2d')?.clearRect(0, 0, mask.width, mask.height);
    renderResult();
  }, [saveHistory, renderResult]);

  // ── descargar resultado ──────────────────────────────────────────────────

  const download = useCallback(() => {
    const result = resultRef.current;
    if (!result) return;
    const a = document.createElement('a');
    a.download = 'visualizacion-color.png';
    a.href = result.toDataURL('image/png');
    a.click();
  }, []);

  // ── teclado ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.key === 'b') setTool('brush');
      if (e.key === 'e') setTool('eraser');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo]);

  return (
    <div className="pv-root">
      {/* ── header ── */}
      <div className="pv-header">
        <p className="eyebrow">VISUALIZADOR DE COLOR</p>
        <h2 className="pv-title">Probá el color en tu espacio</h2>
        <p className="pv-subtitle">
          Subí una foto, pintá las paredes con el pincel y elegí una paleta para ver el resultado.
        </p>
      </div>

      {!imageSrc ? (
        /* ── zona de carga ── */
        <div
          className="pv-dropzone"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          role="button"
          tabIndex={0}
          aria-label="Cargar foto del ambiente"
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        >
          <div className="pv-drop-icon">📷</div>
          <p className="pv-drop-title">Arrastrá una foto o hacé clic aquí</p>
          <p className="pv-drop-sub">JPG, PNG · Máximo 10 MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            aria-label="Seleccionar foto"
          />
        </div>
      ) : (
        <div className="pv-workspace" ref={containerRef}>
          {/* ── barra de herramientas ── */}
          <div className="pv-toolbar">
            <div className="pv-tool-group">
              <button
                className={`pv-tool-btn${tool === 'brush' ? ' active' : ''}`}
                onClick={() => setTool('brush')}
                title="Pincel (B)"
                aria-pressed={tool === 'brush'}
              >
                Pincel
              </button>
              <button
                className={`pv-tool-btn${tool === 'eraser' ? ' active' : ''}`}
                onClick={() => setTool('eraser')}
                title="Borrador (E)"
                aria-pressed={tool === 'eraser'}
              >
                Borrador
              </button>
            </div>

            <label className="pv-slider-label">
              Tamaño
              <input
                type="range"
                min={8}
                max={80}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="pv-slider"
                aria-label="Tamaño del pincel"
              />
              <span>{brushSize}px</span>
            </label>

            <label className="pv-slider-label">
              Opacidad
              <input
                type="range"
                min={20}
                max={100}
                value={Math.round(opacity * 100)}
                onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                className="pv-slider"
                aria-label="Opacidad del color"
              />
              <span>{Math.round(opacity * 100)}%</span>
            </label>

            <div className="pv-tool-group">
              <button className="pv-ghost-btn" onClick={undo} title="Deshacer (Ctrl+Z)">↩ Deshacer</button>
              <button className="pv-ghost-btn" onClick={clearMask}>✕ Limpiar</button>
              <button
                className={`pv-ghost-btn${showBefore ? ' active' : ''}`}
                onMouseDown={() => setShowBefore(true)}
                onMouseUp={() => setShowBefore(false)}
                onTouchStart={() => setShowBefore(true)}
                onTouchEnd={() => setShowBefore(false)}
                aria-pressed={showBefore}
              >
                Antes
              </button>
              <button className="pv-ghost-btn" onClick={download}>↓ Descargar</button>
              <button
                className="pv-ghost-btn"
                onClick={() => { setImageSrc(null); if (fileRef.current) fileRef.current.value = ''; }}
              >
                Nueva foto
              </button>
            </div>
          </div>

          {/* ── área canvas ── */}
          <div className="pv-canvas-area">
            <div
              className="pv-canvas-wrap"
              style={{ width: imgSize.w, maxWidth: '100%', position: 'relative' }}
            >
              {/* canvas base (foto) — oculto, solo para referencia */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* resultado (foto + máscara) */}
              <canvas
                ref={resultRef}
                style={{
                  display: showBefore ? 'none' : 'block',
                  maxWidth: '100%',
                  cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                  touchAction: 'none',
                }}
                aria-label="Vista previa con color aplicado"
              />

              {/* foto original para modo antes */}
              {showBefore && (
                <canvas
                  ref={canvasRef}
                  style={{ display: 'block', maxWidth: '100%' }}
                  aria-label="Foto original"
                />
              )}

              {/* canvas de máscara — invisible pero recibe eventos */}
              <canvas
                ref={maskRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                  touchAction: 'none',
                  maxWidth: '100%',
                }}
                onMouseDown={onPointerDown}
                onMouseMove={onPointerMove}
                onMouseUp={onPointerUp}
                onMouseLeave={onPointerUp}
                onTouchStart={onPointerDown}
                onTouchMove={onPointerMove}
                onTouchEnd={onPointerUp}
                role="img"
                aria-label="Área de pintura"
              />

              <div className="pv-canvas-note">
                Simulación referencial · El resultado real depende de la pintura, acabado, textura e iluminación
              </div>
            </div>

            {/* ── selector de paleta y color ── */}
            <div className="pv-palette-panel">
              <p className="ca-section-label">PALETA</p>

              {DEMO_PALETTES.map((p) => (
                <button
                  key={p.id}
                  className={`pv-palette-row${selectedPalette.id === p.id ? ' active' : ''}`}
                  onClick={() => { setSelectedPalette(p); setSelectedColorIdx(0); }}
                  aria-pressed={selectedPalette.id === p.id}
                >
                  <div className="pv-palette-swatches">
                    {p.colors.map((c) => (
                      <span key={c} className="pv-palette-dot" style={{ background: c }} />
                    ))}
                  </div>
                  <span>{p.name}</span>
                </button>
              ))}

              <p className="ca-section-label" style={{ marginTop: 20 }}>COLOR ACTIVO</p>
              <div className="pv-color-row">
                {selectedPalette.colors.map((c, i) => (
                  <button
                    key={c}
                    className={`pv-color-btn${selectedColorIdx === i ? ' active' : ''}`}
                    style={{ background: c, color: textOn(c), borderColor: selectedColorIdx === i ? '#171815' : 'transparent' }}
                    onClick={() => setSelectedColorIdx(i)}
                    aria-pressed={selectedColorIdx === i}
                    title={COLOR_ROLE_LABELS[i]}
                  >
                    <small>{COLOR_ROLE_LABELS[i]}</small>
                    <span>{c.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <p className="ca-section-label" style={{ marginTop: 20 }}>INSTRUCCIONES</p>
              <div className="pv-instructions">
                <p>① Subí una foto de tu ambiente</p>
                <p>② Pintá las superficies con el pincel</p>
                <p>③ Elegí la paleta y el color</p>
                <p>④ Usá "Borrador" para corregir</p>
                <p>⑤ Mantené "Antes" para comparar</p>
                <p>⑥ Descargá el resultado</p>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
