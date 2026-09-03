# `/src/services` — Capa de acceso a datos

## Qué va aquí

**Todas** las funciones que hablan con la base de datos. Sin excepción.

Cada fichero agrupa las operaciones de una entidad del dominio:

```
services/
├── activos.service.ts     # (Fase 3) equipos y ubicaciones técnicas
├── planes.service.ts      # (Fase 4) planes preventivos y sus checks
├── ordenes.service.ts     # (Fase 5) asignación y ejecución de tareas
└── materiales.service.ts  # (Fase 6) recambios y stock SAP
```

## Qué NO va aquí

- JSX o componentes de React.
- Clases de Tailwind, textos de interfaz o cualquier decisión visual.
- Redirecciones de navegación.

## La regla (LEY nº 1) y por qué existe

> Ningún componente de `/src/components` ni ninguna página de `/src/app`
> puede contener una llamada `supabase.from(...)`.

El flujo es siempre en un único sentido:

```
componente / página  →  servicio  →  cliente Supabase (/src/lib/supabase)  →  BD
```

Tres razones concretas, no dogmáticas:

1. **Cambiar la consulta en un solo sitio.** Si la consulta de "órdenes
   pendientes de un técnico" está incrustada en tres componentes, el día que
   añadamos el filtro por planta hay que acordarse de los tres. Si está en
   `ordenes.service.ts`, hay un único punto de cambio.

2. **Poder probar la lógica sin pintar nada.** Una función de servicio es
   entrada → salida: se puede ejecutar en un test sin montar React.

3. **Controlar dónde se ejecuta cada consulta.** El cliente de servidor y el
   de navegador no son intercambiables (ver `/src/lib/supabase`). Teniendo las
   consultas concentradas se ve de un vistazo cuáles corren en el servidor
   —y por tanto no exponen datos al navegador— y cuáles no.

## Convención de firma

Un servicio recibe el cliente Supabase como parámetro en lugar de crearlo por
su cuenta. Así la misma función sirve tanto en servidor como en navegador, y
quien la llama decide el contexto de ejecución:

```ts
export async function obtenerOrdenesPendientes(
  supabase: SupabaseClient<Database>,
  tecnicoId: string,
) { /* ... */ }
```

La carpeta está vacía en la Fase 1: todavía no hay tablas que consultar.
Se poblará a partir de la Fase 3.
