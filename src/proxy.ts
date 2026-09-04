/**
 * =============================================================================
 *  src/proxy.ts  —  Guardia de acceso · se ejecuta ANTES de cada página
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Dos cosas, en este orden y en cada petición:
 *   1. Refresca la sesión de Supabase si el token ha caducado.
 *   2. Redirige según quién sea el visitante: a nadie sin sesión se le sirve
 *      una página privada, y a nadie con sesión se le enseña el formulario de
 *      acceso.
 *
 * ⚠ POR QUÉ SE LLAMA `proxy.ts` Y NO `middleware.ts`
 * ---------------------------------------------------
 * En Next.js 16 la convención `middleware.ts` quedó OBSOLETA y se renombró a
 * `proxy.ts`. Está escrito en la documentación que viene dentro del propio
 * proyecto:
 *
 *   node_modules/next/dist/docs/.../file-conventions/middleware.md
 *   «The `middleware.js` file convention has been deprecated in Next.js 16
 *    and renamed to `proxy.js`»
 *
 * Prácticamente todos los tutoriales de Supabase con Next que encontrarás
 * siguen diciendo `middleware`, porque son anteriores al cambio. Si copias uno,
 * te encontrarás con un fichero que Next 16 ni siquiera lee.
 *
 * El fichero va al mismo nivel que `app/`. Como este proyecto usa `src/`, su
 * sitio es `src/proxy.ts`.
 *
 * POR QUÉ LA COMPROBACIÓN DE SESIÓN SE HACE AQUÍ Y NO SOLO EN CADA PÁGINA
 * -----------------------------------------------------------------------
 * Porque esto corre ANTES del renderizado. Una página protegida que se
 * comprueba a sí misma ya ha empezado a ejecutarse, y basta olvidar la
 * comprobación en una sola página nueva para abrir un agujero. Aquí la regla
 * es una y cubre todas las rutas, incluidas las que no existen todavía.
 *
 * IMPORTANTE: esto es la PRIMERA barrera, no la única. La barrera de verdad
 * son las políticas RLS de PostgreSQL. Si alguien se saltara este proxy,
 * seguiría sin poder leer ni una fila que no le corresponda.
 */

import { NextResponse, type NextRequest } from "next/server";

import { actualizarSesion } from "@/backend/lib/supabase/proxy";
import { RUTAS } from "@/frontend/constants";

/**
 * Rutas accesibles sin haber iniciado sesión.
 * Todo lo que no esté aquí exige sesión.
 */
const RUTAS_PUBLICAS = [RUTAS.acceso];

export async function proxy(peticion: NextRequest) {
  // Paso 1: refrescar la sesión. Siempre, incluso en rutas públicas: si el
  // token está a punto de caducar, este es el momento de renovarlo.
  const { respuesta, usuario } = await actualizarSesion(peticion);

  const ruta = peticion.nextUrl.pathname;
  const esPublica = RUTAS_PUBLICAS.some(
    (publica) => ruta === publica || ruta.startsWith(`${publica}/`),
  );

  // Paso 2a: sin sesión en una ruta privada -> al formulario de acceso.
  // Se guarda a dónde quería ir en `?volver=`, para devolverle allí después de
  // entrar en lugar de dejarle siempre en la portada.
  if (!usuario && !esPublica) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = RUTAS.acceso;
    destino.search = "";
    destino.searchParams.set("volver", ruta);
    return redirigirConservandoSesion(destino, respuesta);
  }

  // Paso 2b: con sesión en el formulario de acceso -> a la portada.
  // Evita la pantalla absurda de "inicia sesión" a alguien que ya la tiene.
  if (usuario && esPublica) {
    const destino = peticion.nextUrl.clone();
    destino.pathname = RUTAS.inicio;
    destino.search = "";
    return redirigirConservandoSesion(destino, respuesta);
  }

  return respuesta;
}

/**
 * Redirige SIN perder las cookies de sesión recién renovadas.
 *
 * ESTE DETALLE ES UNA FUENTE CLÁSICA DE FALLOS
 * ---------------------------------------------
 * `NextResponse.redirect()` crea una respuesta NUEVA y vacía. Si Supabase
 * acababa de renovar el token y escribir la cookie en la otra respuesta, esa
 * cookie se pierde por el camino.
 *
 * El resultado es un fallo desconcertante: el usuario entra, es redirigido, y
 * aparece de nuevo en la pantalla de acceso; y al reintentarlo funciona. Un
 * bucle intermitente imposible de diagnosticar si no se conoce la causa.
 *
 * Copiar las cookies a la respuesta de redirección lo evita.
 */
function redirigirConservandoSesion(destino: URL, conCookies: NextResponse) {
  const redireccion = NextResponse.redirect(destino);
  for (const cookie of conCookies.cookies.getAll()) {
    redireccion.cookies.set(cookie);
  }
  return redireccion;
}

/**
 * En qué rutas se ejecuta este fichero.
 *
 * El patrón EXCLUYE (con `(?!...)`) las rutas internas de Next, los ficheros
 * estáticos y las imágenes. Motivo: cada ejecución de este proxy hace una
 * petición de red a Supabase para validar la sesión. Lanzarla también por cada
 * icono, tipografía o fragmento de JavaScript sería multiplicar por diez el
 * tráfico sin ganar absolutamente nada: un archivo estático no tiene sesión
 * que comprobar.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
