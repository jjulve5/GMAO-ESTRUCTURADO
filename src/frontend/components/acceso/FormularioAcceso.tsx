"use client";

/**
 * Formulario de acceso.
 *
 * POR QUÉ ESTE SÍ LLEVA `"use client"`
 * -------------------------------------
 * Necesita estado: mostrar el mensaje de error que devuelve el servidor y
 * deshabilitar el botón mientras se comprueban las credenciales. Sin eso, un
 * usuario impaciente pulsa "Entrar" cinco veces y lanza cinco intentos.
 *
 * `useActionState` conecta un formulario con una Server Action y devuelve tres
 * cosas: el resultado de la última ejecución, la acción para el `<form>`, y si
 * está en curso. Es lo que permite tener estado sin escribir a mano la lógica
 * de envío.
 *
 * LO QUE ESTE COMPONENTE NO HACE, Y ES DELIBERADO
 * ------------------------------------------------
 * No habla con Supabase. No sabe qué es una cookie. Recibe la acción ya hecha
 * y solo se ocupa de pintar el formulario y el error. La regla de arquitectura
 * lo impediría de todas formas: ESLint no le deja importar nada de
 * `src/backend/`.
 */

import { useActionState } from "react";

import { Aviso } from "@/frontend/components/ui/Aviso";
import { Boton } from "@/frontend/components/ui/Boton";
import { Campo } from "@/frontend/components/ui/Campo";

/** Lo que devuelve la acción: o nada, o un mensaje de error. */
export interface EstadoAcceso {
  error?: string;
}

interface Props {
  accion: (estado: EstadoAcceso, datos: FormData) => Promise<EstadoAcceso>;
  /** Ruta a la que volver tras entrar, guardada por el proxy en `?volver=`. */
  volver?: string;
}

export function FormularioAcceso({ accion, volver }: Props) {
  const [estado, enviar, enCurso] = useActionState(accion, {});

  return (
    <form action={enviar} className="flex flex-col gap-4">
      {/* El destino viaja en un campo oculto porque la Server Action no tiene
          acceso a los parámetros de la URL del navegador. */}
      {volver && <input type="hidden" name="volver" value={volver} />}

      <Campo
        id="email"
        name="email"
        type="email"
        etiqueta="Correo electrónico"
        autoComplete="username"
        required
        disabled={enCurso}
        placeholder="nombre@empresa.com"
      />

      <Campo
        id="password"
        name="password"
        type="password"
        etiqueta="Contraseña"
        autoComplete="current-password"
        required
        disabled={enCurso}
      />

      {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}

      <Boton type="submit" disabled={enCurso}>
        {enCurso ? "Comprobando…" : "Entrar"}
      </Boton>
    </form>
  );
}
