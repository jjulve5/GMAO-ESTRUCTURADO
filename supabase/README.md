# FASE 3 · BACKEND · La base de datos, escrita en ficheros de texto

> **Creada en:** Fase 1 · **Se llena en:** Fase 3 · **Estado actual:** vacía

## Regla de oro

La base de datos **no se toca a mano desde el panel web de Supabase**.

Todo cambio se escribe aquí, en un fichero, y se aplica desde aquí. Si alguien
añade una columna haciendo clic en el panel, el repositorio y la realidad se
separan y a partir de ese momento nadie sabe cuál es el esquema bueno.

## Qué hay dentro

| Carpeta | Contiene |
|---|---|
| `migrations/` | Ficheros `.sql` numerados: el esquema, paso a paso |
| `seed/` | Datos mínimos imprescindibles (catálogos, estados) |
| `sap-dumps/` | Los volcados **reales** exportados de SAP PM |

Cada una tiene su propia ficha explicándose.

## Por qué esto no está dentro de `src/backend/`

Porque no es código que se ejecute con la aplicación: es la **definición** de la
base de datos. La herramienta de Supabase (`npx supabase`) espera encontrarla en
una carpeta `supabase/` en la raíz del proyecto.
