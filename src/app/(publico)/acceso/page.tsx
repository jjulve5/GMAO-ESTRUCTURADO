/**
 * =============================================================================
 *  Pantalla de acceso  ·  /acceso
 * =============================================================================
 *
 * Es la única pantalla que se puede ver sin haber iniciado sesión. El grupo de
 * rutas `(publico)` es lo que la agrupa: los paréntesis hacen que el nombre de
 * la carpeta NO aparezca en la dirección web. La ruta es `/acceso`, no
 * `/publico/acceso`.
 *
 * Es un Server Component: no lleva `"use client"`. Solo el formulario que hay
 * dentro es de cliente, porque es lo único que necesita estado.
 *
 * ESTA PÁGINA NO COMPRUEBA SI YA HAY SESIÓN, y no es un olvido: de eso se
 * ocupa `src/proxy.ts`, que se ejecuta antes y redirige a la portada a quien
 * ya haya entrado. Repetir aquí la comprobación sería duplicar una regla en
 * dos sitios que algún día discreparían.
 */

import type { Metadata } from "next";

import { FormularioAcceso } from "@/frontend/components/acceso/FormularioAcceso";
import { APP } from "@/frontend/constants";

import { accionIniciarSesion } from "./acciones";

export const metadata: Metadata = { title: "Acceso" };

export default async function PaginaAcceso({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string }>;
}) {
  // En Next.js 16 los parámetros de la URL llegan como promesa: hay que
  // esperarlos, igual que ocurre con `cookies()`.
  const { volver } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {APP.nombre}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {APP.nombreLargo}
          </p>
        </div>

        <FormularioAcceso accion={accionIniciarSesion} volver={volver} />

        <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          Las cuentas las crea un supervisor. Si no tienes acceso, pídeselo.
        </p>
      </div>
    </main>
  );
}
