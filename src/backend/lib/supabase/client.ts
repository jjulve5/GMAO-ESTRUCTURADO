/**
 * =============================================================================
 *  src/backend/lib/supabase/client.ts  —  Cliente Supabase para el NAVEGADOR
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Fabrica la instancia de Supabase que se ejecuta dentro del navegador del
 * usuario, es decir, la que usarán los Client Components (los que llevan la
 * directiva `"use client"` arriba del todo).
 *
 * POR QUÉ HAY DOS CLIENTES (este y `server.ts`) Y NO UNO SOLO
 * -----------------------------------------------------------
 * Next.js con App Router ejecuta código en DOS entornos distintos:
 *
 *   1. NAVEGADOR: existe `document.cookie`, existe estado entre pulsaciones,
 *      y la sesión se puede refrescar sola en segundo plano.
 *   2. SERVIDOR: no hay `document`. Las cookies llegan dentro del objeto de
 *      la petición HTTP y hay que leerlas/escribirlas explícitamente. Además
 *      cada petición es independiente: no se puede reutilizar una instancia.
 *
 * La sesión de Supabase (los tokens de autenticación) se guarda en COOKIES
 * precisamente para que ambos entornos puedan leerla. Cada entorno necesita
 * su propia forma de acceder a esas cookies, y por eso hay dos ficheros.
 *
 * SOBRE `isSingleton` (comportamiento por defecto de la librería)
 * --------------------------------------------------------------
 * `createBrowserClient` reutiliza internamente una única instancia por
 * defecto. Por eso NO pasa nada por llamar a esta función desde varios
 * componentes distintos: no se abren múltiples conexiones ni se duplican los
 * escuchadores de refresco de token.
 */

import { createBrowserClient } from "@supabase/ssr";

import { configPublica } from "@/backend/config/env";

/**
 * Devuelve el cliente de Supabase válido en el navegador.
 *
 * Se expone como FUNCIÓN y no como constante exportada porque una constante
 * se evaluaría al importar el módulo, incluso durante el renderizado en
 * servidor del componente. Con una función, la creación ocurre solo cuando el
 * componente ya está vivo en el navegador.
 *
 * Uso típico (a partir de la Fase 2):
 *
 *   "use client";
 *   const supabase = crearClienteNavegador();
 *   await supabase.auth.signInWithPassword({ email, password });
 *
 * NOTA DE ARQUITECTURA (LEY nº 1):
 * Este fichero es INFRAESTRUCTURA, no lógica de negocio. Aquí nunca habrá
 * un `.from("tabla").select()`. Todas las consultas a tablas vivirán en
 * `/src/backend/services`. Los componentes llaman a los servicios; los servicios
 * llaman a este cliente.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    configPublica.supabaseUrl,
    configPublica.supabaseClavePublica,
  );
}
