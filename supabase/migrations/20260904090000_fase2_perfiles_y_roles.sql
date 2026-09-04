-- =============================================================================
--  FASE 2 · Perfiles de usuario y roles
-- =============================================================================
--
--  QUÉ HACE ESTA MIGRACIÓN
--  -----------------------
--  Crea la base de la autenticación del GMAO:
--    1. El tipo ENUM con los cuatro roles.
--    2. La tabla `perfiles`, que extiende a cada usuario de Supabase Auth.
--    3. Dos funciones auxiliares para consultar el rol SIN provocar recursión.
--    4. Las políticas RLS que deciden quién ve y modifica qué.
--    5. Un disparador que crea el perfil automáticamente al dar de alta a
--       alguien, y otro que mantiene la marca de tiempo de modificación.
--
--  POR QUÉ UNA TABLA APARTE Y NO GUARDAR EL ROL EN `auth.users`
--  -------------------------------------------------------------
--  El esquema `auth` pertenece a Supabase: sus tablas las gestiona el propio
--  servicio y no debemos tocarlas. Además, `auth.users` guarda credenciales y
--  no queremos que una consulta cualquiera de la aplicación se pasee por ahí.
--  El patrón estándar es una tabla propia en `public` enlazada por la clave
--  primaria, que es lo que hacemos aquí.
--
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. LOS ROLES
-- -----------------------------------------------------------------------------
-- Se usa un ENUM y no un texto libre a propósito: PostgreSQL rechazará
-- cualquier valor que no esté en esta lista. Un error de escritura como
-- 'Tecnico' o 'tecnica' falla al insertar, en vez de crear en silencio un rol
-- fantasma que no coincide con ninguna política y deja a esa persona sin ver
-- nada, sin ningún mensaje de error que lo explique.
--
-- Añadir un rol más adelante es posible (ALTER TYPE ... ADD VALUE) pero
-- ELIMINAR uno no lo es sin recrear el tipo. Por eso la lista se cierra ahora.
create type public.rol_usuario as enum (
  'supervisor',  -- manda: da de alta usuarios, asigna roles, supervisa todo
  'tecnico',     -- ejecuta las órdenes de trabajo que tiene asignadas
  'operario',    -- solo crea solicitudes de trabajo; no ejecuta ni ve órdenes
  'recambista'   -- gestiona el almacén de recambios y el stock
);

comment on type public.rol_usuario is
  'Roles del GMAO. El rol determina qué puede ver y hacer cada persona, y es la base de todas las políticas RLS.';


-- -----------------------------------------------------------------------------
-- 2. LA TABLA DE PERFILES
-- -----------------------------------------------------------------------------
-- `id` NO es un identificador propio: es exactamente el mismo que el del
-- usuario en `auth.users`. Compartir la clave primaria evita tener que
-- mantener dos identificadores en paralelo y hace imposible que un perfil
-- quede huérfano o duplicado.
--
-- `on delete cascade`: si alguna vez se borra el usuario de autenticación, su
-- perfil se va con él. No queremos perfiles apuntando a nadie.
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- Nombre para mostrar en pantalla. El CHECK impide guardar espacios en
  -- blanco, que pasarían el `not null` y dejarían filas visualmente vacías.
  nombre_completo text not null check (length(trim(nombre_completo)) > 0),

  -- Por defecto 'operario', que es el rol con menos permisos. Ver el
  -- disparador del apartado 5: es una decisión de seguridad, no comodidad.
  rol public.rol_usuario not null default 'operario',

  -- Baja lógica. NO se borran perfiles (ver apartado 4): si un técnico deja la
  -- empresa, se desactiva. Así las órdenes que ejecutó siguen teniendo un
  -- responsable con nombre, que es justo lo que un GMAO necesita poder
  -- demostrar meses después.
  activo boolean not null default true,

  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

comment on table public.perfiles is
  'Datos de aplicación de cada usuario. Comparte la clave primaria con auth.users.';

-- Las pantallas de administración filtran y agrupan por rol.
create index perfiles_rol_idx on public.perfiles (rol);


