/**
 * =============================================================================
 *  src/backend/services/usuarios.service.ts  —  Altas de usuario (admin)
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Crea cuentas de acceso. Es lo único del proyecto que necesita la API de
 * administración de Supabase, y por tanto la clave secreta.
 *
 * ⚠ QUIÉN COMPRUEBA LOS PERMISOS
 * ------------------------------
 * **Aquí no se comprueba nada.** El cliente administrador ignora RLS: hace lo
 * que se le pida. La comprobación de que quien lo pide es supervisor tiene que
 * haberla hecho ya la Server Action que llama a estas funciones.
 *
 * Está escrito así a propósito, y no por descuido: un servicio que además
 * comprobase permisos daría una falsa sensación de seguridad al siguiente que
 * lo lea. Al no comprobar nada y decirlo bien claro, obliga a quien lo use a
 * plantearse la pregunta.
 */

import "server-only";

import type { ClienteSupabase } from "@/backend/lib/supabase/tipos";
import type { Rol } from "@/backend/types/roles";

export interface DatosNuevoUsuario {
  email: string;
  password: string;
  nombreCompleto: string;
  rol: Rol;
}

/**
 * Crea una cuenta y le asigna su rol.
 *
 * EL PROCESO TIENE DOS PASOS, Y CONVIENE ENTENDER POR QUÉ
 * -------------------------------------------------------
 *  1. `auth.admin.createUser` crea el usuario. Al hacerlo, el disparador
 *     `al_crear_usuario` de la base de datos crea automáticamente su perfil
 *     **siempre con el rol 'operario'**, el de menos permisos.
 *  2. Este servicio actualiza después el rol al que corresponde.
 *
 * ¿Por qué no crear el usuario ya con su rol en un solo paso? Porque el rol
 * viajaría en los metadatos del usuario, que son datos que el propio usuario
 * puede enviar. Si el disparador se fiase de ellos, cualquiera que alcanzase
 * el registro podría pedir el rol 'supervisor'. Naciendo todos como
 * 'operario' y asignando el rol después —desde un sitio donde sí se ha
 * comprobado quién lo pide— esa vía de escalada de privilegios no existe.
 *
 * `email_confirm: true` evita el correo de confirmación: en una herramienta
 * interna, la cuenta la crea el supervisor y no hay nada que confirmar. Si se
 * dejase en false, el técnico no podría entrar hasta pulsar un enlace en un
 * correo al que quizá no tenga acceso desde la planta.
 *
 * SI ALGO FALLA A MITAD
 * ---------------------
 * Si el usuario se crea pero la asignación de rol falla, queda una cuenta
 * válida con rol 'operario'. Se avisa con un mensaje explícito para que el
 * supervisor pueda corregir el rol desde la lista, en lugar de dejar una
 * cuenta a medias sin que nadie se entere.
 */
export async function crearUsuario(
  administrador: ClienteSupabase,
  datos: DatosNuevoUsuario,
): Promise<{ id: string }> {
  // --- Paso 1: la cuenta de acceso ---
  const { data, error } = await administrador.auth.admin.createUser({
    email: datos.email,
    password: datos.password,
    email_confirm: true,
    user_metadata: { nombre_completo: datos.nombreCompleto },
  });

  if (error) throw new Error(`No se pudo crear la cuenta: ${error.message}`);
  if (!data.user)
    throw new Error("Supabase creó la cuenta pero no devolvió el usuario.");

  // --- Paso 2: el rol real ---
  const { error: errorRol } = await administrador
    .from("perfiles")
    .update({ rol: datos.rol, nombre_completo: datos.nombreCompleto })
    .eq("id", data.user.id);

  if (errorRol) {
    throw new Error(
      `La cuenta de ${datos.email} se creó correctamente, pero no se le pudo asignar ` +
        `el rol "${datos.rol}" y ha quedado como "operario". ` +
        `Corrígelo desde la lista de usuarios. Detalle: ${errorRol.message}`,
    );
  }

  return { id: data.user.id };
}

/**
 * Lista los correos de las cuentas.
 *
 * El correo vive en `auth.users`, no en `perfiles`, y `auth` no es accesible
 * desde el cliente normal. Por eso hace falta el cliente administrador solo
 * para esto.
 *
 * `perPage: 200` cubre de sobra los 30 usuarios previstos. Si algún día el
 * GMAO creciera, habría que paginar.
 */
export async function obtenerCorreosPorId(
  administrador: ClienteSupabase,
): Promise<Map<string, string>> {
  const { data, error } = await administrador.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error)
    throw new Error(`No se pudieron leer los correos: ${error.message}`);

  return new Map(
    data.users
      .filter((u): u is typeof u & { email: string } => Boolean(u.email))
      .map((u) => [u.id, u.email]),
  );
}
