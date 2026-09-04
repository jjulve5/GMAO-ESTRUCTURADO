/**
 * =============================================================================
 *  Portada  ·  /
 * =============================================================================
 *
 * Sustituye a la pantalla provisional de la Fase 1, que ya estaba declarada
 * como reemplazable en su propio comentario de cabecera.
 *
 * QUÉ HACE: saluda a quien ha entrado, le recuerda qué puede hacer con su rol
 * y deja constancia del estado del proyecto.
 *
 * DE DÓNDE SALEN LOS DATOS: el layout privado ya ha cargado y validado el
 * perfil, pero un layout no puede pasar datos a sus páginas. Se vuelve a pedir
 * aquí; Next.js deduplica automáticamente peticiones idénticas dentro del
 * mismo renderizado, así que no son dos viajes a la base de datos.
 *
 * Sigue siendo un Server Component: no hay nada interactivo.
 */

import { redirect } from "next/navigation";

import { crearClienteServidor } from "@/backend/lib/supabase/server";
import { obtenerPerfilPropio } from "@/backend/services/perfiles.service";
import { EtiquetaRol } from "@/frontend/components/ui/EtiquetaRol";
import { PRESENTACION_ROLES, RUTAS } from "@/frontend/constants";

/** Lo que cada rol podrá hacer, fase a fase. */
const CAPACIDADES: Record<string, { fase: number; texto: string }[]> = {
  supervisor: [
    { fase: 2, texto: "Dar de alta usuarios y asignarles su rol" },
    { fase: 5, texto: "Asignar órdenes de trabajo a los técnicos" },
    { fase: 7, texto: "Ver las comparativas diarias de actividad" },
  ],
  tecnico: [
    { fase: 4, texto: "Consultar los planes preventivos que le tocan" },
    { fase: 5, texto: "Ejecutar y registrar sus órdenes de trabajo" },
    { fase: 6, texto: "Registrar los recambios consumidos" },
  ],
  operario: [{ fase: 5, texto: "Crear solicitudes de trabajo" }],
  recambista: [
    { fase: 6, texto: "Gestionar el stock del almacén" },
    { fase: 6, texto: "Atender las peticiones de material de los técnicos" },
  ],
};

export default async function Portada() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(RUTAS.acceso);

  const perfil = await obtenerPerfilPropio(supabase, user.id);
  if (!perfil) redirect(RUTAS.acceso);

  const capacidades = CAPACIDADES[perfil.rol] ?? [];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Fase 2 · Autenticación y roles
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {perfil.nombre_completo.split(" ")[0]}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>Has entrado como</span>
          <EtiquetaRol rol={perfil.rol} />
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <h2 className="mb-1 text-sm font-medium">Tu rol</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {PRESENTACION_ROLES[perfil.rol].descripcion}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium">Qué podrás hacer aquí</h2>
        <ul className="flex flex-col gap-2">
          {capacidades.map((capacidad) => (
            <li
              key={capacidad.texto}
              className="flex items-center gap-3 rounded-md border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-800"
            >
              <span className="font-mono text-xs text-slate-400">
                F{capacidad.fase}
              </span>
              <span className="flex-1 text-slate-700 dark:text-slate-300">
                {capacidad.texto}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {capacidad.fase === 2 ? "disponible" : "en construcción"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
