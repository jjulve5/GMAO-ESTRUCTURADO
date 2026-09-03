<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Reglas del proyecto GMAO

Estas reglas son de obligado cumplimiento en este repositorio.

1. **Separación de responsabilidades.** El código se divide en dos mitades:
   `src/frontend/` (lo que se ve) y `src/backend/` (lo que toca datos).
   `src/app/` es zona mixta impuesta por Next.js: contiene las rutas.

   - `src/backend/services/` es el ÚNICO sitio donde puede aparecer
     `supabase.from(...)`.
   - `src/backend/lib/supabase/` es el ÚNICO sitio que puede importar
     `@supabase/ssr` o `@supabase/supabase-js`.
   - `process.env` solo se lee en `src/backend/config/env.ts`.
   - `src/frontend/` no importa nada de `src/backend/`, salvo tipos con
     `import type` (los tipos se borran al compilar y no crean dependencia real).
   - `src/frontend/` y `src/app/` solo pintan; reciben datos por `props` o
     llamando a un servicio.

   Estas cuatro reglas están implementadas como reglas de ESLint en
   `eslint.config.mjs`: incumplirlas hace fallar `npm run lint`, no es solo una
   convención escrita.

2. **No reescribir código de fases anteriores sin permiso explícito.** Si para
   avanzar hace falta modificar algo ya aprobado, hay que parar, explicar el
   motivo técnico y esperar aprobación. Nada de parches silenciosos.

3. **Nada de datos de prueba inventados** para mantenimientos, materiales o
   planes. Los datos vienen de volcados reales de SAP PM (`supabase/sap-dumps/`).

4. **Imprimir el árbol de directorios** cada vez que se creen carpetas o
   ficheros nuevos.

5. **Comentarios en español**, por bloques lógicos, explicando QUÉ hace el
   bloque y POR QUÉ está así. Sin comentarios línea a línea redundantes.
