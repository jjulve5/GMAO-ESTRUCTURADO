# FASE 2 · FRONTEND · Piezas de pantalla reutilizables

> **Creada en:** Fase 1 · **Se llena en:** Fase 2 · **Estado actual:** vacía

## Qué va aquí

Componentes de React que **solo pintan**: reciben datos por `props` y devuelven
lo que se ve. No saben de dónde vienen esos datos ni cómo se guardan.

| Subcarpeta | Contiene | Cuántos habrá |
|---|---|---|
| `ui/` | Piezas genéricas: `Boton`, `Tabla`, `Badge`, `Modal` | muchos |
| `layout/` | El armazón: `Cabecera`, `BarraLateral`, `Pie` | uno de cada |

## Qué NO va aquí

- `supabase.from(...)` — eso vive en `src/backend/services/`.
- Lectura de `process.env` — eso vive en `src/backend/config/env.ts`.

Ambas cosas las bloquea ESLint: no compilan.

## Cómo distinguir `ui/` de `layout/`

Pregúntate: *¿cuántos de estos habrá en la aplicación terminada?*

- Muchos, y en pantallas distintas → `ui/`
- Uno solo, y siempre visible → `layout/`
