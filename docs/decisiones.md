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
- **Decisión:** empezamos con **Supabase Cloud** para no bloquear las Fases 2 y 3. La opción de autoalojar (Supabase en Docker, en un servidor de la empresa)
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
  - `src-folder.md`: _"move the `app` Router folder to `src/app`"_, y
    _"`src/app` will be ignored if `app` is present in the root directory"_.
    Por tanto `app/` **no** se puede mover dentro de `frontend/`: la aplicación
    se quedaría sin rutas.
  - `02-project-structure.md`: _"we're using `components` and `lib` folders as
    generalized placeholders, their naming has no special framework
    significance"_. Por tanto el resto de carpetas sí se puede renombrar sin
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

## D-006 · Cierre de la Fase 1: CI, herramientas y versión de Node

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** aprobada
- **Contexto:** una auditoría del cierre de la Fase 1 destapó que la afirmación
  "las reglas de arquitectura son mecánicas" era **falsa a medias**. Las reglas
  de ESLint solo actúan si alguien ejecuta `npm run lint`, y nada lo obligaba:
  un `git push` con las tres reglas violadas habría entrado sin aviso.
- **Decisiones tomadas:**
  1. **CI en GitHub Actions** (`.github/workflows/ci.yml`): en cada push y pull
     request, instalación limpia con `npm ci` y ejecución de `format:check`,
     `lint`, `typecheck` y `build`. Esto es lo que convierte la arquitectura en
     algo que se sostiene sin depender de la memoria de nadie. La compilación
     usa credenciales falsas declaradas en el propio workflow: la CI no se
     conecta a ninguna base de datos, solo comprueba que el código compila.
  2. **CLI de Supabase inicializado** (`npx supabase init`), que crea
     `supabase/config.toml`. Sin ese fichero no se pueden aplicar migraciones ni
     generar los tipos en la Fase 3. Comprobado antes de hacerlo: el CLI
     respondía `LegacyProjectNotLinkedError`. Se ajustó `[db.seed].sql_paths` de
     `./seed.sql` (que no existe) a `./seed/*.sql`, que es nuestra carpeta.
     Revisado que el fichero generado no contiene ningún secreto.
  3. **Versión de Node fijada**: `.nvmrc` con 22.22.2 y `engines` en
     `package.json`. Next 16 declara un mínimo de `>=20.9.0` (comprobado en su
     `package.json`), pero se exige 22 por ser la línea con la que el proyecto
     está construido y verificado. La CI lee la versión de `.nvmrc`, de modo que
     local y CI no pueden desincronizarse.
  4. **Prettier + EditorConfig** con script `npm run format`. Se añade
     `eslint-config-prettier` al FINAL de `eslint.config.mjs` para apagar las
     reglas de formato de ESLint y que las dos herramientas no se contradigan.
     Comprobado explícitamente, escribiendo ficheros que las incumplen, que ese
     añadido **no** desactiva las tres reglas de arquitectura.
     `supabase/sap-dumps/` queda excluido del formateo: los volcados de SAP se
     guardan exactamente como salen del sistema.
- **Añadido `npm run verify`**, que encadena las cuatro comprobaciones en el
  mismo orden que la CI, para poder reproducir en local lo que fallará en remoto.
- **Errata corregida:** `AGENTS.md` afirmaba que "estas cuatro reglas" estaban
  implementadas en ESLint. Son cinco restricciones documentadas y tres reglas de
  ESLint. Ninguna de las dos cifras era cuatro.

## D-007 · Copias de seguridad: aplazadas hasta después del lanzamiento

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** aplazada conscientemente
- **Decisión del responsable del proyecto:** evaluar si compensa pagar un plan
  con copias automáticas **una vez la aplicación esté lanzada y en uso**.
- **Riesgo que se asume mientras tanto:** el plan gratuito de Supabase no
  incluye copias descargables ni recuperación a un punto en el tiempo. Un
  `delete` sin `where`, o un error en un script de importación, son
  irreversibles. Las migraciones versionadas protegen la **estructura** de las
  tablas, no los **datos**.
- **Límite acordado:** el riesgo es aceptable mientras la base de datos solo
  contenga volcados de SAP, que se pueden reimportar. **Deja de serlo en el
  momento en que el primer técnico registre trabajo real**, porque eso ya no se
  puede recuperar de ninguna otra fuente.
