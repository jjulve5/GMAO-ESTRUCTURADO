# FASE 1 · GESTIÓN · PDCA del proyecto GMAO

> **Creado en:** Fase 1 · **Se actualiza:** al cerrar cada fase · **Estado:** Fase 1 cerrada, Fase 2 sin empezar

Ciclo **Planificar – Hacer – Verificar – Actuar** aplicado al desarrollo, con el
mismo criterio que se aplicaría a un plan de mantenimiento: **una acción no está
hecha hasta que está verificada**, y lo que la verificación destapa se convierte
en una acción correctiva registrada.

---

## 🔴 PENDIENTE DE VALIDAR · Base de datos de Supabase

Esto es lo que el proyecto tiene abierto ahora mismo. Nada de esto lo puede
hacer nadie más que el responsable del proyecto.

| #      | Validación                                                                                   | Cómo se comprueba                                                      | Por qué importa                                                                                                                        | Fase límite         |
| ------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **V1** | La versión del PostgreSQL remoto coincide con `major_version = 17` de `supabase/config.toml` | `show server_version;` en el SQL Editor                                | Si no coinciden, `supabase db diff` y el desarrollo local dan resultados que no se corresponden con producción. Es un fallo silencioso | **antes de Fase 3** |
| **V2** | La aplicación arranca contra el proyecto real                                                | `cp .env.example .env.local`, pegar URL y clave pública, `npm run dev` | Hasta que esto no pase, la conexión con Supabase es teoría                                                                             | **antes de Fase 2** |
| **V3** | El CLI está enlazado al proyecto                                                             | `npx supabase link` y luego `npx supabase migration list` sin error    | Sin enlace no se pueden aplicar migraciones ni generar tipos                                                                           | **antes de Fase 3** |
| **V4** | Ninguna tabla sin RLS                                                                        | Consulta 3.6 de `mantenimiento-bd.md`: debe devolver **0 filas**       | Una tabla sin RLS está abierta a cualquiera que tenga la clave pública, que va incrustada en el JavaScript del navegador               | **durante Fase 3**  |
| **V5** | `pg_stat_statements` activado                                                                | Database → Extensions                                                  | Sin ella no se pueden diagnosticar consultas lentas                                                                                    | antes de producción |

### Preguntas abiertas que bloquean fases

| Pregunta                                                                                           | Bloquea    | Por qué                                                                                                                       |
| -------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| ¿Qué roles exactos? (¿solo Admin y Técnico, o también Jefe de Mantenimiento, Almacén, Producción?) | **Fase 2** | Los roles son un tipo ENUM en PostgreSQL y la base de las políticas RLS. Cambiarlos después obliga a una migración de esquema |
| ¿Cómo entran los usuarios? (email + contraseña / enlace mágico / cuenta corporativa)               | **Fase 2** | Determina la configuración de Auth y las pantallas de acceso                                                                  |
| ¿Los técnicos tienen cobertura en toda la planta?                                                  | **Fase 5** | Si trabajan sin red, el trabajo sin conexión pasa de comodidad a requisito, y reabre la decisión D-008                        |
| ¿Los códigos de `ORIGEN_SAP` son los de vuestro SAP?                                               | **Fase 3** | Son la correspondencia estándar. Si vuestro SAP está personalizado, cambian, y el esquema se diseñaría mal                    |

---

## Ciclo cerrado · FASE 1 · Infraestructura

### P · Planificar

Levantar el proyecto con Next.js, Tailwind y Supabase, con separación estricta
de responsabilidades y preparado para recibir volcados reales de SAP PM.

### D · Hacer

| Acción                                                              | Resultado | Commit    |
| ------------------------------------------------------------------- | --------- | --------- |
| Andamiaje Next 16.3.4 + React 19 + TypeScript estricto + Tailwind 4 | hecho     | `3916726` |
| Clientes de Supabase separados: navegador y servidor                | hecho     | `3916726` |
| Estructura por capas y plantilla de variables de entorno            | hecho     | `3916726` |
| Carpetas vacías preservadas en git                                  | hecho     | `cef30db` |
| Soporte de los dos nombres de clave de API                          | hecho     | `f53afd7` |
| Reorganización a `src/frontend` y `src/backend`                     | hecho     | `70c7e04` |
| Reglas de arquitectura como reglas de ESLint                        | hecho     | `70c7e04` |
| CI, Prettier, Node fijado, CLI de Supabase inicializado             | hecho     | `16c1ef1` |
| Guía de mantenimiento de la base de datos                           | hecho     | `7b3b603` |
| Registro de las 8 decisiones técnicas                               | hecho     | `4160d69` |

