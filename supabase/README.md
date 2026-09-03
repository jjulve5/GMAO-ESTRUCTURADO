# `/supabase` — Base de datos versionada

Todo lo que define la base de datos vive aquí, en ficheros de texto dentro del
repositorio. La base de datos **no** se toca a mano desde el panel web de
Supabase: si se hace, el repositorio y la realidad se separan y nadie sabe cuál
es el esquema bueno.

```
supabase/
├── migrations/   # ficheros .sql numerados: el esquema, paso a paso  (Fase 3)
├── seed/         # datos mínimos imprescindibles (catálogos, roles)  (Fase 3)
└── sap-dumps/    # volcados REALES exportados de SAP PM              (Fase 3)
```

## `migrations/`

Cada cambio de esquema es un fichero `.sql` nuevo con marca de tiempo, nunca
una edición de uno anterior. Aplicar las migraciones en orden desde cero debe
reproducir exactamente la base de datos actual. Es lo que permite levantar un
entorno de pruebas idéntico al de producción.

## `seed/`

Datos que la aplicación necesita para arrancar y que no vienen de SAP: por
ejemplo el catálogo de estados de una orden. Son pocos y estables.

**No es mock data** (LEY nº 3): aquí no habrá activos ni planes inventados.

## `sap-dumps/`

Los ficheros exportados de SAP PM (maestro de materiales, planes preventivos y
sus checks). Se guardan en crudo, tal y como salen de SAP, por dos motivos:

1. Sirven de referencia para diseñar el esquema SQL de la Fase 3: las columnas
   de nuestras tablas se ajustarán a lo que realmente trae el volcado.
2. Permiten repetir una importación desde cero si se detecta un error de
   transformación, sin depender de que alguien vuelva a exportar de SAP.

> **Atención antes de subir nada aquí:** un volcado real puede contener datos
> internos de la empresa. Antes de hacer commit de un fichero en esta carpeta,
> hay que decidir explícitamente si puede vivir en el repositorio o si debe
> quedarse fuera y añadirse a `.gitignore`. Lo revisaremos juntos al empezar
> la Fase 3.

Las tres carpetas están vacías en la Fase 1.
