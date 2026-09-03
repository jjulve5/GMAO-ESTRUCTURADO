# FASE 1 · MIXTO (Frontend + Backend) · Las pantallas y sus direcciones web

> **Creada en:** Fase 1 · **Se llena en:** Fase 2 · **Estado actual:** una pantalla provisional

## Por qué esta carpeta no es "frontend" ni "backend"

Es la única del proyecto que es **las dos cosas a la vez**, y conviene
entenderlo bien porque es el corazón de cómo funciona Next.js:

```tsx
// src/app/page.tsx
export default function PaginaInicio() {
  return <h1>Hola</h1>;
}
```

Este fichero **se ejecuta en el servidor**. Allí se convierte en HTML, y lo que
llega al navegador es texto ya montado. Es un *Server Component*: puede leer la
base de datos, pero se ve en pantalla. Frontend y backend en el mismo fichero.

Solo cuando un componente necesita reaccionar a clics o guardar estado se marca
con `"use client"` arriba del todo, y entonces sí viaja al navegador.

## Por qué está aquí y no dentro de `src/frontend/`

Porque Next.js **no lo permite**. Cita literal de su documentación, incluida en
`node_modules/next/dist/docs/`:

> *"move the `app` Router folder to `src/app`"* — y *"`src/app` will be ignored
> if `app` is present in the root directory"*

Las rutas se leen de `app/` o de `src/app/`. En ningún otro sitio. Si moviéramos
esta carpeta, la aplicación dejaría de tener páginas.

## Qué hay dentro

| Fichero | Qué es |
|---|---|
| `layout.tsx` | El envoltorio común a todas las páginas: `<html>`, fuentes, título |
| `page.tsx` | La pantalla de la dirección `/`. Provisional; se sustituye en la Fase 2 |
| `globals.css` | Estilos base y carga de Tailwind |
| `favicon.ico` | El iconito de la pestaña del navegador |

## Cómo se crean pantallas nuevas

El nombre de la carpeta **es** la dirección web:

```
src/app/ordenes/page.tsx          ->  /ordenes
src/app/ordenes/[id]/page.tsx     ->  /ordenes/4711
```

## La regla aquí

Una página **puede** pedir datos, pero siempre a través de un servicio de
`src/backend/services/`. Nunca escribiendo `supabase.from(...)` directamente.
ESLint lo impide.
