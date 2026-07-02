'use client';

import { useState } from 'react';

// ─── tipos ───────────────────────────────────────────────────────────────────

export interface QuoteData {
  projectName: string;
  ambientName: string;
  paintableArea: number;
  litersRequired: number;
  coats: number;
  palette: { name: string; colors: string[] };
  packages: Array<{ id: string; quantity: number; price: number }>;
  materialsTotal: number;
  grandTotal: number;
  currency: string;
  branch: string;
  validUntil?: string;
}

interface QuoteShareProps {
  quote: QuoteData;
  pdfUrl?: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function buildWhatsAppText(q: QuoteData, pdfUrl?: string): string {
  const lines: string[] = [];
  lines.push(`*🎨 Cotización – ${q.projectName}*`);
  lines.push(`Ambiente: ${q.ambientName}`);
  lines.push('');
  lines.push('*Resumen técnico*');
  lines.push(`• Área pintable: ${q.paintableArea.toFixed(2)} m²`);
  lines.push(`• Pintura requerida: ${q.litersRequired.toFixed(2)} L`);
  lines.push(`• Número de manos: ${q.coats}`);
  lines.push(`• Paleta elegida: ${q.palette.name}`);
  lines.push('');
  lines.push('*Productos*');
  for (const pkg of q.packages) {
    if (pkg.quantity > 0) {
      lines.push(`• ${pkg.quantity} × ${pkg.id} — ${formatCurrency(pkg.price * pkg.quantity, q.currency)}`);
    }
  }
  lines.push(`• Materiales complementarios — ${formatCurrency(q.materialsTotal, q.currency)}`);
  lines.push('');
  lines.push(`*Total estimado: ${formatCurrency(q.grandTotal, q.currency)}*`);
  lines.push('');
  lines.push(`📍 Disponible en ${q.branch}`);
  if (q.validUntil) lines.push(`📅 Válido hasta: ${q.validUntil}`);
  if (pdfUrl) lines.push(`\n📄 Ver cotización completa: ${pdfUrl}`);
  lines.push('\n_Taller de Color – Estudio digital de proyectos_');
  return lines.join('\n');
}

function buildEmailBody(q: QuoteData, pdfUrl?: string): string {
  const lines: string[] = [];
  lines.push(`Cotización – ${q.projectName}`);
  lines.push(`Ambiente: ${q.ambientName}`);
  lines.push('');
  lines.push('RESUMEN TÉCNICO');
  lines.push(`Área pintable: ${q.paintableArea.toFixed(2)} m²`);
  lines.push(`Pintura requerida: ${q.litersRequired.toFixed(2)} L`);
  lines.push(`Número de manos: ${q.coats}`);
  lines.push(`Paleta elegida: ${q.palette.name}`);
  lines.push('');
  lines.push('PRODUCTOS');
  for (const pkg of q.packages) {
    if (pkg.quantity > 0) {
      lines.push(`  ${pkg.quantity} × ${pkg.id}  ${formatCurrency(pkg.price * pkg.quantity, q.currency)}`);
    }
  }
  lines.push(`  Materiales complementarios  ${formatCurrency(q.materialsTotal, q.currency)}`);
  lines.push('');
  lines.push(`TOTAL ESTIMADO: ${formatCurrency(q.grandTotal, q.currency)}`);
  lines.push('');
  lines.push(`Disponible en ${q.branch}`);
  if (q.validUntil) lines.push(`Válido hasta: ${q.validUntil}`);
  if (pdfUrl) lines.push(`\nVer cotización completa: ${pdfUrl}`);
  lines.push('\n---\nTaller de Color – Estudio digital de proyectos');
  return lines.join('\n');
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ─── componente ──────────────────────────────────────────────────────────────

export function QuoteShare({ quote, pdfUrl }: QuoteShareProps) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [activePanel, setActivePanel] = useState<'whatsapp' | 'email' | 'copy' | null>(null);

  const waText = buildWhatsAppText(quote, pdfUrl);
  const emailBody = buildEmailBody(quote, pdfUrl);
  const emailSubject = `Cotización Taller de Color – ${quote.projectName}`;

  // Número limpio (solo dígitos)
  const cleanPhone = phone.replace(/\D/g, '');

  const openWhatsApp = () => {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openEmail = () => {
    const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = url;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(waText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = waText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="qs-root">
      {/* ── resumen visual ── */}
      <div className="qs-summary">
        <div className="qs-summary-header">
          <p className="eyebrow">COTIZACIÓN LISTA</p>
          <h3 className="qs-project">{quote.projectName}</h3>
          <p className="qs-ambient">{quote.ambientName}</p>
        </div>

        {/* paleta elegida */}
        <div className="qs-palette-preview">
          {quote.palette.colors.map((c, i) => (
            <div
              key={i}
              className="qs-palette-band"
              style={{
                background: c,
                flex: i === 0 ? 3 : i === 1 ? 2 : 1,
                color: luminance(c) > 0.45 ? '#171815' : '#fffdf7',
              }}
            >
              <small>{c.toUpperCase()}</small>
            </div>
          ))}
        </div>
        <p className="qs-palette-name">{quote.palette.name}</p>

        {/* números */}
        <div className="qs-numbers">
          <div className="qs-number-row">
            <span>Área pintable</span>
            <b>{quote.paintableArea.toFixed(2)} m²</b>
          </div>
          <div className="qs-number-row">
            <span>Pintura requerida</span>
            <b>{quote.litersRequired.toFixed(2)} L</b>
          </div>
          {quote.packages.filter((p) => p.quantity > 0).map((p) => (
            <div className="qs-number-row" key={p.id}>
              <span>{p.quantity} × {p.id}</span>
              <b>{formatCurrency(p.price * p.quantity, quote.currency)}</b>
            </div>
          ))}
          <div className="qs-number-row">
            <span>Materiales</span>
            <b>{formatCurrency(quote.materialsTotal, quote.currency)}</b>
          </div>
          <div className="qs-number-row total">
            <span>Total estimado</span>
            <strong>{formatCurrency(quote.grandTotal, quote.currency)}</strong>
          </div>
        </div>

        <p className="qs-branch">📍 {quote.branch}</p>
      </div>

      {/* ── botones de compartir ── */}
      <div className="qs-actions">
        <p className="ca-section-label">COMPARTIR COTIZACIÓN</p>

        <div className="qs-action-btns">
          {/* WhatsApp */}
          <button
            className={`qs-share-btn whatsapp${activePanel === 'whatsapp' ? ' open' : ''}`}
            onClick={() => setActivePanel(activePanel === 'whatsapp' ? null : 'whatsapp')}
            aria-expanded={activePanel === 'whatsapp'}
          >
            <span className="qs-share-icon">💬</span>
            <span>WhatsApp</span>
          </button>

          {/* Email */}
          <button
            className={`qs-share-btn email${activePanel === 'email' ? ' open' : ''}`}
            onClick={() => setActivePanel(activePanel === 'email' ? null : 'email')}
            aria-expanded={activePanel === 'email'}
          >
            <span className="qs-share-icon">✉️</span>
            <span>Email</span>
          </button>

          {/* Copiar */}
          <button
            className="qs-share-btn copy"
            onClick={copyToClipboard}
            aria-live="polite"
          >
            <span className="qs-share-icon">{copied ? '✓' : '📋'}</span>
            <span>{copied ? '¡Copiado!' : 'Copiar texto'}</span>
          </button>

          {/* PDF */}
          {pdfUrl && (
            <a
              className="qs-share-btn pdf"
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span className="qs-share-icon">📄</span>
              <span>Ver PDF</span>
            </a>
          )}
        </div>

        {/* ── panel WhatsApp ── */}
        {activePanel === 'whatsapp' && (
          <div className="qs-panel">
            <label className="qs-label">
              Número del cliente (con código de país)
              <div className="qs-input-row">
                <input
                  className="ca-text-input"
                  type="tel"
                  placeholder="+51 987 654 321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-label="Número de WhatsApp"
                />
                <button
                  className="primary-action"
                  onClick={openWhatsApp}
                  disabled={cleanPhone.length < 8}
                >
                  Enviar
                </button>
              </div>
            </label>
            <details className="qs-preview">
              <summary>Vista previa del mensaje</summary>
              <pre className="qs-preview-text">{waText}</pre>
            </details>
          </div>
        )}

        {/* ── panel Email ── */}
        {activePanel === 'email' && (
          <div className="qs-panel">
            <label className="qs-label">
              Email del cliente
              <div className="qs-input-row">
                <input
                  className="ca-text-input"
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email del cliente"
                />
                <button
                  className="primary-action"
                  onClick={openEmail}
                  disabled={!email.includes('@')}
                >
                  Abrir cliente de correo
                </button>
              </div>
            </label>
            <p className="ca-fine-print">
              Se abrirá tu cliente de correo (Gmail, Outlook, etc.) con el mensaje prellenado.
            </p>
            <details className="qs-preview">
              <summary>Vista previa del email</summary>
              <pre className="qs-preview-text">{emailBody}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
