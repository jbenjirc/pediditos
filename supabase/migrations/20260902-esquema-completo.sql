-- ============================================================================
-- ARPILLAS · Esquema completo (MVP)
-- PostgreSQL 15+ / Supabase
--
-- Consolida el esquema inicial y el addendum de asignaciones, con las
-- correcciones de seguridad e idempotencia. Reemplaza a ambos archivos.
--
-- Prefijo arp_ para convivir sin colisiones con las tablas del proyecto
-- existente (pediditos). Ejecutar completo en el SQL Editor de Supabase.
--
-- RIESGO CONOCIDO: la sección 8 asume que la PK de `usuarios` se llama `id`.
-- Si no es así, el script falla ahí y hace rollback completo. Verifica antes:
--   select column_name from information_schema.columns
--    where table_name = 'usuarios' and table_schema = 'public';
-- ============================================================================

begin;

-- ============================================================================
-- 1. CATÁLOGOS
-- ============================================================================

create table if not exists arp_ubicaciones (
  id          uuid primary key default gen_random_uuid(),
  nombre      text        not null,
  ciudad      text,
  es_origen   boolean     not null default false,
  es_destino  boolean     not null default false,
  activo      boolean     not null default true,
  creado_en   timestamptz not null default now(),
  constraint arp_ubicaciones_rol_valido check (es_origen or es_destino)
);

create unique index if not exists arp_ubicaciones_nombre_uk
  on arp_ubicaciones (lower(nombre));

comment on table arp_ubicaciones is
  'Puntos de origen y destino de los envíos. El inventario vive por ubicación.';


create table if not exists arp_clientes (
  id        uuid primary key default gen_random_uuid(),
  nombre    text        not null,
  ciudad    text,
  telefono  text,
  activo    boolean     not null default true,
  creado_en timestamptz not null default now()
);

create unique index if not exists arp_clientes_nombre_uk
  on arp_clientes (lower(nombre));


-- Mapea usuario -> rol dentro de este módulo -> ubicación donde opera.
-- Tabla aparte para no modificar `usuarios`, que es compartida.
create table if not exists arp_asignaciones (
  id           uuid primary key default gen_random_uuid(),
  usuario_id   uuid    not null,
  rol_app      text    not null check (rol_app in ('control','receptor')),
  ubicacion_id uuid    references arp_ubicaciones(id),
  activo       boolean not null default true,
  creado_en    timestamptz not null default now(),

  -- El receptor siempre opera desde una ubicación concreta.
  -- El operador de control las ve todas, así que va en NULL.
  constraint arp_asignaciones_ubicacion_requerida
    check (rol_app <> 'receptor' or ubicacion_id is not null),
  constraint arp_asignaciones_control_sin_ubicacion
    check (rol_app <> 'control' or ubicacion_id is null)
);

create unique index if not exists arp_asignaciones_usuario_rol_uk
  on arp_asignaciones (usuario_id, rol_app) where activo;
create index if not exists arp_asignaciones_ubicacion_idx
  on arp_asignaciones (ubicacion_id) where activo;

comment on table arp_asignaciones is
  'Un usuario puede tener ambos roles (p. ej. el dueño). La app resuelve el '
  'conflicto prefiriendo control al iniciar sesión.';


-- ============================================================================
-- 2. ENVÍOS
-- ============================================================================

create sequence if not exists arp_envios_folio_seq;

create table if not exists arp_envios (
  id                uuid primary key default gen_random_uuid(),
  folio             text not null unique
                      default ('ENV-' || lpad(nextval('arp_envios_folio_seq')::text, 4, '0')),

  -- Declarado por el operador de control
  fecha_envio       timestamptz not null default now(),
  cantidad_arpillas integer     not null check (cantidad_arpillas > 0),
  origen_id         uuid        not null references arp_ubicaciones(id),
  destino_id        uuid        not null references arp_ubicaciones(id),
  evidencia_url     text,
  notas             text,
  creado_por        uuid,
  creado_en         timestamptz not null default now(),

  -- Confirmado por el receptor. Puede diferir de cantidad_arpillas (merma).
  cantidad_recibida       integer check (cantidad_recibida >= 0),
  fecha_recepcion         timestamptz,
  recibido_por            uuid,
  evidencia_recepcion_url text,
  notas_recepcion         text,

  -- Control
  estado         text    not null default 'borrador'
                   check (estado in ('borrador','enviado','recibido','cancelado')),
  archivado      boolean not null default false,
  version        integer not null default 1,
  actualizado_en timestamptz not null default now(),

  constraint arp_envios_origen_distinto_destino
    check (origen_id <> destino_id),
  constraint arp_envios_recepcion_completa
    check (estado <> 'recibido'
           or (cantidad_recibida is not null and fecha_recepcion is not null))
);

