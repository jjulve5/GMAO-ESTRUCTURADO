# FASE 2 · MIXTO (Frontend + Backend) · Las pantallas que exigen sesión

> **Creada en:** Fase 2 · **Se llena en:** Fases 2 a 7 · **Estado actual:** portada y usuarios

## Qué son los paréntesis del nombre

`(privado)` es un **grupo de rutas**. Los paréntesis hacen que el nombre de la
carpeta **no aparezca en la dirección web**: `(privado)/page.tsx` se sirve en
`/`, no en `/privado`.

Sirve para agrupar pantallas que comparten envoltorio sin ensuciar las URLs.

## Qué hay dentro

| Ruta        | Fichero             | Quién entra           |
| ----------- | ------------------- | --------------------- |
| `/`         | `page.tsx`          | cualquiera con sesión |
| `/usuarios` | `usuarios/page.tsx` | solo supervisores     |

`layout.tsx` envuelve a todas: carga el perfil, comprueba que está activo y
pinta la cabecera.

## Las tres barreras de acceso, y qué hace cada una

1. **`src/proxy.ts`** — comprueba que hay sesión válida. Se ejecuta antes de
   renderizar nada.
2. **`layout.tsx`** — comprueba que el perfil existe y está **activo**. No es
   redundante con la anterior: dar de baja a alguien **no invalida su sesión**,
   así que un técnico despedido esta mañana sigue teniendo una cookie válida en
   su tablet y el proxy le dejaría pasar.
3. **Las políticas RLS de PostgreSQL** — la única que es seguridad de verdad.
   Aunque las dos anteriores fallaran, la base de datos seguiría devolviendo
   solo lo que a esa persona le corresponde.

Las dos primeras son experiencia de usuario. La tercera es la que impide una
fuga de datos.

## Los ficheros `acciones.ts`

Llevan `"use server"` arriba: son **Server Actions**, funciones que se escriben
aquí pero se ejecutan en el servidor aunque las dispare un formulario del
navegador.

Son el pegamento entre la pantalla y los datos: crean el cliente, llaman al
servicio y redirigen. Están en `app/` y no en `services/` porque un servicio no
sabe nada de rutas ni de redirecciones.
