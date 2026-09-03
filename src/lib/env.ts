/**
 * =============================================================================
 *  src/lib/env.ts  —  Lectura y validación de variables de entorno
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Centraliza la lectura de las variables de entorno del proyecto y las valida
 * en el momento en que se usan. Si falta una variable, el programa falla de
 * forma inmediata y con un mensaje claro.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * ---------------------------
 * 1. Un `process.env.LO_QUE_SEA` desperdigado por 40 ficheros es imposible de
 *    auditar. Aquí hay UN solo sitio donde mirar qué configuración necesita
 *    la aplicación para arrancar.
 * 2. En TypeScript, `process.env.X` tiene tipo `string | undefined`. Si lo
 *    usamos directamente, el compilador nos obliga a poner `!` (que silencia
 *    el error pero no evita el fallo en ejecución). Estas funciones devuelven
 *    `string` garantizado, o revientan con un mensaje entendible.
 * 3. Un fallo temprano y explícito en el arranque es MUCHO más barato de
 *    diagnosticar que un "Invalid API key" a las tres semanas en producción.
 *
 * NOTA IMPORTANTE SOBRE EL PREFIJO `NEXT_PUBLIC_`
 * -----------------------------------------------
 * Next.js sustituye en tiempo de compilación cualquier variable que empiece
 * por `NEXT_PUBLIC_` y la incrusta en el JavaScript que se descarga el
 * navegador. Es decir: TODO lo que lleve ese prefijo es PÚBLICO.
 *   - La URL del proyecto y la clave pública de Supabase están diseñadas para
 *     ser públicas: por sí solas no dan acceso a nada, porque el acceso real
 *     lo controlan las políticas RLS (Row Level Security) de la base de datos.
 *   - La clave secreta es lo contrario: salta TODAS las políticas RLS.
 *     Jamás debe llevar el prefijo `NEXT_PUBLIC_` ni usarse en el navegador.
 *
 * NOTA TÉCNICA SOBRE LA SUSTITUCIÓN EN COMPILACIÓN
 * ------------------------------------------------
 * Como Next.js sustituye literalmente el TEXTO `process.env.NEXT_PUBLIC_XXX`,
 * NO se puede escribir algo dinámico como `process.env[nombreVariable]` para
 * las variables públicas: el empaquetador no sabría qué texto reemplazar y al
 * navegador llegaría `undefined`. Por eso más abajo cada nombre aparece
 * escrito de forma literal y explícita, incluidos los dos nombres alternativos
 * de la clave pública. No es redundancia: es un requisito del empaquetador.
 *
 * =============================================================================
 *  LOS DOS JUEGOS DE NOMBRES DE CLAVE  (decisión aprobada, ver docs/decisiones.md)
 * =============================================================================
 * Supabase está sustituyendo su sistema de claves de API:
 *
 *      NOMBRE NUEVO                  NOMBRE HEREDADO      QUÉ ES
 *      ----------------------------  -------------------  --------------------
 *      sb_publishable_...            anon                 clave pública, sujeta a RLS
 *      sb_secret_...                 service_role         clave secreta, IGNORA RLS
 *
 * Las heredadas siguen funcionando, pero Supabase las va a retirar. Este
 * fichero acepta LOS DOS nombres de variable y da prioridad al nuevo, de modo
 * que el día de la migración basta con cambiar el `.env.local`: ni una línea
 * de código de la aplicación se toca.
 *
 * Dato comprobado: los paquetes `@supabase/supabase-js` y `@supabase/ssr` NO
 * contienen ninguna referencia a `sb_publishable_` ni a `sb_secret_`. Para el
 * SDK la clave es simplemente una cadena de texto que reenvía. Por eso este
 * cambio es solo de nomenclatura y no puede romper nada.
 */

/**
 * Lanza un error homogéneo cuando una variable obligatoria no está definida.
 * Se extrae a función aparte para que el mensaje sea idéntico en todos los
 * casos y el desarrollador sepa siempre dónde mirar (.env.local).
 */
function faltaVariable(nombres: string): never {
  throw new Error(
    `[config] Falta la variable de entorno obligatoria: ${nombres}. ` +
      `Copia el fichero .env.example a .env.local y rellena sus valores. ` +
      `Recuerda reiniciar el servidor de desarrollo después de editarlo.`,
  );
}