create index if not exists arp_envios_estado_fecha_idx
  on arp_envios (estado, fecha_envio desc) where not archivado;
create index if not exists arp_envios_destino_idx
  on arp_envios (destino_id, estado);
create index if not exists arp_envios_folio_idx
  on arp_envios (folio text_pattern_ops);

comment on column arp_envios.version is
  'Concurrencia optimista: el UPDATE debe incluir `and version = <valor leído>`.';


-- ============================================================================
-- 3. VENTAS
-- ============================================================================

create sequence if not exists arp_ventas_folio_seq;

create table if not exists arp_ventas (
  id                 uuid primary key default gen_random_uuid(),
  folio              text not null unique
                       default ('VTA-' || lpad(nextval('arp_ventas_folio_seq')::text, 4, '0')),
  fecha_venta        timestamptz not null default now(),
  cliente_id         uuid        not null references arp_clientes(id),
  ubicacion_id       uuid        not null references arp_ubicaciones(id),
  cantidad_arpillas  integer     not null check (cantidad_arpillas > 0),
  precio_unitario    numeric(10,2),  -- opcional; el ticket lo usa si existe
  registrado_por     uuid,
  notas              text,
  cancelada          boolean     not null default false,
  motivo_cancelacion text,
  creado_en          timestamptz not null default now()
);

create index if not exists arp_ventas_fecha_idx
  on arp_ventas (fecha_venta desc) where not cancelada;
create index if not exists arp_ventas_cliente_idx
  on arp_ventas (cliente_id, fecha_venta desc);


-- ============================================================================
-- 4. INVENTARIO (libro de movimientos, append-only)
-- ============================================================================

create table if not exists arp_movimientos_inventario (
  id               uuid primary key default gen_random_uuid(),
  ubicacion_id     uuid    not null references arp_ubicaciones(id),
  cantidad         integer not null check (cantidad <> 0),  -- + entrada, - salida
  tipo             text    not null
                     check (tipo in ('recepcion','venta','ajuste','cancelacion')),
  referencia_tabla text    check (referencia_tabla in ('arp_envios','arp_ventas')),
  referencia_id    uuid,
  motivo           text,
  creado_por       uuid,
  creado_en        timestamptz not null default now()
);

-- Idempotencia: un mismo documento no puede generar dos veces el mismo
-- movimiento (doble tap del receptor con mala señal, reintento de red, etc.)
create unique index if not exists arp_movimientos_referencia_uk
  on arp_movimientos_inventario (referencia_tabla, referencia_id, tipo)
  where referencia_id is not null;

create index if not exists arp_movimientos_ubicacion_idx
  on arp_movimientos_inventario (ubicacion_id, creado_en desc);

comment on table arp_movimientos_inventario is
  'Fuente de verdad del inventario. Nunca se hace UPDATE ni DELETE: '
  'para corregir se inserta un movimiento de tipo ajuste.';


-- ============================================================================
-- 5. VISTAS DE LECTURA
--
-- security_invoker = on es obligatorio aquí. Por defecto una vista corre con
-- los permisos de su dueño y NO aplica el RLS de las tablas base: con la anon
-- key se podría leer todo el módulo a través de estas vistas aunque las
-- tablas estén cerradas.
-- ============================================================================

create or replace view arp_inventario_actual
with (security_invoker = on) as
select
  u.id     as ubicacion_id,
  u.nombre as ubicacion,
  u.ciudad,
  coalesce(sum(m.cantidad), 0)::integer as existencia,
  max(m.creado_en)                      as ultimo_movimiento
from arp_ubicaciones u
left join arp_movimientos_inventario m on m.ubicacion_id = u.id
where u.activo
group by u.id, u.nombre, u.ciudad;


