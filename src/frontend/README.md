# FASE 1 · FRONTEND · Todo lo que el usuario ve y toca

> **Creada en:** Fase 1 · **Se llena en:** Fase 2 · **Estado actual:** solo `constants.ts`

## En una frase

Si lo puedes ver en la pantalla o hacerle clic, está aquí.

## Qué hay dentro

| Carpeta / fichero    | Contiene                                             |
| -------------------- | ---------------------------------------------------- |
| `components/ui/`     | Piezas sueltas: botones, tablas, etiquetas de estado |
| `components/layout/` | El armazón: cabecera, menú lateral, pie              |
| `hooks/`             | Lógica de pantalla reutilizable                      |
| `constants.ts`       | Nombre del producto y direcciones de las pantallas   |

## La regla (nº 1 del proyecto)

> **Nada de esta carpeta puede hablar con la base de datos.**

Los componentes reciben los datos ya cocinados, por `props`, y solo se ocupan
de pintarlos.

Y no es una recomendación amable: **ESLint lo impide**. Si escribes aquí un
`import { createBrowserClient } from "@supabase/ssr"`, el proyecto no compila y
te dice por qué. Pruébalo si quieres verlo.

## Por qué

Un componente que además consulta la base de datos hace dos trabajos a la vez.
Consecuencias concretas en este proyecto:

1. **Cuando falle, no sabrás si el problema es de datos o de pintado.** Con las
   capas separadas, el fallo está en un lado o en el otro.
2. **No podrás reutilizarlo.** La tabla de órdenes tiene que servir en el
   listado, en la ficha del activo y en el informe diario (Fase 7), cada vez
   con datos distintos. Si lleva la consulta dentro, solo sirve para un sitio.
3. **Multiplicarás las consultas sin darte cuenta.** Diez filas pintadas por un
   componente que consulta = diez viajes a la base de datos. Con 30 usuarios a
   la vez, eso se nota.

## Ojo: `src/app/` no está aquí, y no es un descuido

Next.js **obliga** a que las rutas estén en `src/app/`. No se pueden mover.
Además, esos ficheros son mixtos: se ejecutan en el servidor y producen el HTML
que ve el navegador. Lee `src/app/README.md`.
