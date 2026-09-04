/**
 * =============================================================================
 *  src/backend/lib/supabase/proxy.ts  —  Cliente Supabase para el proxy
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Refresca la sesión del usuario en CADA petición, antes de que Next.js
 * renderice nada, y devuelve la respuesta con las cookies ya actualizadas.
 *
 * POR QUÉ ESTO ES IMPRESCINDIBLE Y NO UN ADORNO
 * ----------------------------------------------
 * El token de acceso de Supabase caduca aproximadamente cada hora. Cuando
 * caduca, hay que canjear el token de refresco por uno nuevo y **guardar el
 * nuevo en una cookie**.
 *
 * El problema, ya documentado en `server.ts`: un Server Component NO puede
 * escribir cookies, porque cuando se está renderizando las cabeceras HTTP ya
 * se han enviado. Si la renovación solo se intentase ahí, fallaría siempre en
 * silencio y el síntoma sería el clásico **"la aplicación me echa sola cada
 * hora"**, sin ningún error visible que lo explique.
 *
 * Este fichero se ejecuta ANTES del renderizado, cuando todavía se está
 * construyendo la respuesta, y por tanto sí puede escribir cookies. Es el
 * único sitio donde la renovación funciona de verdad.
 *
 * NOTA SOBRE EL NOMBRE «proxy»
 * ----------------------------
 * En Next.js 16 el fichero `middleware.ts` quedó OBSOLETO y pasó a llamarse
 * `proxy.ts`. Está en la documentación incluida en el propio proyecto:
 * `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md`
 * Casi todos los tutoriales de Supabase que encontrarás siguen diciendo
 * `middleware`: son anteriores a este cambio.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

import { configPublica } from "@/backend/config/env";

/**
 * Refresca la sesión y devuelve quién es el usuario.
 *
 * @param peticion Petición entrante.
 * @returns La respuesta con las cookies actualizadas, y el usuario (o `null`).
 *
 * SOBRE EL BAILE DE `NextResponse` QUE VERÁS ABAJO
 * ------------------------------------------------
 * Cuando Supabase renueva el token hay que escribir la cookie en DOS sitios:
 *
 *   1. En `peticion.cookies`, para que el resto del renderizado de ESTA misma
 *      petición ya vea la sesión nueva y no la caducada.
 *   2. En `respuesta.cookies`, para que el navegador se la guarde y la envíe
 *      en las siguientes peticiones.
 *
 * Si se olvida el paso 1, la página se renderiza con la sesión vieja. Si se
 * olvida el paso 2, la renovación se pierde y vuelve a caducar acto seguido.
 */
export async function actualizarSesion(peticion: NextRequest): Promise<{
  respuesta: NextResponse;
  usuario: User | null;
}> {
  // Respuesta de partida: "sigue tu camino, no cambio nada".
  let respuesta = NextResponse.next({ request: peticion });

  const supabase = createServerClient(
    configPublica.supabaseUrl,
    configPublica.supabaseClavePublica,
    {
      cookies: {
        getAll() {
          return peticion.cookies.getAll();
        },

        setAll(cookiesAEscribir, cabeceras) {
          // Paso 1: que el renderizado de esta petición vea la sesión nueva.
          for (const { name, value } of cookiesAEscribir) {
            peticion.cookies.set(name, value);
          }

          // La respuesta se reconstruye para que arrastre la petición ya
          // modificada; si no, el paso 1 no llegaría al renderizado.
          respuesta = NextResponse.next({ request: peticion });

          // Paso 2: que el navegador guarde la sesión nueva.
          for (const { name, value, options } of cookiesAEscribir) {
            respuesta.cookies.set(name, value, options);
          }

          // Cabeceras anti-caché que envía @supabase/ssr junto con las cookies
          // de sesión. Impiden que un CDN o un proxy inverso guarden en caché
          // una respuesta que lleva dentro la sesión de alguien y se la sirvan
          // luego a otra persona distinta. Aquí SÍ se pueden aplicar, porque a
          // diferencia de un Server Component estamos construyendo la
          // respuesta.
          for (const [clave, valor] of Object.entries(cabeceras)) {
            respuesta.headers.set(clave, valor);
          }
        },
      },
    },
  );

  /**
   * `getUser()` y no `getSession()`, y la diferencia importa para la seguridad:
   *
   *   - `getSession()` se limita a leer y decodificar la cookie. La cookie la
   *     envía el navegador, así que su contenido es, por definición, algo que
   *     el usuario controla y podría falsificar.
   *   - `getUser()` pregunta al servidor de autenticación de Supabase si ese
   *     token es auténtico y sigue vigente.
   *
   * Cuesta una petición de red por cada visita, y aquí ese coste está bien
   * pagado: es la comprobación de la que dependen todas las redirecciones de
   * acceso. Con 30 usuarios es un coste irrelevante.
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { respuesta, usuario: user };
}
