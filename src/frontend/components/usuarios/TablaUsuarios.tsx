/**
 * Listado de usuarios del GMAO.
 *
 * QUÉ HACE: pinta la tabla de personas dadas de alta, con su rol y su estado,
 * y permite al supervisor cambiar el rol o dar de baja.
 *
 * POR QUÉ NO ES UN COMPONENTE DE CLIENTE
 * ---------------------------------------
 * No necesita estado ni escuchar eventos: los dos controles son formularios
 * que envían una Server Action. No lleva `"use client"`, así que su JavaScript
 * no se descarga en el navegador. En una tabla de 30 filas la diferencia es
 * pequeña, pero la costumbre es la correcta: solo se marca como cliente lo que
 * de verdad lo necesita.
 *
 * El `<select>` cambia el rol al enviarse el formulario que lo envuelve. Se
 * añade un botón "Aplicar" visible en lugar de enviar al cambiar la selección,
 * porque un cambio de rol que se ejecute solo al desplegar una lista es
 * demasiado fácil de disparar sin querer.
 *
 * La tabla va dentro de un contenedor con desplazamiento horizontal propio:
 * en una tablet, sin eso, la página entera se movería de lado.
 */

import type { Perfil, Rol } from "@/backend/types/roles";
import { Boton } from "@/frontend/components/ui/Boton";
import { EtiquetaRol } from "@/frontend/components/ui/EtiquetaRol";
import { PRESENTACION_ROLES } from "@/frontend/constants";

interface Props {
  perfiles: Perfil[];
  correos: Record<string, string>;
  roles: readonly Rol[];
  /** Identificador de quien está mirando, para no dejarle desactivarse solo. */
  idPropio: string;
  accionCambiarRol: (datos: FormData) => Promise<void>;
  accionCambiarActivo: (datos: FormData) => Promise<void>;
}

export function TablaUsuarios({
  perfiles,
  correos,
  roles,
  idPropio,
  accionCambiarRol,
  accionCambiarActivo,
}: Props) {
  if (perfiles.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Todavía no hay ningún usuario dado de alta.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-4 py-2.5 font-medium">Persona</th>
            <th className="px-4 py-2.5 font-medium">Rol actual</th>
            <th className="px-4 py-2.5 font-medium">Cambiar rol</th>
            <th className="px-4 py-2.5 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {perfiles.map((perfil) => {
            const esUnoMismo = perfil.id === idPropio;

            return (
              <tr
                key={perfil.id}
                className="border-t border-slate-200 dark:border-slate-800"
              >
                <td className="px-4 py-3">
                  <span className="block font-medium text-slate-900 dark:text-slate-100">
                    {perfil.nombre_completo}
                    {esUnoMismo && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        (tú)
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {correos[perfil.id] ?? "—"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <EtiquetaRol rol={perfil.rol} />
                </td>

                <td className="px-4 py-3">
                  <form
                    action={accionCambiarRol}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="perfilId" value={perfil.id} />
                    <label className="sr-only" htmlFor={`rol-${perfil.id}`}>
                      Rol de {perfil.nombre_completo}
                    </label>
                    <select
                      id={`rol-${perfil.id}`}
                      name="rol"
                      defaultValue={perfil.rol}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      {roles.map((rol) => (
                        <option key={rol} value={rol}>
                          {PRESENTACION_ROLES[rol].etiqueta}
                        </option>
                      ))}
                    </select>
                    <Boton
                      type="submit"
                      variante="secundario"
                      className="px-2.5 py-1.5"
                    >
                      Aplicar
                    </Boton>
                  </form>
                </td>

                <td className="px-4 py-3">
                  <form
                    action={accionCambiarActivo}
                    className="flex items-center gap-3"
                  >
                    <input type="hidden" name="perfilId" value={perfil.id} />
                    <input
                      type="hidden"
                      name="activo"
                      value={perfil.activo ? "no" : "si"}
                    />
                    <span
                      className={
                        perfil.activo
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-400"
                      }
                    >
                      {perfil.activo ? "Activo" : "De baja"}
                    </span>
                    {/* Nadie puede darse de baja a sí mismo: si el único
                        supervisor lo hiciera, nadie podría reactivarlo y haría
                        falta entrar al panel de Supabase para arreglarlo. */}
                    <Boton
                      type="submit"
                      variante={perfil.activo ? "peligro" : "secundario"}
                      className="px-2.5 py-1.5"
                      disabled={esUnoMismo}
                      title={
                        esUnoMismo
                          ? "No puedes darte de baja a ti mismo"
                          : undefined
                      }
                    >
                      {perfil.activo ? "Dar de baja" : "Reactivar"}
                    </Boton>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
