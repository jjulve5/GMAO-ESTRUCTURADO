/**
 * Cabecera de la aplicación.
 *
 * QUÉ HACE: muestra el nombre del producto, quién ha entrado con qué rol, los
 * enlaces de navegación y el botón de salir.
 *
 * POR QUÉ RECIBE `accionSalir` COMO PROP EN VEZ DE IMPORTARLA
 * -----------------------------------------------------------
 * Cerrar sesión es una operación de servidor: hay que borrar la cookie. Este
 * componente no puede hacerlo ni debe saber cómo se hace.
 *
 * Recibe la Server Action ya construida y se limita a colocarla en un
 * `<form action={...}>`. Así el componente sigue siendo pura presentación y
 * podría reutilizarse en otra pantalla con otra acción distinta.
 *
 * Ese envío por formulario, además, funciona **aunque el navegador no haya
 * cargado el JavaScript todavía**. En una tablet vieja en la planta, eso es la
 * diferencia entre poder salir y no poder.
 *
 * El menú se construye a partir del rol: un operario no ve el enlace de
 * usuarios. Ojo, eso es comodidad visual, NO seguridad: quien escriba la
 * dirección a mano se topa con la comprobación del servidor y con RLS.
 */

import Link from "next/link";

import type { Perfil } from "@/backend/types/roles";
import { EtiquetaRol } from "@/frontend/components/ui/EtiquetaRol";
import { APP, RUTAS } from "@/frontend/constants";

interface Props {
  perfil: Perfil;
  accionSalir: () => Promise<void>;
}

export function Cabecera({ perfil, accionSalir }: Props) {
  const esSupervisor = perfil.rol === "supervisor";

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
        <Link
          href={RUTAS.inicio}
          className="font-semibold tracking-tight text-slate-900 dark:text-slate-100"
        >
          {APP.nombre}
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href={RUTAS.inicio}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Inicio
          </Link>
          {esSupervisor && (
            <Link
              href={RUTAS.usuarios}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Usuarios
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-400">
            {perfil.nombre_completo}
          </span>
          <EtiquetaRol rol={perfil.rol} />
          <form action={accionSalir}>
            <button
              type="submit"
              className="rounded-md px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
