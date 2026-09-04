/**
 * =============================================================================
 *  src/backend/types/roles.ts  —  Roles y perfiles del GMAO
 * =============================================================================
 *
 * QUÉ HACE
 * --------
 * Define en TypeScript los mismos roles que existen en la base de datos, y la
 * forma de una fila de la tabla `perfiles`.
 *
 * ⚠ ESTE FICHERO ES PROVISIONAL
 * -----------------------------
 * Está escrito a mano porque en la Fase 2 todavía no hay tipos generados. En la
 * Fase 3, `npx supabase gen types` producirá `database.types.ts` a partir del
 * esquema real y estos tipos pasarán a derivarse de allí.
 *
 * Mientras tanto existe un riesgo que conviene tener presente: si alguien
 * añade un rol en SQL y olvida añadirlo aquí, TypeScript no se dará cuenta.
 * Por eso la lista de abajo lleva una nota que apunta a la migración exacta
 * donde vive la fuente de verdad.
 */

/**
 * Los cuatro roles del GMAO.
 *
 * FUENTE DE VERDAD: el tipo `public.rol_usuario` definido en
 * `supabase/migrations/20260904090000_fase2_perfiles_y_roles.sql`.
 * Si cambias uno, cambia el otro en el mismo commit.
 */
export const ROLES = [
  "supervisor",
  "tecnico",
  "operario",
  "recambista",
] as const;

/** Un rol válido. Cualquier otra cadena es un error de compilación. */
export type Rol = (typeof ROLES)[number];

/**
 * Comprueba en tiempo de ejecución que un texto es un rol válido.
 *
 * POR QUÉ HACE FALTA
 * ------------------
 * Los tipos de TypeScript se borran al compilar. Cuando un valor llega de
 * fuera —un formulario enviado por el navegador, por ejemplo— TypeScript ya no
 * puede garantizar nada: para él es `string`. Esta función es la frontera donde
 * ese texto sin garantías se convierte en un `Rol` de verdad.
 *
 * Sin esta comprobación, un formulario manipulado podría enviar
 * `rol=administrador_supremo` y llegaría hasta la consulta SQL.
 */
export function esRolValido(valor: unknown): valor is Rol {
  return (
    typeof valor === "string" && (ROLES as readonly string[]).includes(valor)
  );
}

/** Una fila de la tabla `public.perfiles`. */
export interface Perfil {
  /** El mismo identificador que el usuario tiene en `auth.users`. */
  id: string;
  nombre_completo: string;
  rol: Rol;
  /** Baja lógica: los perfiles no se borran, se desactivan. */
  activo: boolean;
  creado_en: string;
}

/** Un perfil acompañado del correo, que vive en `auth.users`, no en `perfiles`. */
export interface PerfilConCorreo extends Perfil {
  email: string;
}
