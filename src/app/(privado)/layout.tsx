/**
 * =============================================================================
 *  Envoltorio de todas las pantallas privadas
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Carga el perfil de quien ha entrado y pinta la cabecera común. Todo lo que
 * cuelgue del grupo `(privado)` pasa por aquí.
 *
 * POR QUÉ VUELVE A COMPROBAR LA SESIÓN SI YA LO HACE EL PROXY
 * ------------------------------------------------------------
 * No es una duplicación inútil: son dos comprobaciones DISTINTAS.
 *
 *   - `src/proxy.ts` comprueba que **existe una sesión válida**.
 *   - Este layout comprueba que **existe un perfil y está activo**.
 *
 * La diferencia importa: dar de baja a alguien no invalida su sesión. Un
 * técnico despedido esta mañana sigue teniendo una cookie válida en su tablet
 * y el proxy le dejaría pasar. Aquí es donde se le corta el paso.
 *
 * Además, si por lo que sea el perfil no existiera (un usuario creado a mano
 * sin que el disparador llegase a ejecutarse), la aplicación se rompería en
 * cada pantalla. Aquí se detecta una sola vez.
 *
 * TERCERA BARRERA: aunque las dos anteriores fallaran, las políticas RLS de
 * PostgreSQL seguirían impidiendo leer datos ajenos. Esto es comodidad y
 * claridad; la seguridad de verdad está en la base de datos.
 */

import { redirect } from "next/navigation";

import { crearClienteServidor } from "@/backend/lib/supabase/server";
import { obtenerPerfilPropio } from "@/backend/services/perfiles.service";
import { Cabecera } from "@/frontend/components/layout/Cabecera";
import { RUTAS } from "@/frontend/constants";

import { accionCerrarSesion } from "../(publico)/acceso/acciones";

export default async function LayoutPrivado({ children }: LayoutProps<"/">) {
  const supabase = await crearClienteServidor();

  // `getUser()` valida el token contra el servidor de Supabase, a diferencia de
  // `getSession()`, que se limita a leer la cookie que envía el navegador.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(RUTAS.acceso);

  const perfil = await obtenerPerfilPropio(supabase, user.id);

  // Sin perfil, o dado de baja: fuera. `motivo` permite a la pantalla de
  // acceso explicar por qué se le ha echado, en lugar de dejarle adivinando.
  if (!perfil || !perfil.activo) {
    redirect(`${RUTAS.acceso}?motivo=sin-acceso`);
  }

  return (
    <>
      <Cabecera perfil={perfil} accionSalir={accionCerrarSesion} />
      {children}
    </>
  );
}
