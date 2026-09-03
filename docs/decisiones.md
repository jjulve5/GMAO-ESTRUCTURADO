# Registro de decisiones técnicas

Cada entrada anota QUÉ se decidió, CUÁNDO, POR QUÉ y qué queda pendiente de
revisar. Sirve para no rediscutir lo mismo tres fases más adelante y para que
cualquiera que llegue nuevo entienda por qué el proyecto es como es.

---

## D-001 · Alojamiento: Supabase Cloud ahora, autoalojamiento a revisar en Fase 3

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** aprobada
- **Contexto:** el enunciado hablaba de un GMAO "local", palabra que admite dos
  lecturas incompatibles: aplicación de uso interno alojada en la nube, o base
  de datos corriendo en un servidor de la propia planta.
- **Decisión:** empezamos con **Supabase Cloud** para no bloquear las Fases 2 y
  3. La opción de autoalojar (Supabase en Docker, en un servidor de la empresa)
  se reevalúa al terminar la Fase 3, cuando ya exista el esquema real.
- **Motivo:** el autoalojamiento traslada backups, actualizaciones,
  certificados HTTPS y disponibilidad al equipo interno. Asumir eso antes de
  tener una sola tabla es coste sin beneficio. Con el esquema ya definido, la
  decisión se toma con datos.
- **Riesgo asumido:** migrar de Cloud a autoalojado más adelante es viable
  (ambos son PostgreSQL y las migraciones están versionadas en `supabase/`),
  pero no es gratis: hay que mover datos, reconfigurar autenticación y revisar
  el almacenamiento de ficheros.
- **A revisar en Fase 3.**

## D-002 · Plan Free durante el desarrollo

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** aprobada
- **Decisión:** desarrollar sobre el plan gratuito de Supabase.
- **Advertencia registrada:** según fuentes secundarias (la web oficial de
  Supabase está bloqueada desde el entorno donde se redactó esta nota, así que
  **estos números deben verificarse en supabase.com/pricing**), el plan Free
  limita a 500 MB de base de datos, 2 proyectos activos, y **pausa el proyecto
  tras una semana sin actividad**.
- **Consecuencia:** el pausado es irrelevante mientras desarrollamos, pero
  inaceptable para un GMAO en producción. Antes de poner la herramienta en
  manos de los técnicos hay que pasar a plan de pago o autoalojar (ver D-001).

## D-003 · Soporte simultáneo de los dos nombres de clave de API

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** aprobada
- **Contexto:** Supabase está sustituyendo las claves `anon` y `service_role`
  por `sb_publishable_...` y `sb_secret_...`, con retirada de las heredadas
  prevista para finales de 2026.
- **Decisión:** `src/lib/env.ts` acepta **los dos** nombres de variable, dando
  prioridad al nuevo, y avisa por consola (solo en servidor y solo en
  desarrollo) cuando detecta el heredado.
- **Motivo:** no sabemos aún qué nombres mostrará el panel al crear el
  proyecto, y el coste de soportar ambos es bajo y está aislado en un único
  fichero. Evita quedarse bloqueado por un detalle de nomenclatura.
- **Base comprobada:** `grep` de `sb_publishable` y `sb_secret` sobre
  `@supabase/supabase-js` y `@supabase/ssr` no devuelve ninguna coincidencia.
  Para el SDK la clave es una cadena que reenvía sin interpretar, de modo que
  el cambio es puramente de nomenclatura y no afecta a la lógica.
- **Impacto:** modificó `src/lib/env.ts`, `.env.example` y el nombre de la
  propiedad usada en `src/lib/supabase/client.ts` y `server.ts`
  (`supabaseAnonKey` -> `supabaseClavePublica`). Cambio aprobado explícitamente
  conforme a la regla nº 2 del proyecto.

## D-004 · Contenido admitido en `supabase/sap-dumps/`

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** aprobada
- **Decisión:** en esa carpeta se versionan los volcados de **SAP PM**
  correspondientes a **mantenimiento preventivo y recambios**. Los datos de
  empresa **no** se incorporan por ahora.
- **Motivo:** son los datos necesarios para diseñar el esquema de la Fase 3, y
  dejar fuera lo demás reduce la superficie de información sensible que acaba
  en el repositorio.
- **A revisar:** si en algún momento hiciera falta incorporar datos de empresa,
  se decide antes si el fichero puede vivir en el repositorio o debe quedarse
  fuera mediante `.gitignore`.

## D-005 · Estructura visible frontend / backend dentro de `src/`

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** aprobada
- **Contexto:** los nombres `components`, `lib` y `services` no dejaban claro de
  un vistazo qué parte del código toca datos y qué parte solo pinta.
- **Decisión:** el código se reorganiza en `src/frontend/` y `src/backend/`.
  `src/app/` se queda donde está y se documenta como **zona mixta**.
- **Base técnica comprobada** (documentación de Next 16 incluida en
  `node_modules/next/dist/docs/`):
  - `src-folder.md`: *"move the `app` Router folder to `src/app`"*, y
    *"`src/app` will be ignored if `app` is present in the root directory"*.
    Por tanto `app/` **no** se puede mover dentro de `frontend/`: la aplicación
    se quedaría sin rutas.
  - `02-project-structure.md`: *"we're using `components` and `lib` folders as
    generalized placeholders, their naming has no special framework
    significance"*. Por tanto el resto de carpetas sí se puede renombrar sin
    riesgo.
- **Se descartó** un monorepo real (`frontend/` + `backend/` con dos
  `package.json`): obligaría a renunciar a los Server Components y las Server
  Actions, y añadiría CORS, dos despliegues y autenticación duplicada. Para 30
  usuarios, coste sin beneficio.
- **Efecto colateral aceptado:** `src/lib/constants.ts` se partió en dos, porque
  mezclaba capas. `APP` y `RUTAS` (presentación) van a
  `src/frontend/constants.ts`; `ORIGEN_SAP` (origen de los datos) va a
  `src/backend/config/sap.ts`.
- **Refuerzo añadido:** la separación deja de depender de la memoria y pasa a
  ser mecánica. `eslint.config.mjs` implementa tres reglas, verificadas con
  ficheros que las incumplen a propósito:
  1. solo `src/backend/lib/supabase/` puede importar `@supabase/*`;
  2. `src/frontend/` no puede importar valores de `src/backend/`, pero sí tipos;
  3. `process.env` solo se lee en `src/backend/config/env.ts`.
- **Estándar de documentación adoptado:** cada carpeta lleva un `README.md` cuya
  primera línea sigue el formato
  `FASE X · FRONTEND|BACKEND|MIXTO · explicación sencilla de qué contiene`,
  más una línea con en qué fase se creó, en cuál se llena y su estado actual.
  Los ficheros `.gitkeep` se sustituyeron por esos `README.md`, que cumplen la
  misma función de mantener la carpeta en git y además la explican.
