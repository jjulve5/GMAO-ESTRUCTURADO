# FASE 1 · BACKEND · Salud y mantenimiento de la base de datos

> Cómo saber si la base de datos va bien, qué la satura de verdad y qué hacer
> para mantenerla. Las consultas se pegan tal cual en el **SQL Editor** del
> panel de Supabase.

---

## 1. El malentendido más común: qué ocupan realmente los 500 MB

El límite **no** mide "tus datos". Mide el disco entero de PostgreSQL:

| Ocupa espacio               | Qué es                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| Filas de las tablas         | lo que la gente llama "los datos"                                                               |
| **Índices**                 | en tablas anchas como el maestro de materiales de SAP, pueden pesar **más que la propia tabla** |
| TOAST                       | valores de texto largos que Postgres guarda aparte                                              |
| **Filas muertas (bloat)**   | ver sección 4: cada `UPDATE` deja basura hasta que pasa el autovacuum                           |
| WAL                         | el registro de transacciones                                                                    |
| Esquemas `auth` y `storage` | usuarios, sesiones, ficheros: **también cuentan**                                               |

Es perfectamente normal que 150 MB de datos ocupen 400 MB de disco.

---

## 2. Los cuatro medidores del panel

Panel de Supabase → **Reports** / **Settings → Usage**:

| Medidor                        | Límite en Free | ¿Nos preocupa?                   |
| ------------------------------ | -------------- | -------------------------------- |
| Database size                  | 500 MB         | sí, con los volcados SAP         |
| **Egress (tráfico de salida)** | **5 GB/mes**   | **el primero que reventaremos**  |
| File storage                   | 1 GB           | solo si guardamos fotos/adjuntos |
| Usuarios activos mensuales     | 50.000         | no: somos 30                     |

> Cifras de fuentes secundarias; la web oficial estaba bloqueada al redactar
> esto. Verifícalas en `supabase.com/pricing`.

### Por qué el egress es el peligro real

Un `select("*")` sobre el maestro de materiales devuelve TODAS las columnas de
TODAS las filas. Treinta técnicos abriendo esa pantalla varias veces al día son
gigabytes al mes de tráfico por una pantalla que muestra veinte filas.

**Mitigación, que aplicaremos al diseñar los servicios (Fases 3 y 6):**
pedir solo las columnas necesarias y paginar.

```ts
// MAL: se trae el maestro entero
supabase.from("materiales").select("*");

// BIEN: solo lo que se pinta, y de veinte en veinte
supabase
  .from("materiales")
  .select("codigo_sap, descripcion, stock")
  .range(0, 19);
```

---

## 3. Consultas de diagnóstico

### 3.1 ¿Cuánto ocupa la base de datos?

```sql
select pg_size_pretty(pg_database_size(current_database())) as tamano_total;
```

### 3.2 ¿Qué tablas ocupan ese espacio, y cuánto son índices?

Si la columna `indices` supera a `datos`, tienes índices de más.

```sql
select
  n.nspname                                      as esquema,
  c.relname                                      as tabla,
  pg_size_pretty(pg_total_relation_size(c.oid))  as total,
  pg_size_pretty(pg_table_size(c.oid))           as datos,
  pg_size_pretty(pg_indexes_size(c.oid))         as indices
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname not in ('pg_catalog', 'information_schema')
order by pg_total_relation_size(c.oid) desc
limit 20;
```

### 3.3 Filas muertas y autovacuum

```sql
select
  relname                                  as tabla,
  n_live_tup                               as filas_vivas,
  n_dead_tup                               as filas_muertas,
  case when n_live_tup > 0
       then round(100.0 * n_dead_tup / n_live_tup, 1)
  end                                      as pct_muertas,
  last_autovacuum,
  last_autoanalyze
from pg_stat_user_tables
order by n_dead_tup desc
limit 20;
```

**Cómo leerlo:** por encima del **20 %** de filas muertas de forma sostenida, o
un `last_autovacuum` en blanco o de hace semanas en una tabla que cambia mucho,
significa que el autovacuum no da abasto.

### 3.4 Índices que nadie usa

Ocupan disco **y frenan cada escritura**, porque hay que actualizarlos.

```sql
select
  s.relname                                       as tabla,
  s.indexrelname                                  as indice,
  pg_size_pretty(pg_relation_size(s.indexrelid))  as tamano,
  s.idx_scan                                      as veces_usado
from pg_stat_user_indexes s
join pg_index i on i.indexrelid = s.indexrelid
where s.idx_scan = 0
  and not i.indisunique     -- no tocar los que respaldan una restricción
  and not i.indisprimary
order by pg_relation_size(s.indexrelid) desc;
```

> Cuidado: `idx_scan = 0` significa "no usado **desde el último reinicio de
> estadísticas**". Un índice que solo se usa en el cierre de mes puede aparecer
> aquí. Mira el dato tras varias semanas antes de borrar nada.

### 3.5 Las consultas más caras

```sql
select
  calls                                   as llamadas,
  round(total_exec_time::numeric, 0)      as ms_total,
  round(mean_exec_time::numeric, 1)       as ms_media,
  rows                                    as filas_devueltas,
  left(query, 120)                        as consulta
from pg_stat_statements
order by total_exec_time desc
limit 15;
```

