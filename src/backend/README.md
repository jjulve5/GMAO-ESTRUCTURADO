# FASE 1 · BACKEND · Todo lo que toca datos; el usuario nunca lo ve

> **Creada en:** Fase 1 · **Se llena en:** Fases 1 a 6 · **Estado actual:** configuración y conexión listas

## En una frase

Si tiene que ver con credenciales, con la base de datos o con SAP, está aquí.

## Qué hay dentro

| Carpeta         | Contiene                                                             | Fase |
| --------------- | -------------------------------------------------------------------- | ---- |
| `config/`       | Variables de entorno (`env.ts`) y origen de los datos SAP (`sap.ts`) | 1    |
| `lib/supabase/` | Los dos clientes de conexión: navegador y servidor                   | 1    |
| `services/`     | **Las consultas.** Único sitio con `supabase.from(...)`              | 3+   |
| `types/`        | La forma de los datos, generada desde la base de datos               | 3    |

## El recorrido de un dato, de arriba abajo

```
  src/app/page.tsx            (pantalla)
        │  pide los datos
        ▼
  backend/services/           ← AQUÍ y solo aquí: supabase.from("ordenes")
        │  usa la conexión
        ▼
  backend/lib/supabase/       ← abre la tubería
        │  con las credenciales de
        ▼
  backend/config/env.ts       ← lee .env.local
        │
        ▼
  Supabase / PostgreSQL
```

Cada capa solo conoce a la de abajo. Esa es toda la arquitectura.

## Tres reglas que ESLint hace cumplir por su cuenta

No son comentarios de buena voluntad: si las incumples, `npm run lint` falla.

1. **`process.env` solo se lee en `config/env.ts`.** En cualquier otro sitio, error.
2. **`@supabase/*` solo se importa en `lib/supabase/`.** Nadie más puede abrir
   una conexión por su cuenta.
3. **`src/frontend/` no puede importar nada de `src/backend/`**, salvo _tipos_
   (con `import type`). Los tipos desaparecen al compilar, así que no crean
   ninguna dependencia real en tiempo de ejecución.

## ¿"Backend" no debería ser un servidor aparte?

No en este proyecto, y es deliberado. Next.js ejecuta este código en el
servidor sin necesidad de montar un segundo servicio. Separarlo de verdad
supondría dos despliegues, CORS y autenticación duplicada: mucha complejidad
para 30 usuarios. Esta carpeta te da la **claridad mental** de la separación
sin pagar su coste operativo. Ver la decisión D-005 en `docs/decisiones.md`.
