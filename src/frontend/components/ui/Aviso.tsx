/**
 * Mensaje de aviso: error, éxito o información.
 *
 * QUÉ HACE: muestra un mensaje destacado al usuario.
 *
 * POR QUÉ LLEVA `role="alert"` CUANDO ES UN ERROR: sin ese atributo, un
 * lector de pantalla no anuncia el mensaje y una persona ciega que se
 * equivoque al escribir su contraseña no recibe ninguna señal de que algo ha
 * fallado. El formulario simplemente parece no hacer nada.
 *
 * El color NO es la única señal: cada tipo lleva además un símbolo, porque
 * quien no distingue el rojo del verde no debe quedarse sin la información.
 */

type Tipo = "error" | "exito" | "info";

const ESTILOS: Record<Tipo, { caja: string; simbolo: string }> = {
  error: {
    caja: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200",
    simbolo: "✕",
  },
  exito: {
    caja: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
    simbolo: "✓",
  },
  info: {
    caja: "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
    simbolo: "i",
  },
};

export function Aviso({
  tipo,
  children,
}: {
  tipo: Tipo;
  children: React.ReactNode;
}) {
  const estilo = ESTILOS[tipo];

  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`flex gap-2.5 rounded-md border px-3.5 py-2.5 text-sm ${estilo.caja}`}
    >
      <span aria-hidden="true" className="font-mono font-bold">
        {estilo.simbolo}
      </span>
      <span>{children}</span>
    </div>
  );
}