- **A revisar antes de:** poner la aplicación en manos de los técnicos.

## D-008 · Evaluación de Firebase como alternativa a Supabase

- **Fecha:** 2026-09-03 · **Fase:** 1 · **Estado:** evaluada; se mantiene Supabase
- **Pregunta planteada:** ¿compensa migrar a Firebase por sus condiciones?
- **Conclusión: no, y el motivo no es el precio sino el modelo de datos.**
  Supabase es PostgreSQL (relacional, con SQL y JOINs). Firestore es una base
  documental sin JOINs ni agregaciones. Los datos de este proyecto vienen de
  SAP PM y son relacionales por naturaleza: ubicaciones técnicas jerárquicas,
  equipos que cuelgan de ellas, planes con listas de tareas y operaciones,
  órdenes que enlazan equipo, plan, técnico y materiales.
- **Tres puntos concretos que lo deciden:**
  1. **Fase 7 (comparativas diarias de actividad)** son agregaciones
     `GROUP BY ... COUNT`. Firestore no las soporta: obligaría a mantener
     contadores precalculados a mano o a exportar a BigQuery, otro producto y
     otra factura.
  2. **La importación de SAP.** En PostgreSQL es un `COPY ... FROM` de un CSV.
     En Firestore es un script documento a documento, y **se paga por
     escritura**: el plan gratuito permite 20.000 al día, de modo que un solo
     volcado del maestro de materiales puede agotar la cuota diaria, y
     reimportar tras corregir un error costaría otro día.
  3. **El coste por operación se traslada al diseño de pantallas.** En Firestore
     cada documento leído se factura: una lista de 50 órdenes son 50 lecturas.
     Treinta técnicos navegando rozan el límite diario de 50.000 lecturas. En
     PostgreSQL esa misma pantalla es una consulta.
- **Lo que Firebase sí hace mejor, reconocido:** persistencia **sin conexión**
  nativa y madura en su SDK, notificaciones push mediante FCM, y no pausa los
  proyectos inactivos.
- **Pregunta abierta que podría reabrir esta decisión:** si los técnicos van a
  trabajar en zonas de la planta **sin cobertura**, el modo offline deja de ser
  una comodidad y pasa a ser un requisito. Aun así, la respuesta previsible no
  sería sustituir Supabase por Firebase, sino añadir una capa de trabajo sin
  conexión en el navegador sobre PostgreSQL.
- **Coste de migrar, si algún día se decidiera:** se perderían los clientes de
  Supabase, `env.ts`, las reglas de ESLint que nombran `@supabase/*` y toda la
  planificación SQL de las Fases 3 y 6. **Se conservaría** la separación
  frontend/backend, la CI, el formateo y la disciplina de servicios: la
  arquitectura en capas está diseñada precisamente para que el proveedor de
  datos sea sustituible sin tocar la interfaz.
- **Nota sobre las fuentes:** los límites de ambos planes gratuitos proceden de
  fuentes secundarias, porque ni `supabase.com` ni la documentación de Firebase
  eran accesibles desde el entorno donde se redactó esta nota. Conviene
  verificarlos antes de tomar cualquier decisión económica.

## D-009 · Los cuatro roles del GMAO

- **Fecha:** 2026-09-04 · **Fase:** 2 · **Estado:** aprobada
- **Decisión del responsable del proyecto:** `supervisor`, `tecnico`,
  `operario` (perfil de solo creación de solicitudes) y `recambista` (hay una
  sola persona en el almacén).
- **Implementación:** tipo `ENUM` de PostgreSQL `public.rol_usuario`, no una
  columna de texto libre. Un valor mal escrito falla al insertar en vez de
  crear en silencio un rol fantasma que no encaja con ninguna política RLS y
  deja a esa persona sin ver nada y sin ningún mensaje que lo explique.
- **Consecuencia asumida:** añadir un rol más adelante es posible
  (`alter type ... add value`), pero eliminar uno obliga a recrear el tipo y a
  revisar todas las políticas que lo mencionen.

## D-010 · Acceso con correo y contraseña, altas solo por supervisor

- **Fecha:** 2026-09-04 · **Fase:** 2 · **Estado:** aprobada
- **Decisión:** no existe registro público. Las cuentas las crea un supervisor
  desde la propia aplicación, con una contraseña inicial que entrega en mano.
