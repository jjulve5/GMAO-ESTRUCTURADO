/**
 * =============================================================================
 *  src/backend/services/perfiles.service.ts  —  Consultas sobre perfiles
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Reúne todas las consultas a la tabla `perfiles`. Es el único sitio del
 * proyecto donde aparece `supabase.from("perfiles")`.
 *
 * POR QUÉ CADA FUNCIÓN RECIBE EL CLIENTE COMO PARÁMETRO
 * ------------------------------------------------------
 * Ninguna de estas funciones crea su propio cliente. Lo recibe. Así:
 *   - La misma función sirve ejecutada en el servidor o en el navegador.
 *   - Quien llama decide en qué contexto corre, que es quien lo sabe.
 *   - En un test se le puede pasar un cliente falso sin montar nada.
 *
 * QUIÉN APLICA LOS PERMISOS
 * -------------------------
 * **No este fichero.** Los permisos los aplica PostgreSQL con las políticas
 * RLS de la migración de la Fase 2. Si un operario llama a `listarPerfiles`,
 * la consulta se ejecuta sin error y devuelve exactamente una fila: la suya.
 * No hace falta filtrar aquí, y sería un error hacerlo: duplicar la regla en
 * dos sitios garantiza que algún día discrepen.
 */

import type { ClienteSupabase } from "@/backend/lib/supabase/tipos";
import type { Perfil, Rol } from "@/backend/types/roles";

/** Columnas que se piden siempre. Nunca `*`: cada columna de más es tráfico. */
const COLUMNAS = "id, nombre_completo, rol, activo, creado_en";

/**
 * Devuelve el perfil de quien hace la petición.
 *
 * `maybeSingle()` y no `single()`: `single()` lanza un error si no hay
 * exactamente una fila, y aquí "ninguna fila" es una situación normal y
 * esperable (sesión caducada, usuario desactivado). Un `null` se maneja; una
 * excepción rompe el renderizado de la página entera.
 */
export async function obtenerPerfilPropio(
  supabase: ClienteSupabase,
  usuarioId: string,
): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from("perfiles")
    .select(COLUMNAS)
    .eq("id", usuarioId)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer el perfil: ${error.message}`);
  return (data as Perfil | null) ?? null;
}

/**
 * Lista los perfiles visibles para quien llama.
 *
 * Un supervisor recibe todos; cualquier otro rol recibe solo el suyo. Esa
 * diferencia la produce RLS, no este código.
 */
export async function listarPerfiles(
  supabase: ClienteSupabase,
): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from("perfiles")
    .select(COLUMNAS)
    .order("activo", { ascending: false })
    .order("nombre_completo", { ascending: true });

  if (error)
    throw new Error(`No se pudieron listar los perfiles: ${error.message}`);
  return (data ?? []) as Perfil[];
}

/**
 * Cambia el rol de una persona.
 *
 * Si quien llama no es supervisor, la política RLS de actualización rechaza la
 * operación y Supabase devuelve cero filas afectadas, no un error. Por eso se
 * pide `select()` de vuelta y se comprueba: sin esa comprobación, un intento
 * bloqueado por RLS parecería un éxito.
 */
export async function cambiarRol(
  supabase: ClienteSupabase,
  perfilId: string,
  rol: Rol,
): Promise<void> {
  const { data, error } = await supabase
    .from("perfiles")
    .update({ rol })
    .eq("id", perfilId)
    .select("id");

  if (error) throw new Error(`No se pudo cambiar el rol: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error(
      "No se cambió ningún perfil. Puede que no tengas permiso para hacerlo.",
    );
  }
}

/**
 * Da de alta o de baja a una persona.
 *
 * Baja LÓGICA, nunca borrado: la migración no define ninguna política de
 * DELETE precisamente para que no se pueda borrar. Un GMAO tiene que poder
 * responder dentro de dos años a "¿quién ejecutó esta orden?", y si el perfil
 * desapareciera esa respuesta se perdería.
 */
export async function cambiarActivo(
  supabase: ClienteSupabase,
  perfilId: string,
  activo: boolean,
): Promise<void> {
  const { data, error } = await supabase
    .from("perfiles")
    .update({ activo })
    .eq("id", perfilId)
    .select("id");

  if (error) throw new Error(`No se pudo cambiar el estado: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error(
      "No se cambió ningún perfil. Puede que no tengas permiso para hacerlo.",
    );
  }
}