create or replace view arp_envios_detalle
with (security_invoker = on) as
select
  e.*,
  o.nombre as origen_nombre,
  d.nombre as destino_nombre,
  case
    when e.cantidad_recibida is null then null
    else e.cantidad_recibida - e.cantidad_arpillas
  end as diferencia
from arp_envios e
join arp_ubicaciones o on o.id = e.origen_id
join arp_ubicaciones d on d.id = e.destino_id;


create or replace view arp_ventas_detalle
with (security_invoker = on) as
select
  v.*,
  c.nombre as cliente_nombre,
  c.ciudad as cliente_ciudad,
  u.nombre as ubicacion_nombre,
  case when v.precio_unitario is null then null
       else v.precio_unitario * v.cantidad_arpillas end as total
from arp_ventas v
join arp_clientes c    on c.id = v.cliente_id
join arp_ubicaciones u on u.id = v.ubicacion_id;


-- ============================================================================
-- 6. TRIGGERS
-- ============================================================================

create or replace function arp_touch_envio()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.actualizado_en := now();
  if new.version = old.version then
    new.version := old.version + 1;
  end if;
  return new;
end;
$$;

drop trigger if exists arp_envios_touch on arp_envios;
create trigger arp_envios_touch
  before update on arp_envios
  for each row execute function arp_touch_envio();


-- ============================================================================
-- 7. FUNCIONES DE NEGOCIO (RPC)
-- Encapsulan las operaciones que tocan más de una tabla, para que sean
-- atómicas. Nunca hagas el INSERT del movimiento desde la app.
-- ============================================================================

-- --- Confirmar recepción de un envío ---------------------------------------
create or replace function arp_confirmar_recepcion(
  p_envio_id          uuid,
  p_version           integer,
  p_cantidad_recibida integer,
  p_evidencia_url     text default null,
  p_usuario_id        uuid default null,
  p_notas             text default null
)
returns arp_envios
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_envio arp_envios;
begin
  select * into v_envio from arp_envios where id = p_envio_id for update;
  if not found then
    raise exception 'ENVIO_NO_EXISTE';
  end if;
  if v_envio.version <> p_version then
    raise exception 'CONFLICTO_VERSION';
  end if;
  if v_envio.estado <> 'enviado' then
    raise exception 'ESTADO_INVALIDO:%', v_envio.estado;
  end if;
  if p_cantidad_recibida is null or p_cantidad_recibida < 0 then
    raise exception 'CANTIDAD_INVALIDA';
  end if;

  update arp_envios set
    estado                  = 'recibido',
    cantidad_recibida       = p_cantidad_recibida,
    fecha_recepcion         = now(),
    recibido_por            = p_usuario_id,
    evidencia_recepcion_url = coalesce(p_evidencia_url, evidencia_recepcion_url),
    notas_recepcion         = p_notas
  where id = p_envio_id
  returning * into v_envio;

  if p_cantidad_recibida > 0 then
    insert into arp_movimientos_inventario
      (ubicacion_id, cantidad, tipo, referencia_tabla, referencia_id, creado_por, motivo)
    values (
      v_envio.destino_id,
      p_cantidad_recibida,
      'recepcion',
      'arp_envios',
      v_envio.id,
      p_usuario_id,
      case when p_cantidad_recibida <> v_envio.cantidad_arpillas
           then format('Diferencia: enviadas %s, recibidas %s',
                       v_envio.cantidad_arpillas, p_cantidad_recibida)
      end
    );
  end if;

  return v_envio;
end;
$$;


-- --- Registrar una venta ----------------------------------------------------
create or replace function arp_registrar_venta(
  p_cliente_id      uuid,
  p_ubicacion_id    uuid,
  p_cantidad        integer,
  p_fecha           timestamptz default now(),
  p_precio_unitario numeric     default null,
  p_usuario_id      uuid        default null,
  p_notas           text        default null
)
returns arp_ventas
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_existencia integer;
  v_venta      arp_ventas;
