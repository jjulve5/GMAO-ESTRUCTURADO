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
 *   - La URL del proyecto y la clave `anon` de Supabase están diseñadas para
 *     ser públicas: por sí solas no dan acceso a nada, porque el acceso real
 *     lo controlan las políticas RLS (Row Level Security) de la base de datos.
 *   - La `service_role` key es lo contrario: salta TODAS las políticas RLS.
 *     Jamás debe llevar el prefijo `NEXT_PUBLIC_` ni usarse en el navegador.
 *
 * NOTA TÉCNICA SOBRE LA SUSTITUCIÓN EN COMPILACIÓN
 * ------------------------------------------------
 * Como Next.js sustituye literalmente el texto `process.env.NEXT_PUBLIC_XXX`,
 * NO podemos escribir algo dinámico como `process.env[nombreVariable]` para
 * las variables públicas: el bundler no sabría qué reemplazar y llegaría
 * `undefined` al navegador. Por eso abajo verás las variables públicas
 * escritas de forma literal y explícita. No es redundancia: es un requisito
 * del empaquetador.
 */

/**
 * Lanza un error homogéneo cuando una variable obligatoria no está definida.
 * Se extrae a función aparte para que el mensaje sea idéntico en todos los
 * casos y el desarrollador sepa siempre dónde mirar (.env.local).
 */
function faltaVariable(nombre: string): never {
  throw new Error(
    `[config] Falta la variable de entorno obligatoria "${nombre}". ` +
      `Copia el fichero .env.example a .env.local y rellena sus valores. ` +
      `Recuerda reiniciar el servidor de desarrollo después de editarlo.`,
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

  /** Clave anónima (`anon`) del proyecto Supabase. Sujeta a RLS. */
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    faltaVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
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
 *     bundle del navegador.
 *   - Siendo una función, el valor solo se lee cuando alguien la llama de
 *     forma explícita, y ese alguien solo puede ser código de servidor.
 *
 * En la Fase 1 todavía NO se usa. La declaramos ahora porque la necesitaremos
 * en la Fase 3 para los scripts de importación masiva de los volcados de
 * SAP PM: esas cargas deben saltarse RLS para poder escribir el maestro de
 * materiales completo de una sola pasada.
 */
export function obtenerConfigPrivada() {
  return {
    /**
     * Clave `service_role`. IGNORA todas las políticas RLS.
     * Uso previsto: scripts de importación SAP y tareas administrativas
     * ejecutadas desde el servidor. Nunca en un componente.
     */
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      faltaVariable("SUPABASE_SERVICE_ROLE_KEY"),
  } as const;
}
