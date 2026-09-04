/**
 * =============================================================================
 *  src/backend/lib/supabase/tipos.ts  —  Tipos de la conexión
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Reexporta el tipo del cliente de Supabase con un nombre nuestro.
 *
 * POR QUÉ EXISTE ESTE FICHERO, QUE PARECE UNA TONTERÍA
 * ----------------------------------------------------
 * La regla de arquitectura del proyecto dice que SOLO esta carpeta puede
 * importar `@supabase/supabase-js`, y ESLint la hace cumplir. Pero los
 * servicios de `/src/backend/services` necesitan declarar el TIPO del cliente
 * que reciben como parámetro, y sin este fichero tendrían que importarlo
 * directamente, lo que haría fallar el lint.
 *
 * Con este puente, la regla se mantiene intacta y los servicios escriben:
 *
 *     import type { ClienteSupabase } from "@/backend/lib/supabase/tipos";
 *
 * Además da un punto único donde, en la Fase 3, se enchufarán los tipos
 * generados desde el esquema real de la base de datos.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase, sirva del navegador o del servidor.
 *
 * En la Fase 3 pasará a ser `SupabaseClient<Database>`, con `Database`
 * generado desde el esquema. A partir de ese momento, `.from("perfilse")`
 * será un error de compilación en vez de un fallo en ejecución.
 */
export type ClienteSupabase = SupabaseClient;
