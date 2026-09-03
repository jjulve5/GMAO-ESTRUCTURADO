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
} as const;
