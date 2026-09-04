/**
 * Botón reutilizable.
 *
 * QUÉ HACE: pinta un botón con los tres estilos que usa la aplicación.
 *
 * POR QUÉ EXISTE: para que "un botón principal" se vea igual en las quince
 * pantallas que tendrá el GMAO. Sin esta pieza, cada pantalla acabaría con su
 * propia combinación de clases de Tailwind ligeramente distinta.
 *
 * No sabe nada del mantenimiento ni de la base de datos: recibe todo por
 * props, incluida la acción que ejecuta al pulsarlo.
 */

import type { ComponentProps } from "react";

type Variante = "principal" | "secundario" | "peligro";

const ESTILOS: Record<Variante, string> = {
  principal:
    "bg-slate-900 text-white hover:bg-slate-700 disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300",
  secundario:
    "border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
  peligro:
    "border border-red-300 text-red-700 hover:bg-red-50 disabled:text-red-300 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950",
};

interface Props extends ComponentProps<"button"> {
  variante?: Variante;
}

export function Boton({
  variante = "principal",
  className = "",
  ...resto
}: Props) {
  return (
    <button
      {...resto}
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${ESTILOS[variante]} ${className}`}
    />
  );
}
