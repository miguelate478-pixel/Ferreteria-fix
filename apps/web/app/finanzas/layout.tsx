import type { Metadata } from 'next';
import './finanzas.css';

export const metadata: Metadata = {
  title: 'Mis Finanzas | Dashboard Personal',
  description: 'Gastos, ahorro, CTS, gratificación y liquidación. Todo en un lugar.',
};

export default function FinanzasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
