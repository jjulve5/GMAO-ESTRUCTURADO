/**
 * =============================================================================
 *  src/lib/supabase/server.ts  —  Cliente Supabase para el SERVIDOR
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Fabrica la instancia de Supabase que se ejecuta en el servidor: Server
 * Components, Route Handlers (`app/api/...`) y Server Actions.
 *
 * REGLA DE ORO: UNA INSTANCIA NUEVA POR CADA PETICIÓN
 * ----------------------------------------------------
 * Nunca se puede guardar este cliente en una variable global ni reutilizarlo
 * entre peticiones. El motivo es de SEGURIDAD, no de rendimiento: el cliente
 * lleva dentro la sesión del usuario que hizo la petición. Si se compartiese
 * entre peticiones, el técnico Juan podría acabar viendo, literalmente, los
 * datos de la sesión de la técnica Ana. Con 30 usuarios concurrentes esto no
 * es una hipótesis remota: es cuestión de días.
 *
 * Por eso esta función se llama en CADA render/petición, y por eso es `async`
 * (necesita esperar a `cookies()`, que en Next.js 16 devuelve una promesa).
 *
 * CÓMO VIAJA LA SESIÓN
 * --------------------
 * Supabase guarda el token de acceso y el de refresco en cookies. El objeto
 * `cookies()` de Next.js da acceso a las cookies de la petición en curso.
 * Le entregamos a Supabase dos funciones:
 *
 *   - `getAll()`  : "toma, estas son las cookies que trae el usuario".
 *   - `setAll(..)`: "guarda estas cookies actualizadas" (ocurre cuando el
 *                   token ha caducado y Supabase lo renueva solo).
 *
 * IMPORTANTE — POR QUÉ EL `try / catch` VACÍO EN `setAll`
 * -------------------------------------------------------
 * No es un `catch` perezoso para tapar errores. Es el patrón oficial y
 * responde a una restricción real de Next.js:
 *
 *   - Desde un Route Handler o una Server Action SÍ se pueden escribir
 *     cookies en la respuesta.
 *   - Desde un Server Component NO se puede: cuando el componente se está
 *     renderizando, las cabeceras HTTP ya se han enviado, así que Next.js
 *     lanza una excepción si intentas escribir una cookie.
 *
 * Como el mismo fichero sirve para ambos casos, absorbemos esa excepción
 * concreta. La renovación del token no se pierde: la hará el `middleware`
 * que crearemos en la Fase 2, que se ejecuta ANTES del renderizado y sí
 * puede escribir cookies. Si no existiese ese middleware, el síntoma sería
 * el clásico "me desloguea solo cada hora".
 *
 * SOBRE EL SEGUNDO PARÁMETRO `cabeceras` DE `setAll`
 * ---------------------------------------------------
 * A partir de @supabase/ssr 0.12, `setAll` recibe un segundo argumento con
 * cabeceras anti-caché (`Cache-Control: private, no-store`, etc.). Sirven
 * para impedir que un CDN o un proxy inverso cachee una respuesta que
 * contiene cookies de sesión y se la sirva a OTRO usuario. Aquí no podemos
 * aplicarlas (un Server Component no controla las cabeceras de respuesta);
 * las aplicaremos en el middleware de la Fase 2, que sí construye el objeto
 * de respuesta.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { configPublica } from "@/lib/env";

/**
 * Crea un cliente Supabase ligado a las cookies de la petición actual.
 *
 * Uso típico (a partir de la Fase 2), siempre dentro de un SERVICIO:
 *
 *   const supabase = await crearClienteServidor();
 *   const { data } = await supabase.from("activos").select("*");
 *
 * @returns Cliente Supabase autenticado con la sesión del usuario actual.
 */
export async function crearClienteServidor() {
  // Cookies de ESTA petición. En Next.js 16 hay que esperarlas.
  const almacenCookies = await cookies();

  return createServerClient(
    configPublica.supabaseUrl,
    configPublica.supabaseAnonKey,
    {
      cookies: {
        // Lectura: entregamos a Supabase las cookies entrantes tal cual.
        getAll() {
          return almacenCookies.getAll();
        },

        // Escritura: solo funcionará en Route Handlers y Server Actions.
        setAll(cookiesAEscribir) {
          try {
            for (const { name, value, options } of cookiesAEscribir) {
              almacenCookies.set(name, value, options);
            }
          } catch {
            // Estamos dentro de un Server Component: no se pueden escribir
            // cookies aquí. Lo resolverá el middleware (Fase 2). Ver la
            // explicación larga en la cabecera de este fichero.
          }
        },
      },
    },
  );
}