Requiere la extensión `pg_stat_statements` activada en
**Database → Extensions**. Si da error, es que no lo está.

Ordena por `ms_total`, no por `ms_media`: una consulta de 5 ms lanzada 100.000
veces hace más daño que una de 2 segundos lanzada una vez al día.

### 3.6 Tablas sin RLS · comprobación de seguridad

Cualquier fila que salga aquí es una tabla **abierta a cualquiera que tenga la
clave pública**, que va incrustada en el JavaScript del navegador.

```sql
select n.nspname as esquema, c.relname as tabla
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname = 'public'
  and not c.relrowsecurity;
```

Debe devolver **cero filas** a partir de la Fase 3.

### 3.7 Versión del servidor · haz esto ahora

```sql
show server_version;
```

Compara el número mayor con `major_version` de `supabase/config.toml` (hoy
está en `17`). Si no coinciden, `supabase db diff` y el desarrollo en local
darán resultados que no se corresponden con producción. Es un fallo silencioso
y desconcertante: mejor detectarlo hoy que en la Fase 3.

---

## 4. Mantenimiento rutinario

### Autovacuum: no lo desactives

PostgreSQL, al modificar una fila, no la sobrescribe: marca la vieja como
muerta y escribe una nueva. El autovacuum recoge esa basura y va solo. **No hay
que hacer nada**, solo vigilar la consulta 3.3.

Matiz importante: el autovacuum deja el espacio libre **para reutilizarlo dentro
de la tabla**, pero no lo devuelve al sistema operativo. Por eso una tabla que
cambia mucho puede seguir "ocupando" mucho aunque tenga pocas filas.

### `VACUUM FULL`: solo con la aplicación parada

Es lo único que devuelve el disco al sistema, pero **bloquea la tabla entera**
mientras se ejecuta: nadie puede leer ni escribir en ella. Con 30 técnicos
trabajando, eso es la aplicación caída.

```sql
vacuum full analyze public.nombre_de_la_tabla;   -- fuera del horario de trabajo
```

### `ANALYZE` después de cada importación de SAP · esto sí nos afecta

Tras cargar un volcado grande, las estadísticas del planificador se quedan
obsoletas y PostgreSQL empieza a elegir planes malos: consultas que iban en
milisegundos pasan a tardar segundos, sin que nada haya cambiado en el código.

```sql
analyze public.materiales;
```

**Lo incluiremos como último paso de los scripts de importación en la Fase 3.**

### Crear índices sin parar la aplicación

```sql
create index concurrently idx_ordenes_tecnico on public.ordenes (tecnico_id);
```

Sin `concurrently`, crear un índice bloquea las escrituras de la tabla.

---

## 5. Backups: el punto débil del plan Free

**El plan Free no incluye backups descargables ni recuperación a un punto en el
tiempo.** Si alguien ejecuta un `delete` sin `where`, no hay marcha atrás.

Lo que nos protege hoy:

| Qué                                | Nos salva de                           | No nos salva de                    |
| ---------------------------------- | -------------------------------------- | ---------------------------------- |
| `supabase/migrations/` versionadas | perder la **estructura** de las tablas | perder los **datos**               |
| `supabase/sap-dumps/`              | perder lo importado de SAP             | perder lo que teclean los técnicos |

Lo que falta: un volcado periódico de los datos.

```bash
# Copia completa. Guárdala FUERA del repositorio: contiene datos reales.
npx supabase db dump --db-url "$DATABASE_URL" -f copia-$(date +%F).sql
```

> **Decisión pendiente:** antes de que el primer técnico meta datos reales hay
> que decidir quién ejecuta esta copia, con qué frecuencia y dónde se guarda.
> O pasar a un plan con backups automáticos. Un GMAO sin copia de seguridad no
> es una herramienta de producción.

---

## 6. Lo que NO es un problema en esta arquitectura

Muchos tutoriales insisten en agotar el número de conexiones a PostgreSQL y en
usar el _pooler_ del puerto 6543. **Con nuestro diseño, eso no aplica.**

Usamos `supabase-js`, que habla con **PostgREST** por HTTP. Es PostgREST quien
mantiene su propio grupo de conexiones a la base de datos. Treinta técnicos
usando la aplicación **no** abren treinta conexiones a PostgreSQL.

Ese consejo sería válido si conectáramos por TCP directo con Prisma, Drizzle o
similar. Las únicas conexiones directas que tendrás son las tuyas desde el CLI
al aplicar migraciones.

---

## 7. Rutina recomendada

| Cuándo                       | Qué                                        |
| ---------------------------- | ------------------------------------------ |
| **Hoy**                      | Consulta 3.7 (versión) y 3.6 (RLS)         |
| Cada semana                  | Medidores del panel: sobre todo **egress** |
| Cada mes                     | Consultas 3.2 y 3.3                        |
| Tras cada importación de SAP | `analyze` de las tablas cargadas           |
| Antes de producción          | Resolver el punto 5 (backups)              |
