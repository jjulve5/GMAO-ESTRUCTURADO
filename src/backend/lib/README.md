# FASE 1 · BACKEND · La fontanería: cómo se conecta con Supabase

> **Creada en:** Fase 1 · **Se llena en:** Fase 1 · **Estado actual:** en uso

Contiene `supabase/`, con los dos clientes de conexión:

| Fichero | Dónde se ejecuta |
|---|---|
| `client.ts` | En el **navegador** del usuario |
| `server.ts` | En el **servidor**, uno nuevo por cada petición |

Son dos porque el navegador y el servidor acceden a las cookies de sesión de
formas distintas.

**Aquí nunca habrá un `.from("tabla")`.** Esto solo abre la tubería; las
consultas viven en `../services/`. ESLint impide que cualquier otro fichero del
proyecto importe `@supabase/*` directamente.