/**
 * Avisa por consola de que se está usando un nombre de variable heredado.
 *
 * POR QUÉ ESTÁ CONDICIONADO
 * -------------------------
 * - `typeof window === "undefined"` limita el aviso al servidor. Si no, el
 *   mensaje aparecería en la consola del navegador de cada usuario del GMAO,
 *   que no puede hacer nada al respecto y solo se llevaría un susto.
 * - `NODE_ENV !== "production"` lo limita al desarrollo: es un recordatorio
 *   para nosotros mientras trabajamos, no ruido en los registros de producción.
 */
function avisarNombreHeredado(heredado: string, nuevo: string): void {
  if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
    console.warn(
      `[config] Estás usando "${heredado}", que Supabase tiene previsto retirar. ` +
        `Cuando puedas, renómbrala a "${nuevo}" en tu .env.local. ` +
        `No hay que tocar código: la aplicación acepta los dos nombres.`,
    );
  }
}

/**
 * ---------------------------------------------------------------------------
 * Resolución de la CLAVE PÚBLICA
 * ---------------------------------------------------------------------------
 * Orden de preferencia: nombre nuevo primero, heredado como respaldo.
 * Ambas lecturas van escritas de forma literal por la razón explicada arriba
 * (sustitución en tiempo de compilación).
 */
const clavePublicaNueva = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const clavePublicaHeredada = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function resolverClavePublica(): string {
  if (clavePublicaNueva) return clavePublicaNueva;

  if (clavePublicaHeredada) {
    avisarNombreHeredado(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
    return clavePublicaHeredada;
  }

  return faltaVariable(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o, si aún usas el nombre antiguo, NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  );
}

/**
 * ---------------------------------------------------------------------------
 * CONFIGURACIÓN PÚBLICA (navegador + servidor)
 * ---------------------------------------------------------------------------
 * Estos dos valores viajan al navegador. Son seguros de exponer siempre que
 * las tablas tengan RLS activado (lo haremos en la Fase 3).
 */
export const configPublica = {
  /** URL del proyecto Supabase, p.ej. https://xxxxxxxx.supabase.co */
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    faltaVariable("NEXT_PUBLIC_SUPABASE_URL"),

  /** Clave pública (`sb_publishable_...`, antes `anon`). Sujeta a RLS. */
  supabaseClavePublica: resolverClavePublica(),
} as const;

/**
 * ---------------------------------------------------------------------------
 * CONFIGURACIÓN PRIVADA (SOLO servidor)
 * ---------------------------------------------------------------------------
 * Se expone como FUNCIÓN, no como constante, y esto es deliberado:
 *
 *   - Si fuese una constante `export const configPrivada = { ... }`, se
 *     evaluaría en el momento de importar el módulo. Bastaría con que un
 *     componente de cliente importase por error CUALQUIER cosa de este
 *     fichero para arrastrar la evaluación de la clave secreta hacia el
 *     paquete de JavaScript del navegador.
 *   - Siendo una función, el valor solo se lee cuando alguien la llama de
 *     forma explícita, y ese alguien solo puede ser código de servidor.
 *
 * En la Fase 1 todavía NO se usa, y por eso no hace falta rellenarla en el
 * `.env.local` para que la aplicación arranque. La declaramos ahora porque la
 * necesitaremos en la Fase 3, en los scripts de importación de los volcados de
 * SAP PM: esas cargas deben saltarse RLS para poder escribir el maestro de
 * materiales completo de una sola pasada.
 */
export function obtenerConfigPrivada() {
  // A diferencia de las públicas, estas variables NO se sustituyen en
  // compilación (no llevan el prefijo NEXT_PUBLIC_), así que aquí sí se
  // pueden leer con normalidad y solo se evalúan al llamar a la función.
  const claveSecretaNueva = process.env.SUPABASE_SECRET_KEY;
  const claveSecretaHeredada = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let claveSecreta: string;

  if (claveSecretaNueva) {
    claveSecreta = claveSecretaNueva;
  } else if (claveSecretaHeredada) {
    avisarNombreHeredado("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
    claveSecreta = claveSecretaHeredada;
  } else {
    faltaVariable(
      "SUPABASE_SECRET_KEY (o, si aún usas el nombre antiguo, SUPABASE_SERVICE_ROLE_KEY)",
    );
  }

  return {
    /**
     * Clave secreta. IGNORA todas las políticas RLS.
     * Uso previsto: scripts de importación SAP y tareas administrativas
     * ejecutadas desde el servidor. Nunca en un componente.
     */
    supabaseClaveSecreta: claveSecreta,
  } as const;
}