-- -----------------------------------------------------------------------------
-- 3. FUNCIONES DE ROL  ·  aquí está la trampa más importante de todo el fichero
-- -----------------------------------------------------------------------------
--
--  EL PROBLEMA DE LA RECURSIÓN INFINITA
--  ------------------------------------
--  Queremos una política del tipo "un supervisor puede ver todos los perfiles".
--  Lo natural sería escribirla así:
--
--      using ( (select rol from public.perfiles where id = auth.uid()) = 'supervisor' )
--
--  Y eso NO funciona. Para saber si puedes leer la tabla `perfiles`, PostgreSQL
--  tiene que leer la tabla `perfiles`; y para leerla, vuelve a evaluar la
--  política; y así indefinidamente. PostgreSQL lo detecta y aborta con el error
--  42P17 "infinite recursion detected in policy for relation perfiles".
--
--  Es el fallo número uno de quien empieza con RLS en Supabase, y el síntoma es
--  desconcertante: todo compila, y en cuanto alguien entra, la aplicación
--  devuelve un error de base de datos que no menciona ningún error de código.
--
--  LA SOLUCIÓN: `security definer`
--  -------------------------------
--  Una función marcada `security definer` se ejecuta con los permisos de quien
--  la creó, no de quien la llama, y por tanto NO aplica RLS al leer la tabla.
--  Rompe el bucle. Es la vía recomendada por Supabase para este caso.
--
--  `set search_path = ''` NO es cosmético
--  --------------------------------------
--  Una función `security definer` corre con permisos elevados. Si no se fija el
--  search_path, alguien podría crear una tabla `perfiles` en un esquema propio,
--  colocarlo delante en su search_path y hacer que la función privilegiada lea
--  SU tabla en lugar de la nuestra. Vaciando el search_path obligamos a
--  escribir todos los nombres completos (`public.perfiles`) y ese ataque deja
--  de ser posible.
--
--  `stable` permite a PostgreSQL evaluar la función una sola vez por consulta
--  en lugar de una vez por fila, que en una tabla grande es la diferencia entre
--  una consulta instantánea y una consulta inutilizable.

create or replace function public.rol_actual()
returns public.rol_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select p.rol
  from public.perfiles p
  where p.id = (select auth.uid())
    and p.activo;
$$;

comment on function public.rol_actual() is
  'Rol del usuario de la petición actual, o NULL si no ha iniciado sesión o está desactivado. security definer para no provocar recursión en las políticas RLS.';

create or replace function public.es_supervisor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.perfiles p
    where p.id = (select auth.uid())
      and p.rol = 'supervisor'::public.rol_usuario
      and p.activo
  );
$$;

comment on function public.es_supervisor() is
  'Cierto si quien hace la petición es un supervisor activo. Se usa en las políticas RLS.';

-- Estas funciones consultan datos de perfiles con permisos elevados, así que
-- solo deben poder llamarlas usuarios autenticados. `anon` (visitante sin
-- sesión) no tiene ningún motivo para invocarlas.
revoke execute on function public.rol_actual() from public;
revoke execute on function public.es_supervisor() from public;
grant execute on function public.rol_actual() to authenticated;
grant execute on function public.es_supervisor() to authenticated;


-- -----------------------------------------------------------------------------
-- 4. POLÍTICAS RLS
-- -----------------------------------------------------------------------------
-- Sin RLS activado, la clave pública (que viaja incrustada en el JavaScript del
-- navegador) permitiría a cualquiera leer la tabla entera. Con RLS activado y
-- SIN políticas, no se ve nada. Las políticas van abriendo el acceso caso a
-- caso, que es el orden correcto: se parte de cerrado.
alter table public.perfiles enable row level security;

-- --- LECTURA -----------------------------------------------------------------

-- Todo el mundo puede ver su propia ficha: la cabecera necesita el nombre y el
-- rol de quien ha entrado.
create policy "lectura: el perfil propio"
  on public.perfiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- El supervisor ve todas las fichas: es quien gestiona las altas.
create policy "lectura: un supervisor ve todos los perfiles"
  on public.perfiles
  for select
  to authenticated
  using (public.es_supervisor());

-- --- ESCRITURA ---------------------------------------------------------------

