/**
 * =============================================================================
 *  src/app/layout.tsx  —  Layout raíz de la aplicación
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Es el envoltorio que Next.js coloca alrededor de TODAS las páginas. Aquí se
 * definen las etiquetas <html> y <body>, las fuentes tipográficas y los
 * metadatos comunes (título de la pestaña, descripción).
 *
 * POR QUÉ ESTÁ ASÍ
 * ----------------
 * - `lang="es"`: la aplicación es en español. No es cosmético: los lectores de
 *   pantalla y el corrector ortográfico del navegador se apoyan en este
 *   atributo.
 * - Las fuentes se cargan con `next/font`. Next.js las descarga en el momento
 *   de compilar y las sirve desde nuestro propio dominio, en lugar de pedirlas
 *   a Google en cada visita. Eso evita una petición externa y el "salto" de
 *   texto al terminar de cargar la fuente.
 * - Este componente es un Server Component (no lleva "use client") y así debe
 *   seguir: no necesita interactividad y así no añade JavaScript al navegador.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { APP } from "@/lib/constants";
import "./globals.css";

// Fuente de texto general. `variable` crea una variable CSS que Tailwind usa.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Fuente monoespaciada: se reserva para códigos de SAP (material, equipo,
// orden), donde alinear caracteres y distinguir 0/O e I/l importa de verdad.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadatos por defecto. Cada página podrá sobrescribirlos exportando su
 * propio `metadata`. Se leen de `@/lib/constants` para no repetir el nombre
 * del producto en varios sitios.
 */
export const metadata: Metadata = {
  title: {
    default: `${APP.nombre} · ${APP.nombreLargo}`,
    template: `%s · ${APP.nombre}`, // p.ej. "Órdenes · GMAO"
  },
  description: APP.descripcion,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
