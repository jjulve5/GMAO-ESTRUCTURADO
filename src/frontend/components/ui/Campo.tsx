/**
 * Campo de formulario con su etiqueta.
 *
 * QUÉ HACE: agrupa `<label>` y `<input>` y los enlaza con el mismo `id`.
 *
 * POR QUÉ IMPORTA ESE ENLACE: sin él, pulsar sobre el texto de la etiqueta no
 * pone el cursor en el campo, y un lector de pantalla no sabe decir qué se
 * está rellenando. Encapsularlo aquí evita que se olvide en algún formulario.
 *
 * `aria-describedby` conecta el campo con su texto de ayuda para que ese texto
 * también se lea en voz alta, no solo se vea.
 */

import type { ComponentProps } from "react";

interface Props extends ComponentProps<"input"> {
  etiqueta: string;
  ayuda?: string;
}

export function Campo({ etiqueta, ayuda, id, ...resto }: Props) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {etiqueta}
      </label>
      <input
        id={id}
        aria-describedby={idAyuda}
        {...resto}
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-700"
      />
      {ayuda && (
        <p id={idAyuda} className="text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      )}
    </div>
  );
}