begin
  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'CANTIDAD_INVALIDA';
  end if;

  -- Bloquea la ubicación: serializa las ventas concurrentes del mismo punto
  -- para que dos operadores no puedan vender el mismo inventario.
  perform 1 from arp_ubicaciones where id = p_ubicacion_id for update;
  if not found then
    raise exception 'UBICACION_NO_EXISTE';
  end if;

  select coalesce(sum(cantidad), 0) into v_existencia
  from arp_movimientos_inventario
  where ubicacion_id = p_ubicacion_id;

  if v_existencia < p_cantidad then
    raise exception 'INVENTARIO_INSUFICIENTE:%:%', v_existencia, p_cantidad;
  end if;

  insert into arp_ventas
    (cliente_id, ubicacion_id, cantidad_arpillas, fecha_venta,
     precio_unitario, registrado_por, notas)
  values
    (p_cliente_id, p_ubicacion_id, p_cantidad, coalesce(p_fecha, now()),
     p_precio_unitario, p_usuario_id, p_notas)
  returning * into v_venta;

  insert into arp_movimientos_inventario
    (ubicacion_id, cantidad, tipo, referencia_tabla, referencia_id, creado_por)
  values
    (p_ubicacion_id, -p_cantidad, 'venta', 'arp_ventas', v_venta.id, p_usuario_id);

  return v_venta;
end;
$$;


-- --- Cancelar una venta (reversa el inventario) -----------------------------
create or replace function arp_cancelar_venta(
  p_venta_id   uuid,
  p_usuario_id uuid default null,
  p_motivo     text default null
)
returns arp_ventas
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_venta arp_ventas;
begin
  select * into v_venta from arp_ventas where id = p_venta_id for update;
  if not found then
    raise exception 'VENTA_NO_EXISTE';
  end if;
  if v_venta.cancelada then
    raise exception 'VENTA_YA_CANCELADA';
  end if;

  update arp_ventas
     set cancelada = true, motivo_cancelacion = p_motivo
   where id = p_venta_id
  returning * into v_venta;

  insert into arp_movimientos_inventario
    (ubicacion_id, cantidad, tipo, referencia_tabla, referencia_id, creado_por, motivo)
  values
    (v_venta.ubicacion_id, v_venta.cantidad_arpillas, 'cancelacion',
     'arp_ventas', v_venta.id, p_usuario_id, p_motivo);

  return v_venta;
end;
$$;


-- --- Ajuste manual de inventario -------------------------------------------
create or replace function arp_ajustar_inventario(
  p_ubicacion_id uuid,
  p_cantidad     integer,      -- positivo o negativo, nunca cero
  p_motivo       text,
  p_usuario_id   uuid default null
)
returns arp_movimientos_inventario
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_mov arp_movimientos_inventario;
begin
  if p_cantidad = 0 then
    raise exception 'CANTIDAD_INVALIDA';
  end if;
  if p_motivo is null or length(trim(p_motivo)) = 0 then
    raise exception 'MOTIVO_REQUERIDO';
  end if;

  insert into arp_movimientos_inventario
    (ubicacion_id, cantidad, tipo, motivo, creado_por)
  values (p_ubicacion_id, p_cantidad, 'ajuste', p_motivo, p_usuario_id)
  returning * into v_mov;

  return v_mov;
end;
$$;


-- ============================================================================
-- 8. LLAVES FORÁNEAS A usuarios
--
-- Idempotentes: el drop previo permite volver a correr el script sin que
-- truene con "constraint already exists".
--
-- AJUSTA `public.usuarios(id)` si tu PK se llama distinto. Si esto falla,
-- toda la transacción hace rollback y la base queda como estaba.
-- ============================================================================

alter table arp_envios
  drop constraint if exists arp_envios_creado_por_fk,
  drop constraint if exists arp_envios_recibido_por_fk;
alter table arp_envios
  add constraint arp_envios_creado_por_fk
    foreign key (creado_por)   references public.usuarios(id),
  add constraint arp_envios_recibido_por_fk
    foreign key (recibido_por) references public.usuarios(id);

alter table arp_ventas
  drop constraint if exists arp_ventas_registrado_por_fk;
alter table arp_ventas
  add constraint arp_ventas_registrado_por_fk
    foreign key (registrado_por) references public.usuarios(id);

alter table arp_movimientos_inventario
  drop constraint if exists arp_movimientos_creado_por_fk;
alter table arp_movimientos_inventario
  add constraint arp_movimientos_creado_por_fk
    foreign key (creado_por) references public.usuarios(id);

alter table arp_asignaciones
  drop constraint if exists arp_asignaciones_usuario_fk;
