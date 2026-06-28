import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taller de Color | Estudio Digital',
  description: 'Diseña, calcula y cotiza un proyecto de pintura completo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
