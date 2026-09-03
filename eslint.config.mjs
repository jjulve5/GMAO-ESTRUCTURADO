/**
 * =============================================================================
 *  eslint.config.mjs  —  Análisis estático y REGLAS DE ARQUITECTURA
 * =============================================================================
 *
 * QUÉ HACE ESTE FICHERO
 * ---------------------
 * Además de la configuración estándar de Next.js, aquí se convierten las
 * reglas de arquitectura del proyecto en comprobaciones automáticas.
 *
 * POR QUÉ
 * -------
 * Una regla escrita en un README se incumple sin querer un martes por la
 * tarde, y nadie se entera hasta tres semanas después. Una regla escrita aquí
 * hace que `npm run lint` FALLE, con el nombre del fichero y el motivo.
 *
 * La separación frontend/backend deja de depender de la memoria de quien
 * escribe el código.
 */

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Mensajes largos como constantes: aparecen en la consola cuando algo falla, y
 * deben explicar QUÉ hacer, no solo que está prohibido.
 */
const MSG_SUPABASE =
  "Regla nº 1 del proyecto: solo src/backend/lib/supabase/ puede importar @supabase/*. " +
  "Si necesitas datos, usa un servicio de src/backend/services/ (y pásale el cliente como parámetro).";

const MSG_BACKEND_DESDE_FRONTEND =
  "Regla nº 1 del proyecto: src/frontend/ no puede importar código de src/backend/. " +
  "Los componentes reciben los datos ya preparados por props. " +
  "Excepción permitida: los TIPOS, escribiendo 'import type { X } from ...' (los tipos desaparecen al compilar).";

const MSG_PROCESS_ENV =
  "Regla nº 1 del proyecto: process.env solo se lee en src/backend/config/env.ts. " +
  "Importa desde allí 'configPublica' u 'obtenerConfigPrivada()'. " +
  "Así hay un único sitio que auditar para saber qué configuración necesita la aplicación.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  /* ==========================================================================
   * REGLA A — Nadie abre conexiones a Supabase por su cuenta
   * ==========================================================================
   * Se aplica a TODO el proyecto y se levanta más abajo únicamente para
   * src/backend/lib/supabase/. Si cualquier otro fichero importa el SDK, el
   * lint falla.
   *
   * Motivo: un cliente creado a mano en un componente no lleva la gestión de
   * cookies de sesión correcta, y es la vía más rápida a los fallos de
   * "me desloguea solo" y a filtrar datos entre usuarios.
   */
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@supabase/ssr", message: MSG_SUPABASE },
            { name: "@supabase/supabase-js", message: MSG_SUPABASE },
          ],
        },
      ],
    },
  },
  {
    // Excepción: esta carpeta existe precisamente para eso.
    files: ["src/backend/lib/supabase/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": "off" },
  },

  /* ==========================================================================
   * REGLA B — El frontend no importa backend (salvo tipos)
   * ==========================================================================
   * `allowTypeImports: true` permite `import type { Orden } from "@/backend/types"`
   * pero rechaza `import { obtenerOrdenes } from "@/backend/services/..."`.
   *
   * Motivo del matiz: los tipos de TypeScript se BORRAN al compilar. Importar
   * un tipo no genera ninguna dependencia en el programa que se ejecuta, así
   * que no rompe la separación de capas. Importar una función sí.
   *
   * Se usa la versión de la regla de typescript-eslint porque la de ESLint
   * base no distingue entre importar un tipo y importar código.
   */
  {
    files: ["src/frontend/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@supabase/ssr", message: MSG_SUPABASE },
            { name: "@supabase/supabase-js", message: MSG_SUPABASE },
          ],
          patterns: [
            {
              group: ["@/backend/*", "@/backend/**"],
              message: MSG_BACKEND_DESDE_FRONTEND,
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },

  /* ==========================================================================
   * REGLA C — process.env solo se lee en un sitio
   * ==========================================================================
   * `no-restricted-properties` prohíbe el acceso `process.env` en cualquier
   * fichero de src/, y se levanta solo para config/env.ts.
   *
   * Motivo: si cada fichero lee sus propias variables, nadie sabe qué
   * configuración hace falta para arrancar la aplicación hasta que revienta.
   */
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "process", property: "env", message: MSG_PROCESS_ENV },
      ],
    },
  },
  {
    files: ["src/backend/config/env.ts"],
    rules: { "no-restricted-properties": "off" },
  },
]);

export default eslintConfig;
