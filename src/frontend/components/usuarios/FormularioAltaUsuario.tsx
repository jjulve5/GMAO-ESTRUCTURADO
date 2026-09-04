"use client";

/**
 * Formulario de alta de usuario, para supervisores.
 *
 * QUÉ HACE: recoge correo, nombre, contraseña inicial y rol, y se lo pasa a la
 * Server Action que crea la cuenta.
 *
 * POR QUÉ HAY UN GENERADOR DE CONTRASEÑA
 * ---------------------------------------
 * Si el supervisor tiene que inventarse 30 contraseñas, acabarán siendo
 * "Gmao2026" con el número cambiado. El generador produce una aleatoria y
 * suficientemente larga, y como se muestra en pantalla el supervisor puede
 * copiarla y dársela al técnico.
 *
 * Usa `crypto.getRandomValues`, que es el generador criptográfico del
 * navegador, y NO `Math.random()`, que es predecible y no debe usarse jamás
 * para nada relacionado con credenciales.
 *
 * ESTO ES UNA MEDIDA PROVISIONAL, y conviene decirlo: lo correcto es que el
 * técnico cambie la contraseña en su primer acceso. Esa pantalla no existe
 * todavía y queda anotada como pendiente de la Fase 2.
 */

import { useActionState, useState } from "react";

import type { Rol } from "@/backend/types/roles";
import { Aviso } from "@/frontend/components/ui/Aviso";
import { Boton } from "@/frontend/components/ui/Boton";
import { Campo } from "@/frontend/components/ui/Campo";
import { PRESENTACION_ROLES } from "@/frontend/constants";

export interface EstadoAlta {
  error?: string;
  exito?: string;
}

interface Props {
  accion: (estado: EstadoAlta, datos: FormData) => Promise<EstadoAlta>;
  /** Roles asignables. Llegan por prop para no repetir la lista aquí. */
  roles: readonly Rol[];
}

/** Contraseña aleatoria de 16 caracteres, con el generador seguro del navegador. */
function generarContrasena(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const aleatorios = crypto.getRandomValues(new Uint32Array(16));
  return Array.from(aleatorios, (n) => alfabeto[n % alfabeto.length]).join("");
}

export function FormularioAltaUsuario({ accion, roles }: Props) {
  const [estado, enviar, enCurso] = useActionState(accion, {});
  const [contrasena, setContrasena] = useState("");

  return (
    <form action={enviar} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          id="nombreCompleto"
          name="nombreCompleto"
          etiqueta="Nombre y apellidos"
          required
          disabled={enCurso}
          placeholder="Ana Ruiz Molina"
        />
        <Campo
          id="emailNuevo"
          name="email"
          type="email"
          etiqueta="Correo electrónico"
          required
          disabled={enCurso}
          placeholder="ana.ruiz@empresa.com"
          ayuda="Será su usuario para entrar."
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Campo
              id="password"
              name="password"
              etiqueta="Contraseña inicial"
              required
              minLength={8}
              disabled={enCurso}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              ayuda="Anótala y entrégasela. Mínimo 8 caracteres."
            />
          </div>
          <Boton
            type="button"
            variante="secundario"
            disabled={enCurso}
            onClick={() => setContrasena(generarContrasena())}
            className="mb-6"
          >
            Generar
          </Boton>
        </div>
      </div>

      <fieldset className="flex flex-col gap-2" disabled={enCurso}>
        <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Rol
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map((rol, indice) => (
            <label
              key={rol}
              className="flex cursor-pointer gap-3 rounded-md border border-slate-200 p-3 text-sm hover:bg-slate-50 has-checked:border-slate-900 dark:border-slate-800 dark:hover:bg-slate-900 dark:has-checked:border-slate-100"
            >
              <input
                type="radio"
                name="rol"
                value={rol}
                defaultChecked={indice === 0}
                className="mt-0.5"
                required
              />
              <span>
                <span className="block font-medium text-slate-900 dark:text-slate-100">
                  {PRESENTACION_ROLES[rol].etiqueta}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {PRESENTACION_ROLES[rol].descripcion}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}
      {estado.exito && <Aviso tipo="exito">{estado.exito}</Aviso>}

      <div>
        <Boton type="submit" disabled={enCurso}>
          {enCurso ? "Creando…" : "Crear usuario"}
        </Boton>
      </div>
    </form>
  );
}
