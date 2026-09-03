# `/src/components` — Capa de presentación

## Qué va aquí

Componentes de React que **solo pintan**. Reciben datos por `props` y devuelven
JSX. No saben de dónde vienen esos datos ni cómo se guardan.

```
components/
├── ui/      # piezas genéricas y reutilizables: Boton, Tabla, Badge, Modal...
└── layout/  # armazón de la aplicación: Cabecera, BarraLateral, Pie...
```

## Qué NO va aquí

- `supabase.from(...)` — eso vive en `/src/services` (LEY nº 1).
- Lectura de `process.env` — eso vive en `/src/lib/env.ts`.

## Por qué esta separación

Un componente que además consulta la base de datos hace dos trabajos a la vez.
Cuando falla, no se sabe si el problema es de datos o de pintado, y no se puede
reutilizar en otra pantalla que necesite los mismos datos filtrados de otra
forma. Separándolo:

- La tabla de órdenes se puede reutilizar en el listado, en el informe diario
  (Fase 7) y en la ficha del activo, con datos distintos cada vez.
- Se puede rediseñar la interfaz sin tocar una sola consulta SQL.

Ambas subcarpetas están vacías en la Fase 1. La estructura se crea ahora para
que no haya dudas sobre dónde colocar cada cosa cuando empiece la Fase 2.
