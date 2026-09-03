/**
 * =============================================================================
 *  src/lib/constants.ts  —  Constantes transversales de la aplicación
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Guarda los valores fijos que se repiten por toda la aplicación: nombre del
 * producto, rutas, y los identificadores de sistemas externos.
 *
 * POR QUÉ
 * -------
 * Un literal repetido ("Técnico", "/ordenes", ...) por 20 ficheros es una
 * fuente segura de erratas silenciosas: escribes "Tecnico" sin tilde en un
 * sitio y la comparación falla sin dar ningún error de compilación. Al
 * centralizarlo, TypeScript detecta la errata en tiempo de compilación.
 *
 * ALCANCE EN LA FASE 1
 * --------------------
 * Aquí solo van constantes de PRESENTACIÓN y de INTEGRACIÓN. Los roles de
 * usuario NO se definen todavía: son materia de la Fase 2 y su fuente de
 * verdad será un tipo ENUM de PostgreSQL, no una lista escrita a mano en
 * TypeScript.
 */

/** Identidad del producto. Se usa en el <title>, cabeceras y pie. */
export const APP = {
  nombre: "GMAO",
  nombreLargo: "Gestor de Mantenimiento Asistido por Ordenador",
  descripcion:
    "Gestión de mantenimiento preventivo y correctivo integrada con SAP PM.",
} as const;

/**
 * -----------------------------------------------------------------------------
 * NOMENCLATURA DE SAP PM
 * -----------------------------------------------------------------------------
 * Estos nombres NO son decorativos: son los códigos de transacción y las
 * tablas reales de SAP Plant Maintenance de donde saldrán los volcados que
 * alimentarán la base de datos (LEY nº 3: nada de datos inventados).
 *
 * Se documentan aquí desde la Fase 1 para que, cuando en la Fase 3 diseñemos
 * el esquema SQL, cada tabla nuestra tenga una correspondencia explícita con
 * su origen en SAP y la importación sea una traducción directa, no una
 * adivinanza.
 *
 * Estos valores se CONFIRMARÁN contigo antes de la Fase 3, cuando veamos los
 * volcados reales: pueden variar según la personalización de vuestro SAP.
 */
export const ORIGEN_SAP = {
  /** Maestro de materiales / repuestos. Transacción MM03. Tabla MARA. */
  materiales: { transaccion: "MM03", tabla: "MARA" },
  /** Stock por almacén. Transacción MMBE. Tabla MARD. */
  stock: { transaccion: "MMBE", tabla: "MARD" },
  /** Maestro de equipos / activos. Transacción IE03. Tabla EQUI. */
  equipos: { transaccion: "IE03", tabla: "EQUI" },
  /** Ubicaciones técnicas (jerarquía de planta). Transacción IL03. Tabla IFLOT. */
  ubicaciones: { transaccion: "IL03", tabla: "IFLOT" },
  /** Planes de mantenimiento preventivo. Transacción IP03. Tabla MPLA. */
  planes: { transaccion: "IP03", tabla: "MPLA" },
  /** Hojas de ruta / listas de tareas (los "checks"). Transacción IA03. Tabla PLKO. */
  listasTareas: { transaccion: "IA03", tabla: "PLKO" },
  /** Órdenes de mantenimiento. Transacción IW33. Tabla AUFK. */
  ordenes: { transaccion: "IW33", tabla: "AUFK" },
} as const;

/**
 * Rutas de la aplicación en un único sitio.
 * Escribir `RUTAS.inicio` en lugar de "/" hace que renombrar una sección sea
 * un cambio de una línea, y que una ruta inexistente sea un error de
 * compilación en vez de un 404 descubierto por el usuario.
 *
 * De momento solo existe la raíz; se irá ampliando fase a fase.
 */
export const RUTAS = {
  inicio: "/",
} as const;
