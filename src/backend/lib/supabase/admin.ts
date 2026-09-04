/**
 * =============================================================================
 *  src/backend/lib/supabase/admin.ts  —  Cliente con permisos de administrador
 * =============================================================================
 *
 * ⚠  ESTE FICHERO CONTIENE LA LLAVE MAESTRA DE LA BASE DE DATOS  ⚠
 *
 * QUÉ HACE
 * --------
 * Crea un cliente de Supabase autenticado con la CLAVE SECRETA, que **ignora
 * todas las políticas RLS** y puede leer y escribir cualquier fila de
 * cualquier tabla.
 *
 * POR QUÉ HACE FALTA EN LA FASE 2
 * -------------------------------
 * Se decidió que **solo los supervisores dan de alta usuarios** y que no hay
 * registro público. Crear la cuenta de OTRA persona no es algo que un usuario
 * normal pueda hacer: es una operación de administración, y la API de
 * administración de Supabase (`auth.admin.*`) exige la clave secreta.
 *
 * Esto adelanta a la Fase 2 una necesidad que en la Fase 1 dimos por
 * aplazada hasta la Fase 3. Hay que rellenar `SUPABASE_SECRET_KEY` (o
 * `SUPABASE_SERVICE_ROLE_KEY`) en `.env.local`.
 *
 * LAS TRES BARRERAS QUE IMPIDEN QUE ESTA CLAVE LLEGUE AL NAVEGADOR
 * ----------------------------------------------------------------
 *  1. `import "server-only"`, la primera línea de abajo. Si algún día un
 *     componente de cliente importa este fichero, **la compilación falla**.
 *     No es un aviso: el proyecto no compila. Es la barrera más fuerte.
 *  2. La clave se lee dentro de una función (`obtenerConfigPrivada()`), nunca
 *     al importar el módulo, de modo que un import accidental no arrastra su
 *     valor al paquete del navegador.
 *  3. La variable no lleva el prefijo `NEXT_PUBLIC_`, así que Next.js no la
 *     sustituye en el código que se descarga el navegador.
 *
 * CÓMO USARLO
 * -----------
 * Solo desde una Server Action o un Route Handler, y **siempre después de
 * comprobar que quien lo pide es supervisor**. Este cliente no comprueba
 * permisos: hace lo que se le mande. La comprobación es responsabilidad de
 * quien lo llama.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";

import { configPublica, obtenerConfigPrivada } from "@/backend/config/env";

/**
 * Crea un cliente con permisos de administrador.
 *
 * Se crea uno nuevo en cada llamada y NO se guarda en ninguna variable global:
 * un cliente administrador compartido y vivo entre peticiones es exactamente
 * el tipo de objeto que no conviene tener rondando por el proceso.
 *
 * `autoRefreshToken` y `persistSession` van a `false` porque este cliente no
 * representa a ninguna persona: no tiene sesión que refrescar ni que guardar.
 * Dejarlos activados haría que arrancase un temporizador de refresco inútil en
 * cada llamada.
 */
export function crearClienteAdministrador() {
  const { supabaseClaveSecreta } = obtenerConfigPrivada();

  return createClient(configPublica.supabaseUrl, supabaseClaveSecreta, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
