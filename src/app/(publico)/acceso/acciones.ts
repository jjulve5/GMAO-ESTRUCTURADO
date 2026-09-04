"use server";

/**
 * =============================================================================
 *  Server Actions del acceso
 * =============================================================================
 *
 * QUÉ ES UNA SERVER ACTION
 * ------------------------
 * Una función que se escribe aquí pero se EJECUTA EN EL SERVIDOR, aunque quien
 * la dispare sea un formulario del navegador. La directiva `"use server"` de
 * arriba es lo que lo convierte en eso.
 *
 * Por qué importa: la contraseña se comprueba en el servidor, y la cookie de
 * sesión la escribe el servidor. Nada de eso pasa por el navegador.
 *
 * POR QUÉ ESTE FICHERO ESTÁ EN `app/` Y NO EN `services/`
 * --------------------------------------------------------
 * Es el pegamento entre la pantalla y la capa de datos: crea el cliente, llama
 * al servicio y decide a dónde redirigir. Un servicio no redirige, porque no
 * sabe nada de rutas ni de pantallas.
 *
 * `app/` es zona mixta y sí puede importar del backend; `src/frontend/` no
 * podría, y ESLint lo impediría.
 */

import { redirect } from "next/navigation";

import { crearClienteServidor } from "@/backend/lib/supabase/server";
import { cerrarSesion, iniciarSesion } from "@/backend/services/auth.service";
import type { EstadoAcceso } from "@/frontend/components/acceso/FormularioAcceso";
import { RUTAS } from "@/frontend/constants";

/**
 * Valida la ruta de retorno que viene en `?volver=`.
 *
 * ⚠ ESTO NO ES PARANOIA: previene una redirección abierta
 * --------------------------------------------------------
 * Ese valor llega de la URL, así que lo controla quien envía el enlace. Si se
 * usara tal cual, alguien podría repartir un enlace como
 *
 *     https://gmao.empresa.com/acceso?volver=https://sitio-falso.com/gmao
 *
 * El técnico vería el dominio correcto de la empresa, escribiría sus
 * credenciales de verdad, y acto seguido acabaría en una copia del GMAO
 * controlada por otro. Es una técnica de phishing habitual, y el enlace
 * inicial es legítimo, lo cual la hace especialmente eficaz.
 *
 * Se admite únicamente una ruta interna: tiene que empezar por "/" y NO por
 * "//", porque "//sitio-falso.com" es una dirección absoluta válida para el
 * navegador aunque a simple vista parezca una ruta local.
 */
function destinoSeguro(volver: string | null): string {
  if (!volver) return RUTAS.inicio;
  if (!volver.startsWith("/")) return RUTAS.inicio;
  if (volver.startsWith("//")) return RUTAS.inicio;
  return volver;
}

/**
 * Comprueba las credenciales y entra.
 *
 * Devuelve el error para que el formulario lo muestre; si todo va bien no
 * devuelve nada, porque `redirect()` interrumpe la ejecución.
 *
 * NOTA SOBRE `redirect()`: funciona lanzando una excepción especial que Next
 * intercepta. Por eso va FUERA de cualquier `try/catch`: dentro de uno, el
 * catch la atraparía y la redirección no ocurriría nunca.
 */
export async function accionIniciarSesion(
  _estadoPrevio: EstadoAcceso,
  datos: FormData,
): Promise<EstadoAcceso> {
  const email = String(datos.get("email") ?? "").trim();
  const password = String(datos.get("password") ?? "");
  const volver = destinoSeguro(datos.get("volver") as string | null);

  if (!email || !password) {
    return { error: "Rellena el correo y la contraseña." };
  }

  const supabase = await crearClienteServidor();
  const resultado = await iniciarSesion(supabase, email, password);

  if (!resultado.ok) {
    return { error: resultado.error };
  }

  redirect(volver);
}

/**
 * Cierra la sesión y devuelve al formulario de acceso.
 * Vive aquí, junto a la de entrar, para que las dos operaciones de sesión
 * estén en el mismo fichero.
 */
export async function accionCerrarSesion(): Promise<void> {
  const supabase = await crearClienteServidor();
  await cerrarSesion(supabase);
  redirect(RUTAS.acceso);
}
