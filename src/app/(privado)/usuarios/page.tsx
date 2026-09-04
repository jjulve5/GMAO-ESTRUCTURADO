/**
 * =============================================================================
 *  Gestión de usuarios  ·  /usuarios  ·  solo supervisores
 * =============================================================================
 *
 * QUÉ HACE: lista a todas las personas dadas de alta y permite crear cuentas,
 * cambiar roles y dar de baja.
 *
 * TRES BARRERAS PARA LA MISMA PUERTA, Y CADA UNA SIRVE PARA ALGO DISTINTO
 * -----------------------------------------------------------------------
 *  1. La cabecera no enseña el enlace a quien no es supervisor. Es comodidad
 *     visual: no impide nada, cualquiera puede escribir la dirección.
 *  2. Esta página comprueba el rol y devuelve un aviso. Evita enseñar una
 *     pantalla rota o vacía a quien no le corresponde.
 *  3. Las políticas RLS de PostgreSQL. **Esta es la única que es seguridad de
 *     verdad.** Aunque alguien saltase las dos anteriores, la base de datos le
 *     devolvería únicamente su propia ficha.
 *
 * Conviene tener clara la diferencia: las dos primeras son experiencia de
 * usuario, la tercera es la que impide una fuga de datos.
 *
 * POR QUÉ HACE FALTA EL CLIENTE ADMINISTRADOR SOLO PARA LOS CORREOS
 * ------------------------------------------------------------------
 * El correo no está en `perfiles`: vive en `auth.users`, un esquema que
 * pertenece a Supabase y que el cliente normal no puede leer. Es la única
 * razón por la que esta pantalla lo usa.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { crearClienteAdministrador } from "@/backend/lib/supabase/admin";
import { crearClienteServidor } from "@/backend/lib/supabase/server";
import {
  listarPerfiles,
  obtenerPerfilPropio,
} from "@/backend/services/perfiles.service";
import { obtenerCorreosPorId } from "@/backend/services/usuarios.service";
import { ROLES } from "@/backend/types/roles";
import { Aviso } from "@/frontend/components/ui/Aviso";
import { FormularioAltaUsuario } from "@/frontend/components/usuarios/FormularioAltaUsuario";
import { TablaUsuarios } from "@/frontend/components/usuarios/TablaUsuarios";
import { RUTAS } from "@/frontend/constants";

import {
  accionCambiarActivo,
  accionCambiarRol,
  accionCrearUsuario,
} from "./acciones";

export const metadata: Metadata = { title: "Usuarios" };

export default async function PaginaUsuarios() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(RUTAS.acceso);

  const perfil = await obtenerPerfilPropio(supabase, user.id);
  if (!perfil) redirect(RUTAS.acceso);

  // Barrera 2: mensaje claro en lugar de una pantalla vacía y desconcertante.
  if (perfil.rol !== "supervisor") {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <Aviso tipo="error">
          Esta pantalla es solo para supervisores. Si necesitas dar de alta a
          alguien, pídeselo a tu supervisor.
        </Aviso>
      </main>
    );
  }

  const perfiles = await listarPerfiles(supabase);

  const administrador = crearClienteAdministrador();
  const correos = await obtenerCorreosPorId(administrador);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {perfiles.length} {perfiles.length === 1 ? "persona" : "personas"} en
          el sistema. Las cuentas solo las crean los supervisores: no existe
          registro libre.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">Dar de alta a alguien</h2>
        <div className="rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <FormularioAltaUsuario accion={accionCrearUsuario} roles={ROLES} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">Personas dadas de alta</h2>
        <TablaUsuarios
          perfiles={perfiles}
          correos={Object.fromEntries(correos)}
          roles={ROLES}
          idPropio={perfil.id}
          accionCambiarRol={accionCambiarRol}
          accionCambiarActivo={accionCambiarActivo}
        />
      </section>
    </main>
  );
}
