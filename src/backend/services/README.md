# FASE 3 · BACKEND · Las consultas a la base de datos

> **Creada en:** Fase 1 · **Se llena en:** Fase 3 · **Estado actual:** vacía

## En una frase

El **único** sitio de todo el proyecto donde se puede escribir
`supabase.from("loquesea")`.

## Qué habrá aquí

Un fichero por entidad del mantenimiento:

```
services/
├── activos.service.ts     # (Fase 3) equipos y ubicaciones técnicas
├── planes.service.ts      # (Fase 4) planes preventivos y sus checks
├── ordenes.service.ts     # (Fase 5) asignación y ejecución de tareas
└── materiales.service.ts  # (Fase 6) recambios y stock SAP
```

## Qué NO va aquí

- JSX ni componentes de React.
- Clases de Tailwind, textos de interfaz, colores: ninguna decisión visual.
- Redirecciones de navegación.

Un servicio no sabe si sus datos acabarán en una tabla, en un PDF o en un
correo. Esa ignorancia es justo lo que lo hace reutilizable.

## Convención de firma

El servicio **recibe** el cliente de Supabase como parámetro en vez de crearlo
él mismo:

```ts
export async function obtenerOrdenesPendientes(
  supabase: SupabaseClient<Database>,
  tecnicoId: string,
) {
  /* ... */
}
```

**Por qué:** así la misma función sirve tanto ejecutada en el servidor como en
el navegador, y quien la llama decide en qué contexto corre. Si el servicio
creara su propio cliente, quedaría atado a uno de los dos entornos para
siempre.

## Por qué existe esta carpeta

1. **Un único punto de cambio.** Si la consulta de "órdenes pendientes de un
   técnico" está repartida por tres componentes, el día que añadamos el filtro
   por planta hay que acordarse de los tres. Aquí es una función.
2. **Se puede probar sin pintar nada.** Un servicio es entrada → salida: se
   ejecuta en un test sin montar React.
3. **Se ve de un vistazo qué toca la base de datos.** Auditar la seguridad de
   la aplicación es leer esta carpeta, no rastrear 200 ficheros.
