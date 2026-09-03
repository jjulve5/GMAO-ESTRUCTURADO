/**
 * =============================================================================
 *  src/backend/config/sap.ts  —  Correspondencia con SAP PM
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Documenta, en código, de qué transacción y de qué tabla de SAP Plant
 * Maintenance procede cada bloque de datos que va a alimentar nuestro GMAO.
 *
 * POR QUÉ ESTÁ EN `backend/config/` Y NO EN `frontend/`
 * -----------------------------------------------------
 * Esto no se pinta en ninguna pantalla: describe el ORIGEN de los datos. Es
 * información de la capa de datos y solo la usarán los scripts de importación
 * y las migraciones SQL.
 *
 * POR QUÉ EXISTE DESDE LA FASE 1
 * ------------------------------
 * Por la regla nº 3 del proyecto: la base de datos se alimenta de volcados
 * REALES de SAP, no de datos inventados. Dejando escrita la correspondencia
 * desde el principio, cuando en la Fase 3 diseñemos las tablas SQL cada una
 * tendrá un origen explícito y la importación será una traducción directa, no
 * una adivinanza.
 *
 * ⚠ PENDIENTE DE VALIDAR POR TI
 * -----------------------------
 * Estos códigos son la correspondencia ESTÁNDAR de SAP PM. Si vuestro SAP está
 * personalizado (lo habitual en instalaciones con años), pueden variar. No se
 * diseñará el esquema de la Fase 3 sin confirmar esta tabla contra un volcado
 * real. Ver `docs/decisiones.md`.
 */

/**
 * Transacción = la pantalla de SAP desde la que se exporta.
 * Tabla       = la tabla interna de SAP donde vive el dato.
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