-- Cada persona puede corregir su propio nombre, pero NO su rol ni su estado.
--
-- El `with check` es la parte importante y conviene leerla despacio:
--   - `rol = public.rol_actual()` obliga a que el rol de la fila resultante sea
--     el mismo que ya tenía. Si un operario intenta ascenderse a supervisor, la
--     comprobación falla y la actualización se rechaza.
--   - `activo` obliga a que siga activo: nadie se da de baja a sí mismo por
--     accidente.
create policy "escritura: cada uno corrige su nombre, no su rol"
  on public.perfiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and rol = public.rol_actual()
    and activo
  );

-- El supervisor da de alta perfiles. En la práctica el perfil lo crea el
-- disparador del apartado 5, pero la política existe para que el supervisor
-- pueda insertar manualmente si hiciera falta.
create policy "escritura: un supervisor da de alta perfiles"
  on public.perfiles
  for insert
  to authenticated
  with check (public.es_supervisor());

-- El supervisor sí puede cambiar el rol y el estado de cualquiera.
create policy "escritura: un supervisor modifica cualquier perfil"
  on public.perfiles
  for update
  to authenticated
  using (public.es_supervisor())
  with check (public.es_supervisor());

-- --- BORRADO -----------------------------------------------------------------
--
-- NO se define ninguna política de DELETE, y es deliberado: sin política, RLS
-- impide borrar a cualquiera. Un GMAO tiene que poder responder dentro de dos
-- años a "¿quién ejecutó esta orden?". Si el perfil se borra, esa respuesta se
-- pierde para siempre. Las bajas se hacen con `activo = false`.


-- -----------------------------------------------------------------------------
-- 5. DISPARADORES
-- -----------------------------------------------------------------------------

-- --- Crear el perfil automáticamente al dar de alta un usuario ---------------
--
-- DECISIÓN DE SEGURIDAD: el rol se fija SIEMPRE a 'operario', y nunca se lee de
-- los metadatos del usuario.
--
-- Los metadatos (`raw_user_meta_data`) son datos que el propio usuario puede
-- enviar al registrarse. Si el disparador hiciese algo como
-- `(new.raw_user_meta_data ->> 'rol')::public.rol_usuario`, cualquiera que
-- lograse llegar al registro podría pedir el rol 'supervisor' y obtenerlo.
-- Es una escalada de privilegios de manual.
--
-- El nombre sí se toma de los metadatos porque es inofensivo: como mucho
-- alguien se pone un nombre falso, y un supervisor lo corrige.
--
-- El rol real lo asigna después el supervisor, desde la pantalla de usuarios,
-- que sí comprueba quién lo está pidiendo.
create or replace function public.crear_perfil_al_registrarse()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, nombre_completo, rol)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nombre_completo'), ''),
      new.email
    ),
    'operario'::public.rol_usuario
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row
  execute function public.crear_perfil_al_registrarse();

-- --- Mantener la marca de tiempo de modificación -----------------------------
--
-- Se hace en la base de datos y no en la aplicación a propósito: así la fecha
-- es correcta aunque la fila se modifique desde el panel de Supabase, desde un
-- script de importación o desde cualquier otro sitio que no sea nuestro código.
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger perfiles_actualizado_en
  before update on public.perfiles
  for each row
  execute function public.tocar_actualizado_en();


-- =============================================================================
--  PASO MANUAL OBLIGATORIO · el primer supervisor
-- =============================================================================
--
--  Hay un problema del huevo y la gallina: solo un supervisor puede asignar el
--  rol de supervisor, y al aplicar esta migración no existe ninguno. Todos los
--  usuarios nacen como 'operario'.
--
--  El primer supervisor se crea A MANO, una sola vez:
--
--    1. Panel de Supabase → Authentication → Users → Add user
--       Marca "Auto Confirm User" para no depender del correo.
--
--    2. SQL Editor, sustituyendo el correo por el real:
--
--         update public.perfiles
--         set rol = 'supervisor'
--         where id = (select id from auth.users where email = 'tu@empresa.com');
--
--    3. Comprobar que ha funcionado:
--
--         select p.nombre_completo, p.rol, u.email
--         from public.perfiles p join auth.users u on u.id = p.id;
--
--  A partir de ahí, ese supervisor da de alta a todos los demás desde la
--  aplicación. Este paso no se automatiza a propósito: un script capaz de
--  fabricar supervisores es exactamente lo que no queremos que exista.
-- =============================================================================
