'use client';

import { QuoteShare } from './QuoteShare';

// Demo con datos del Studio de demostración
const DEMO_QUOTE = {
  projectName: 'Dormitorio principal',
  ambientName: 'Dormitorio 01 – 5 × 4 × 2.5 m',
  paintableArea: 41.31,
  litersRequired: 10.69,
  coats: 2,
  palette: {
    name: 'Natural y luminosa',
    colors: ['#DDD6C8', '#B8AA91', '#68705A'],
  },
  packages: [
    { id: '4L', quantity: 3, price: 104.9 },
    { id: '1L', quantity: 0, price: 31.9 },
    { id: '15L', quantity: 0, price: 329.9 },
  ],
  materialsTotal: 186.7,
  grandTotal: 501.4,
  currency: 'S/',
  branch: 'Sucursal Miraflores',
  validUntil: '31/07/2026',
};

export function QuoteShareDemo() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  return (
    <QuoteShare
      quote={DEMO_QUOTE}
      pdfUrl={`${apiUrl}/api/quotes/demo/pdf`}
    />
  );
}