alter table arp_asignaciones
  add constraint arp_asignaciones_usuario_fk
    foreign key (usuario_id) references public.usuarios(id) on delete cascade;


-- ============================================================================
-- 9. SEGURIDAD
--
-- No hay auth de Supabase (el acceso es por PIN), así que se cierra todo a
-- anon/authenticated y la app escribe únicamente desde el servidor con
-- service_role.
--
-- Supabase tiene privilegios por defecto que otorgan acceso a anon y
-- authenticated sobre objetos nuevos en public: hay que revocar tablas,
-- VISTAS, secuencias y funciones, no solo las tablas.
-- ============================================================================

-- --- RLS --------------------------------------------------------------------
alter table arp_ubicaciones            enable row level security;
alter table arp_clientes               enable row level security;
alter table arp_asignaciones           enable row level security;
alter table arp_envios                 enable row level security;
alter table arp_ventas                 enable row level security;
alter table arp_movimientos_inventario enable row level security;
-- Sin políticas = denegado para anon y authenticated. service_role las omite.

-- --- Revokes ----------------------------------------------------------------
revoke all on arp_ubicaciones, arp_clientes, arp_asignaciones, arp_envios,
              arp_ventas, arp_movimientos_inventario
  from anon, authenticated;

revoke all on arp_inventario_actual, arp_envios_detalle, arp_ventas_detalle
  from anon, authenticated;

revoke all on sequence arp_envios_folio_seq, arp_ventas_folio_seq
  from anon, authenticated;

revoke execute on function
  arp_confirmar_recepcion(uuid, integer, integer, text, uuid, text),
  arp_registrar_venta(uuid, uuid, integer, timestamptz, numeric, uuid, text),
  arp_cancelar_venta(uuid, uuid, text),
  arp_ajustar_inventario(uuid, integer, text, uuid)
  from public, anon, authenticated;

-- --- Grants -----------------------------------------------------------------
grant all privileges on arp_ubicaciones, arp_clientes, arp_asignaciones,
                        arp_envios, arp_ventas, arp_movimientos_inventario
  to service_role;

grant select on arp_inventario_actual, arp_envios_detalle, arp_ventas_detalle
  to service_role;

grant usage, select on sequence arp_envios_folio_seq, arp_ventas_folio_seq
  to service_role;

grant execute on function
  arp_confirmar_recepcion(uuid, integer, integer, text, uuid, text),
  arp_registrar_venta(uuid, uuid, integer, timestamptz, numeric, uuid, text),
  arp_cancelar_venta(uuid, uuid, text),
  arp_ajustar_inventario(uuid, integer, text, uuid)
  to service_role;

commit;


-- ============================================================================
-- 10. SEEDS (ajusta a tus datos reales y ejecuta aparte)
-- ============================================================================

-- insert into arp_ubicaciones (nombre, ciudad, es_origen, es_destino) values
--   ('Bodega Central', 'Tuxtla Gutiérrez', true,  false),
--   ('Punto Norte',    'Tapachula',        false, true);

-- insert into arp_clientes (nombre, ciudad) values
--   ('Cliente Demo', 'Tapachula');

-- insert into arp_asignaciones (usuario_id, rol_app, ubicacion_id) values
--   ('<uuid-del-operador>', 'control',  null),
--   ('<uuid-del-receptor>', 'receptor',
--     (select id from arp_ubicaciones where nombre = 'Punto Norte'));


-- ============================================================================
-- 11. VERIFICACIÓN
-- Los grants pueden aplicarse parcialmente sin lanzar error si quien ejecuta
-- no es dueño de las tablas. Corre las tres consultas antes de seguir.
-- ============================================================================

-- (a) Nadie más que service_role debe aparecer aquí:
-- select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type)
--   from information_schema.role_table_grants
--  where table_name like 'arp\_%'
--  group by table_name, grantee
--  order by table_name, grantee;

-- (b) RLS activo en las seis tablas:
-- select relname, relrowsecurity
--   from pg_class
--  where relname like 'arp\_%' and relkind = 'r'
--  order by relname;

-- (c) Las tres vistas deben mostrar {security_invoker=on}:
-- select relname, reloptions
--   from pg_class
--  where relname like 'arp\_%' and relkind = 'v'
--  order by relname;