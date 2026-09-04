/**
 * Distintivo con el nombre de un rol.
 *
 * QUÉ HACE: convierte el valor técnico que guarda la base de datos
 * (`recambista`) en algo presentable (`Recambista`), con su color.
 *
 * POR QUÉ EXISTE: para que ese valor crudo no se escape nunca a la pantalla.
 * Sin esta pieza, en algún listado acabaría apareciendo "tecnico" en
 * minúscula y sin tilde, que es exactamente el detalle que hace que una
 * herramienta interna parezca a medio hacer.
 *
 * El tipo `Rol` se importa con `import type`: la regla de arquitectura permite
 * tipos del backend en el frontend, porque desaparecen al compilar.
 */

import type { Rol } from "@/backend/types/roles";
import { PRESENTACION_ROLES } from "@/frontend/constants";

const TONOS = {
  principal: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900",
  info: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
  neutro: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  aviso: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
} as const;

export function EtiquetaRol({ rol }: { rol: Rol }) {
  const { etiqueta, tono } = PRESENTACION_ROLES[rol];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}
    >
      {etiqueta}
    </span>
  );
}