### C · Verificar

Nada se dio por bueno por parecerlo. Cada afirmación tiene una comprobación:

| Qué se verificó                                 | Cómo                                                   | Resultado                                                 |
| ----------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| El código compila y los tipos cuadran           | `npm run verify`                                       | limpio                                                    |
| La aplicación sirve páginas                     | petición HTTP real a la compilación de producción      | **HTTP 200**, título y contenido correctos                |
| Las 3 reglas de arquitectura actúan             | se escribieron ficheros que las violan **a propósito** | las 3 dieron error; el caso permitido de `import type` no |
| Añadir Prettier no apagó esas reglas            | se repitió la prueba anterior tras añadirlo            | siguen activas                                            |
| La resolución de claves acepta ambos nombres    | ejecución aislada con 5 combinaciones de variables     | 5/5 correctas, incluido el aviso de deprecación           |
| `@supabase/auth-helpers-nextjs` está obsoleto   | `npm view ... deprecated`                              | confirmado obsoleto; se usa `@supabase/ssr`               |
| La CI se ejecuta de verdad                      | consulta a la API de GitHub Actions                    | **3 ejecuciones, 3 en verde**                             |
| No hay secretos ni ficheros pesados versionados | inspección del índice de git                           | limpio                                                    |

### A · Actuar · lo que la verificación destapó

Esta es la parte útil del ciclo. **Doce desviaciones detectadas y corregidas:**

| #   | Desviación detectada                                                                   | Acción correctiva                                            |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | `create-next-app` rechaza mayúsculas en el nombre de carpeta                           | Andamiaje en carpeta temporal y copia del contenido          |
| 2   | `@supabase/auth-helpers-nextjs` está obsoleto                                          | Se usa `@supabase/ssr`, su sustituto oficial                 |
| 3   | `tsc` no encuentra `LayoutProps` (es un tipo generado)                                 | `typecheck` pasa a ser `next typegen && tsc --noEmit`        |
| 4   | git no versiona carpetas vacías: la estructura no llegaba al clon                      | `.gitkeep`, y después `README.md` que además documentan      |
| 5   | La plantilla de `.gitignore` excluía también `.env.example`                            | Excepción `!.env.example`                                    |
| 6   | Supabase retira `anon` y `service_role` a finales de 2026                              | La configuración acepta los dos juegos de nombres            |
| 7   | `src/app` no se puede mover dentro de `frontend/`                                      | Se documenta como zona mixta, con la cita de la doc de Next  |
| 8   | `constants.ts` mezclaba presentación y capa de datos                                   | Partido en `frontend/constants.ts` y `backend/config/sap.ts` |
| 9   | **Las reglas de ESLint solo actúan si alguien las ejecuta**                            | CI en GitHub Actions en cada push                            |
| 10  | `AGENTS.md` decía "cuatro reglas": son 5 restricciones y 3 reglas                      | Texto corregido                                              |
| 11  | `config.toml` apuntaba a `./seed.sql`, que no existe                                   | Ajustado a `./seed/*.sql`                                    |
| 12  | Una edición de `docs/README.md` falló en silencio (Prettier había realineado la tabla) | Corregido en un commit de seguimiento                        |

**Conclusión del ciclo:** Fase 1 cerrada. El código está completo y verificado.
Lo único abierto son las validaciones V1–V3 y las preguntas que dependen del
responsable del proyecto.

---

## Ciclos previstos · Fases 2 a 7

### FASE 2 · Autenticación y roles

|                   |                                                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P**             | Que cada persona entre con su identidad y que el sistema sepa qué puede hacer                                                                                                                      |
| **D**             | `src/proxy.ts` para refrescar la sesión · pantallas de acceso · tipo ENUM de roles en PostgreSQL · tabla de perfiles enlazada a `auth.users`                                                       |
| **C**             | Entrar y salir con dos usuarios de rol distinto · comprobar que la sesión sobrevive más de una hora · que un rol no ve lo que no le toca                                                           |
| **A**             | **Riesgo conocido:** sin el `proxy`, el síntoma será "me desloguea solo cada hora". Está documentado en `backend/lib/supabase/server.ts` y es la causa número uno de fallos raros de autenticación |
| **Bloqueada por** | los roles exactos y el método de acceso                                                                                                                                                            |