- **Consecuencia técnica que adelanta trabajo previsto para la Fase 3:** crear
  la cuenta de otra persona exige la API de administración de Supabase
  (`auth.admin.*`), que solo funciona con la **clave secreta**. Por tanto
  `SUPABASE_SECRET_KEY` pasa a ser obligatoria en `.env.local` desde la Fase 2,
  y no desde la Fase 3 como se dijo al escribir `.env.example`.
- **Dónde vive la clave (elegido entre tres opciones):** en el `.env.local` del
  servidor de Next. Se descartó una Edge Function de Supabase por añadir otro
  runtime y otro despliegue que mantener, desproporcionado para una
  herramienta interna de treinta usuarios; y se descartó crear las cuentas a
  mano desde el panel de Supabase por ser una herramienta que no se le puede
  poner delante a un jefe de mantenimiento.
- **Tres barreras impiden que esa clave llegue al navegador:** `server-only`
  (que rompe la compilación si un componente de cliente la importa), la
  lectura diferida dentro de una función, y la ausencia del prefijo
  `NEXT_PUBLIC_`.

## D-011 · `middleware.ts` no existe en Next 16: es `proxy.ts`

- **Fecha:** 2026-09-04 · **Fase:** 2 · **Estado:** aplicada
- **Hallazgo:** la documentación de Next incluida en el propio proyecto
  (`node_modules/next/dist/docs/.../file-conventions/middleware.md`) dice
  literalmente que _«the `middleware.js` file convention has been deprecated in
  Next.js 16 and renamed to `proxy.js`»_.
- **Por qué se registra:** prácticamente toda la documentación y todos los
  tutoriales de Supabase con Next siguen indicando `middleware.ts`, porque son
  anteriores al cambio. Escribirlo de memoria habría metido una convención
  obsoleta en el proyecto.
- **Verificado empíricamente:** la salida de `next build` incluye la línea
  `ƒ Proxy (Middleware)`, lo que confirma que Next reconoce `src/proxy.ts`.
- **Impacto en la Fase 1, aprobado explícitamente:** se corrigieron cuatro
  comentarios de `src/backend/lib/supabase/server.ts`, la fila de la Fase 2 en
  `docs/pdca.md` y el aviso de `.env.example` sobre cuándo hace falta la clave
  secreta. Ninguna lógica cambió.

## D-012 · El rol nunca se lee de los metadatos del usuario

- **Fecha:** 2026-09-04 · **Fase:** 2 · **Estado:** aplicada
- **Decisión:** el disparador `crear_perfil_al_registrarse` asigna **siempre**
  el rol `operario`, el de menos permisos. El rol real lo asigna después el
  supervisor, desde un sitio donde sí se comprueba quién lo está pidiendo.
- **Motivo:** `raw_user_meta_data` son datos que el propio usuario envía al
  registrarse. Un disparador que leyera el rol de ahí permitiría a cualquiera
  que alcanzase el registro pedir el rol `supervisor` y obtenerlo. Es una
  escalada de privilegios de manual.
- **Coste asumido:** el alta son dos pasos en lugar de uno, y si el segundo
  falla queda una cuenta válida con rol `operario`. El servicio lo detecta y
  devuelve un mensaje explícito para que el supervisor lo corrija desde la
  lista, en lugar de dejar una cuenta a medias sin que nadie se entere.

## D-013 · Los perfiles no se borran nunca

- **Fecha:** 2026-09-04 · **Fase:** 2 · **Estado:** aplicada
- **Decisión:** la tabla `perfiles` **no tiene ninguna política de `DELETE`**.
  Al estar RLS activado, la ausencia de política significa que nadie puede
  borrar, ni siquiera un supervisor. Las bajas son lógicas: `activo = false`.
- **Motivo:** un GMAO tiene que poder responder dentro de dos años a la
  pregunta «¿quién ejecutó esta orden?». Si el perfil se borrase, esa respuesta
  se perdería para siempre y con ella la trazabilidad del mantenimiento.
- **Efecto secundario buscado:** nadie puede darse de baja a sí mismo. Si el
  único supervisor se desactivara, no quedaría nadie capaz de reactivarlo y
  habría que entrar al panel de Supabase a arreglarlo a mano. La comprobación
  está tanto en la interfaz (botón deshabilitado) como en el servidor, porque
  un botón deshabilitado se salta desde las herramientas del navegador.
