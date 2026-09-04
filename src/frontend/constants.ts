/**
 * =============================================================================
 *  src/frontend/constants.ts  —  Constantes de PRESENTACIÓN
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Guarda los valores fijos que afectan a lo que el usuario ve: el nombre del
 * producto y las direcciones (URLs) de las pantallas.
 *
 * POR QUÉ ESTÁ EN `frontend/` Y NO EN `backend/`
 * -----------------------------------------------
 * Nada de lo que hay aquí necesita la base de datos. Son textos y rutas de
 * navegación: si mañana cambiamos de base de datos, este fichero no se toca.
 *
 * Este fichero antes se llamaba `src/lib/constants.ts` y contenía también el
 * mapa de tablas de SAP. Se partió en dos porque mezclaba dos capas distintas:
 * el mapa de SAP describe DE DÓNDE VIENEN LOS DATOS, así que ahora vive en
 * `src/backend/config/sap.ts`.
 *
 * POR QUÉ CENTRALIZAR ESTO
 * ------------------------
 * Un literal repetido ("/ordenes", "GMAO"...) por 20 ficheros es una fuente
 * segura de erratas silenciosas: escribes "/Ordenes" con mayúscula en un sitio
 * y tienes un 404 que nadie detecta hasta que un técnico se queja. Al
 * centralizarlo, la errata la caza TypeScript antes de compilar.
 */

import type { Rol } from "@/backend/types/roles";

/** Identidad del producto. Se usa en el <title>, cabeceras y pie. */
export const APP = {
  nombre: "GMAO",
  nombreLargo: "Gestor de Mantenimiento Asistido por Ordenador",
  descripcion:
    "Gestión de mantenimiento preventivo y correctivo integrada con SAP PM.",
} as const;

/**
 * Direcciones de las pantallas, en un único sitio.
 *
 * Escribir `RUTAS.inicio` en lugar de "/" hace que renombrar una sección sea
 * un cambio de una línea, y que una ruta inexistente sea un error de
 * compilación en vez de un 404 que descubre el usuario.
 *
 * De momento solo existe la raíz; se irá ampliando fase a fase.
 */
export const RUTAS = {
  inicio: "/",
  acceso: "/acceso",
  usuarios: "/usuarios",
} as const;

/**
 * -----------------------------------------------------------------------------
 * PRESENTACIÓN DE LOS ROLES
 * -----------------------------------------------------------------------------
 * Cómo se muestra cada rol en pantalla: su nombre legible, una frase que
 * explica qué puede hacer, y el color con el que se distingue.
 *
 * POR QUÉ ESTÁ EN `frontend/` Y NO JUNTO AL TIPO `Rol`
 * ----------------------------------------------------
 * El tipo `Rol` vive en `backend/types/roles.ts` porque es la forma del dato:
 * lo que la base de datos admite. Esto de aquí son etiquetas y colores, es
 * decir, decisiones visuales. Si mañana el GMAO se tradujera al catalán o se
 * cambiara la paleta, se tocaría este fichero y ninguna consulta SQL.
 *
 * El tipo se importa con `import type`, que la regla de arquitectura permite
 * precisamente porque los tipos se borran al compilar y no crean ninguna
 * dependencia real entre las dos capas.
 *
 * `Record<Rol, ...>` obliga a TypeScript a comprobar que están LOS CUATRO
 * roles. Si en el futuro se añade un quinto rol al tipo y se olvida ponerlo
 * aquí, el proyecto no compila. Es justo lo que queremos: mejor un error de
 * compilación que una etiqueta vacía en pantalla.
 */
export const PRESENTACION_ROLES: Record<
  Rol,
  {
    etiqueta: string;
    descripcion: string;
    tono: "principal" | "info" | "neutro" | "aviso";
  }
> = {
  supervisor: {
    etiqueta: "Supervisor",
    descripcion:
      "Da de alta usuarios, asigna roles y supervisa toda la actividad.",
    tono: "principal",
  },
  tecnico: {
    etiqueta: "Técnico",
    descripcion:
      "Ejecuta y registra las órdenes de trabajo que tiene asignadas.",
    tono: "info",
  },
  operario: {
    etiqueta: "Operario",
    descripcion: "Crea solicitudes de trabajo. No ejecuta ni ve las órdenes.",
    tono: "neutro",
  },
  recambista: {
    etiqueta: "Recambista",
    descripcion: "Gestiona el almacén de recambios y el stock de materiales.",
    tono: "aviso",
  },
};
