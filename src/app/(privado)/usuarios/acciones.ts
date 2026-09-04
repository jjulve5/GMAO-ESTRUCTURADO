"use server";

/**
 * =============================================================================
 *  Server Actions de la gestión de usuarios
 * =============================================================================
 *
 * ⚠ AQUÍ ES DONDE SE COMPRUEBAN LOS PERMISOS
 * -------------------------------------------
 * Los servicios que se llaman desde aquí NO comprueban nada: el cliente
 * administrador ignora las políticas RLS y hace lo que se le pida. La única
 * barrera entre "un operario envía este formulario" y "se crea un supervisor"
 * es la función `exigirSupervisor()` de abajo.
 *
 * Por eso está escrita como una función que LANZA un error en vez de devolver
 * un booleano: un `if (esSupervisor)` mal escrito, o un `return` que falta,
 * pasa desapercibido en una revisión. Un error lanzado corta la ejecución sin
 * posibilidad de continuar por accidente.
 *
 * DOBLE BARRERA
 * -------------
 * Las acciones de cambiar rol y de dar de baja NO usan el cliente
 * administrador, sino el normal. Aunque alguien lograse saltarse la
 * comprobación de aquí, las políticas RLS de PostgreSQL seguirían rechazando
 * la operación. Solo el alta necesita permisos elevados, porque crear una
 * cuenta de acceso es lo único que no se puede hacer de otra forma.
 */

import { revalidatePath } from "next/cache";

import { crearClienteAdministrador } from "@/backend/lib/supabase/admin";
import { crearClienteServidor } from "@/backend/lib/supabase/server";
import {
  cambiarActivo,
  cambiarRol,
  obtenerPerfilPropio,
} from "@/backend/services/perfiles.service";
import { crearUsuario } from "@/backend/services/usuarios.service";
import { esRolValido } from "@/backend/types/roles";
import type { EstadoAlta } from "@/frontend/components/usuarios/FormularioAltaUsuario";
import { RUTAS } from "@/frontend/constants";

/**
 * Corta la ejecución si quien llama no es un supervisor activo.
 *
 * Devuelve el cliente ya creado para no tener que crearlo dos veces.
 */
async function exigirSupervisor() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No has iniciado sesión.");

  const perfil = await obtenerPerfilPropio(supabase, user.id);
  if (!perfil || !perfil.activo || perfil.rol !== "supervisor") {
    throw new Error("Solo un supervisor puede gestionar usuarios.");
  }

  return { supabase, perfil };
}

/**
 * Crea una cuenta nueva.
 *
 * Devuelve el error en lugar de lanzarlo porque el formulario lo muestra en
 * pantalla; una excepción aquí sacaría al supervisor a una página de error y
 * le haría perder lo que había escrito.
 *
 * `revalidatePath` obliga a Next.js a olvidar la versión cacheada de la
 * pantalla de usuarios. Sin esa línea, el supervisor crea a alguien y la lista
 * sigue mostrando exactamente lo mismo que antes: parece que no ha funcionado.
 */
export async function accionCrearUsuario(
  _estadoPrevio: EstadoAlta,
  datos: FormData,
): Promise<EstadoAlta> {
  try {
    await exigirSupervisor();

    const email = String(datos.get("email") ?? "").trim();
    const nombreCompleto = String(datos.get("nombreCompleto") ?? "").trim();
    const password = String(datos.get("password") ?? "");
    const rol = datos.get("rol");

    if (!email || !nombreCompleto || !password) {
      return { error: "Rellena todos los campos." };
    }
    if (password.length < 8) {
      return { error: "La contraseña debe tener al menos 8 caracteres." };
    }

    // El rol llega del navegador como texto sin garantías. `esRolValido` es la
    // frontera donde se convierte en un `Rol` de verdad: sin esta
    // comprobación, un formulario manipulado podría enviar cualquier cosa.
    if (!esRolValido(rol)) {
      return { error: "El rol seleccionado no es válido." };
    }

    const administrador = crearClienteAdministrador();
    await crearUsuario(administrador, { email, password, nombreCompleto, rol });

    revalidatePath(RUTAS.usuarios);
    return {
      exito: `Cuenta creada para ${nombreCompleto}. Entrégale la contraseña.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "No se pudo crear la cuenta.",
    };
  }
}

/**
 * Cambia el rol de una persona.
 *
 * Usa el cliente NORMAL, no el administrador: así la política RLS
 * "un supervisor modifica cualquier perfil" tiene que autorizarlo también. Dos
 * barreras independientes para la misma operación.
 */
export async function accionCambiarRol(datos: FormData): Promise<void> {
  const { supabase } = await exigirSupervisor();

  const perfilId = String(datos.get("perfilId") ?? "");
  const rol = datos.get("rol");

  if (!perfilId) throw new Error("Falta indicar de qué perfil se trata.");
  if (!esRolValido(rol)) throw new Error("El rol indicado no es válido.");

  await cambiarRol(supabase, perfilId, rol);
  revalidatePath(RUTAS.usuarios);
}

/**
 * Da de alta o de baja a una persona.
 *
 * Es una baja LÓGICA: el perfil se conserva. La migración no define ninguna
 * política de borrado precisamente para que nadie pueda eliminar a quien
 * ejecutó una orden de trabajo el año pasado.
 *
 * La comprobación de "no puedes darte de baja a ti mismo" se repite aquí
 * aunque el botón ya esté deshabilitado en pantalla: un botón deshabilitado es
 * una comodidad visual que cualquiera puede saltarse desde las herramientas
 * del navegador. Si el único supervisor se desactivara, nadie podría
 * reactivarlo y habría que entrar al panel de Supabase a arreglarlo a mano.
 */
export async function accionCambiarActivo(datos: FormData): Promise<void> {
  const { supabase, perfil } = await exigirSupervisor();

  const perfilId = String(datos.get("perfilId") ?? "");
  const activo = datos.get("activo") === "si";

  if (!perfilId) throw new Error("Falta indicar de qué perfil se trata.");
  if (perfilId === perfil.id && !activo) {
    throw new Error("No puedes darte de baja a ti mismo.");
  }

  await cambiarActivo(supabase, perfilId, activo);
  revalidatePath(RUTAS.usuarios);
}