### FASE 3 · Base de datos core

|                   |                                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **P**             | Esquema SQL que reciba los volcados de SAP sin transformaciones acrobáticas                                                                                                                            |
| **D**             | Validar `ORIGEN_SAP` contra un volcado real · migraciones versionadas · **RLS en todas las tablas** · scripts de importación · generar los tipos                                                       |
| **C**             | Consulta 3.6 devuelve 0 filas · una importación completa se reproduce desde cero · `npm run typecheck` con los tipos generados                                                                         |
| **A**             | `ANALYZE` como último paso de cada importación: sin estadísticas frescas el planificador elige planes malos y las consultas se desploman sin que cambie el código. **Revisar D-001** (autoalojamiento) |
| **Bloqueada por** | V1, V3 y la validación de los códigos SAP                                                                                                                                                              |

### FASE 4 · Planes preventivos

|       |                                                                                             |
| ----- | ------------------------------------------------------------------------------------------- |
| **P** | Cronogramas y sus checks, importados de SAP                                                 |
| **D** | Modelo de plan → lista de tareas → operaciones · cálculo de próxima ejecución               |
| **C** | Un plan real de SAP genera las fechas correctas · los checks se corresponden con el volcado |
| **A** | Vigilar el crecimiento: un plan diario genera cientos de registros al año                   |

### FASE 5 · Asignación y ejecución

|       |                                                                                                                                                                                                                                                                   |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P** | Que el técnico reciba su trabajo y lo registre                                                                                                                                                                                                                    |
| **D** | Asignación · registro de ejecución · estados de la orden                                                                                                                                                                                                          |
| **C** | Prueba con usuarios reales de rol técnico                                                                                                                                                                                                                         |
| **A** | 🔴 **Aquí vence D-007.** En cuanto un técnico registre trabajo real, no tener copia de seguridad deja de ser aceptable: esos datos no se pueden reimportar de ninguna fuente. **Decidir antes de esta fase.** Si además no hay cobertura en planta, reabrir D-008 |

### FASE 6 · Recambios

|       |                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------ |
| **P** | Stock por códigos SAP                                                                            |
| **D** | Maestro de materiales · movimientos · consumo por orden                                          |
| **C** | Cuadre del stock tras una serie de movimientos                                                   |
| **A** | Es la tabla más grande: aplicar aquí lo aprendido sobre egress (columnas concretas y paginación) |

### FASE 7 · Reportes y notificaciones

|       |                                                                                                                        |
| ----- | ---------------------------------------------------------------------------------------------------------------------- |
| **P** | Comparativas diarias de actividad                                                                                      |
| **D** | Agregaciones · vistas · notificaciones                                                                                 |
| **C** | Contrastar un informe contra un recuento manual                                                                        |
| **A** | Los índices de esta fase se usan una vez al mes: **no borrarlos por marcar `idx_scan = 0`**. Ver `mantenimiento-bd.md` |

---

## Ciclo permanente · Operación

|       |                                                                                                                                                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P** | Que la base de datos no se sature ni pierda datos                                                                                                                       |
| **D** | Rutina de la sección 7 de `mantenimiento-bd.md`                                                                                                                         |
| **C** | Semanal: medidores del panel, sobre todo **egress** · Mensual: tamaño por tabla y filas muertas                                                                         |
| **A** | Egress al alza → revisar los `select` de los servicios · Filas muertas > 20 % sostenido → el autovacuum no da abasto · Sin backup y con datos reales → parar y resolver |

---

## Decisiones tomadas · resumen

| Ref   | Decisión                                             | Estado                        |
| ----- | ---------------------------------------------------- | ----------------------------- |
| D-001 | Supabase Cloud; autoalojamiento a revisar            | revisar en Fase 3             |
| D-002 | Plan Free durante el desarrollo                      | vigente                       |
| D-003 | Los dos nombres de clave de API                      | aplicada                      |
| D-004 | `sap-dumps/`: PM y recambios sí, datos de empresa no | vigente                       |
| D-005 | Estructura `frontend` / `backend`                    | aplicada                      |
| D-006 | CI, Prettier, Node fijado, CLI de Supabase           | aplicada                      |
| D-007 | Copias de seguridad aplazadas                        | 🔴 vence en Fase 5            |
| D-008 | Se descarta Firebase; se mantiene Supabase           | reabrible si no hay cobertura |

Detalle completo en `decisiones.md`.
