/**
 * =============================================================================
 *  src/backend/services/auth.service.ts  —  Entrada y salida de la aplicación
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Envuelve las operaciones de autenticación de Supabase.
 *
 * POR QUÉ ESTÁ EN `services/` SI NO CONSULTA NINGUNA TABLA
 * --------------------------------------------------------
 * La regla del proyecto habla de `supabase.from(...)`, y aquí no hay ninguno.
 * Aun así vive en la capa de servicios por coherencia: es acceso a un sistema
 * externo, y quien busque "dónde se comprueban las contraseñas" tiene que
 * encontrarlo en el mismo sitio donde están las demás consultas, no en una
 * pantalla.
 *
 * Estas funciones tampoco redirigen ni saben nada de rutas: devuelven el
 * resultado y ya. Redirigir es decisión de quien llama.
 */

import type { ClienteSupabase } from "@/backend/lib/supabase/tipos";

export interface ResultadoAcceso {
  ok: boolean;
  /** Mensaje ya preparado para enseñar al usuario. Solo si `ok` es false. */
  error?: string;
}

/**
 * Comprueba las credenciales y abre la sesión.
 *
 * POR QUÉ EL MENSAJE DE ERROR ES SIEMPRE EL MISMO
 * ------------------------------------------------
 * Supabase distingue entre "ese correo no existe" y "la contraseña no es
 * correcta". Nosotros NO se lo contamos al usuario, y es a propósito.
 *
 * Si la aplicación respondiera "ese correo no existe", cualquiera podría
 * averiguar qué direcciones tienen cuenta simplemente probando: es lo que se
 * llama enumeración de usuarios. Con un mensaje único, un intento fallido no
 * revela nada.
 *
 * El coste es que un técnico que se equivoque de correo no sabrá si el fallo
 * está ahí o en la contraseña. Es un intercambio aceptado y consciente.
 */
export async function iniciarSesion(
  supabase: ClienteSupabase,
  email: string,
  password: string,
): Promise<ResultadoAcceso> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      ok: false,
      error: "El correo o la contraseña no son correctos. Inténtalo de nuevo.",
    };
  }

  return { ok: true };
}

/**
 * Cierra la sesión.
 *
 * `scope: "local"` cierra únicamente la sesión de este navegador. La
 * alternativa, `"global"`, cerraría también la del móvil o la de la tablet
 * compartida del taller. Para un botón que pone «Salir», cerrar solo aquí es
 * lo que la persona espera.
 */
export async function cerrarSesion(supabase: ClienteSupabase): Promise<void> {
  await supabase.auth.signOut({ scope: "local" });
}
