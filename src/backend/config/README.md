# FASE 1 · BACKEND · Los ajustes con los que arranca la aplicación

> **Creada en:** Fase 1 · **Se llena en:** Fase 1 · **Estado actual:** en uso

| Fichero  | Qué contiene                                                                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `env.ts` | Lectura y validación de las variables de entorno (`.env.local`). **Único sitio del proyecto donde se puede escribir `process.env`**, y lo vigila ESLint. |
| `sap.ts` | De qué transacción y tabla de SAP PM procede cada bloque de datos.                                                                                       |

Aquí no hay lógica de negocio: solo "con qué credenciales y contra qué sistemas
trabajamos".
