/**
 * =============================================================================
 *  src/app/page.tsx  —  Página de inicio (provisional, Fase 1)
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Sustituye la página de bienvenida que genera `create-next-app` por una
 * pantalla que sirve para lo único que hace falta ahora mismo: comprobar de un
 * vistazo que Next.js, TypeScript y Tailwind están funcionando, y dejar por
 * escrito en qué punto del plan estamos.
 *
 * POR QUÉ ES UN SERVER COMPONENT
 * ------------------------------
 * No lleva la directiva "use client". En el App Router de Next.js, un
 * componente es de servidor por defecto: se renderiza a HTML en el servidor y
 * NO se envía su JavaScript al navegador. Solo se marca "use client" cuando el
 * componente necesita estado, efectos o escuchar eventos del usuario.
 * Esta página solo pinta texto fijo, así que no necesita nada de eso.
 *
 * LO QUE ESTA PÁGINA *NO* HACE, Y ES INTENCIONADO
 * -----------------------------------------------
 * No consulta la base de datos ni importa nada de `@/backend/lib/supabase`. Cuando
 * llegue el momento de mostrar datos reales, esta página pedirá los datos a un
 * servicio de `/src/backend/services` (LEY nº 1). Además, si importase la
 * configuración de Supabase ahora, la aplicación no arrancaría sin un
 * `.env.local` relleno — y en la Fase 1 todavía no lo hay.
 *
 * Esta pantalla se reemplazará en la Fase 2 por el flujo de login.
 */

import { APP } from "@/frontend/constants";

/**
 * Estado del plan de trabajo. Se define aquí, y no en `constants.ts`, porque
 * es contenido de esta pantalla provisional y desaparecerá con ella.
 */
const FASES = [
  { n: 1, titulo: "Setup e infraestructura", estado: "hecho" },
  { n: 2, titulo: "Autenticación y roles de usuario", estado: "siguiente" },
  { n: 3, titulo: "Base de datos core (esquemas para volcado SAP)", estado: "pendiente" },
  { n: 4, titulo: "Planes preventivos (cronogramas y checks)", estado: "pendiente" },
  { n: 5, titulo: "Asignación y ejecución de tareas", estado: "pendiente" },
  { n: 6, titulo: "Recambios (stock por códigos SAP)", estado: "pendiente" },
  { n: 7, titulo: "Reportes y notificaciones", estado: "pendiente" },
] as const;

/**
 * Traduce el estado de una fase a clases de Tailwind.
 * Se aísla en una función para no ensuciar el JSX con condicionales y para
 * que añadir un estado nuevo sea un cambio en un solo punto.
 */
function estilosEstado(estado: (typeof FASES)[number]["estado"]) {
  switch (estado) {
    case "hecho":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "siguiente":
      return "bg-amber-50 text-amber-800 ring-amber-600/20";
    default:
      return "bg-slate-50 text-slate-500 ring-slate-500/20";
  }
}

export default function PaginaInicio() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      {/* --- Cabecera: identidad del producto --- */}
      <header className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Fase 1 · Infraestructura
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">{APP.nombre}</h1>
        <p className="text-slate-600 dark:text-slate-400">{APP.nombreLargo}</p>
      </header>

      {/* --- Comprobación visual del entorno ---
          Si esta caja se ve con bordes redondeados, fondo tenue y la fuente
          monoespaciada aplicada, entonces Tailwind está compilando bien. Es
          una verificación de la Fase 1, no una funcionalidad. */}
      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="mb-3 font-medium">Entorno</h2>
        <ul className="space-y-1 font-mono text-xs text-slate-600 dark:text-slate-400">
          <li>Next.js · App Router · TypeScript en modo estricto</li>
          <li>Tailwind CSS v4 (si ves estilos, está funcionando)</li>
          <li>Supabase · clientes de navegador y servidor preparados</li>
          <li>Base de datos: sin conectar todavía (Fase 3)</li>
        </ul>
      </section>

      {/* --- Plan de fases --- */}
      <section>
        <h2 className="mb-3 text-sm font-medium">Plan de trabajo</h2>
        <ol className="flex flex-col gap-2">
          {FASES.map((fase) => (
            <li
              key={fase.n}
              className="flex items-center gap-3 rounded-md border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-800"
            >
              <span className="font-mono text-xs text-slate-400">
                {String(fase.n).padStart(2, "0")}
              </span>
              <span className="flex-1">{fase.titulo}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${estilosEstado(fase.estado)}`}
              >
                {fase.estado}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
