/**
 * =============================================================================
 *  src/backend/types/index.ts  —  Punto único de entrada a los tipos del dominio
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Reexporta los tipos del proyecto para poder escribir siempre
 * `import type { ... } from "@/backend/types"` en vez de recordar en qué fichero
 * concreto vive cada tipo.
 *
 * ESTADO EN LA FASE 1
 * -------------------
 * Vacío a propósito. Los tipos del dominio (Activo, PlanPreventivo, Material,
 * OrdenTrabajo...) NO se van a escribir a mano: se GENERARÁN a partir del
 * esquema real de PostgreSQL en la Fase 3 con el comando
 *
 *     npx supabase gen types typescript --linked > src/backend/types/database.types.ts
 *
 * POR QUÉ GENERARLOS EN LUGAR DE ESCRIBIRLOS
 * -------------------------------------------
 * Si los tipos se escriben a mano, el día que alguien añada una columna en SQL
 * y olvide actualizar el fichero .ts, TypeScript seguirá compilando tan feliz
 * y el error aparecerá en ejecución, delante del usuario. Generándolos desde
 * la base de datos, el esquema SQL es la única fuente de verdad y cualquier
 * desajuste sale como error de compilación.
 *
 * Esto es especialmente importante en este proyecto: las tablas de materiales
 * y planes preventivos vendrán de volcados de SAP PM y tendrán decenas de
 * columnas. Mantenerlas a mano sería garantía de desincronización.
 */

export {};
