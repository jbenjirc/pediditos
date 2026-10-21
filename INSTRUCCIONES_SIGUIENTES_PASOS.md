# Guía Completa de Instrucciones y Siguientes Pasos (Módulo Arpillas)

Guarda este documento como referencia para continuar cuando desees o iniciar un nuevo chat.

---

## 1. Estado Actual (Lo que ya quedó resuelto)

1. **Servidor y Errores:**
   - Se crearon componentes placeholder limpios y responsivos en todas las rutas vacías:
     - `/control` (`src/app/(arpillas)/control/page.tsx`)
     - `/control/envios` (`src/app/(arpillas)/control/envios/page.tsx`)
     - `/receptor` (`src/app/(arpillas)/receptor/page.tsx`)
     - `/receptor/venta` (`src/app/(arpillas)/receptor/venta/page.tsx`)
     - `/receptor/ticket/[folio]` (`src/app/(arpillas)/receptor/ticket/[folio]/page.tsx`)
   - `npx tsc --noEmit` pasa limpio con **0 errores**.
   - Se respaldaron tus notas de comandos bash/curl en `supabase/notas-arpillas.md`.

2. **Autenticación y Sesiones:**
   - `/acceso` → Operador de pedidos (`OPERADOR_PIN`).
   - `/arpillas` → PIN de Control (`OPERADOR_ARP`) o PIN de Sucursal/Receptor.
   - Botón **"Salir"** habilitado en `/control` y `/receptor`.

---

## 2. Pasos en Supabase (SQL y Base de Datos)

Ejecuta estas consultas en el **SQL Editor de Supabase** (cuando el proyecto esté activo):

### A. Migración de `pin_hmac` para Ubicaciones
Archivo: `supabase/migrations/20261020-arp-ubicaciones-pin-hmac.sql`
```sql
alter table arp_ubicaciones
  add column if not exists pin_hmac text;

create unique index if not exists arp_ubicaciones_pin_hmac_activo_uq
  on arp_ubicaciones (pin_hmac)
  where activo and pin_hmac is not null;
```

### B. Datos Semilla (Ubicaciones y Clientes Demo)
```sql
-- 1. Ubicaciones
insert into arp_ubicaciones (nombre, ciudad, es_origen, es_destino, activo)
values 
  ('Bodega Central', 'Matriz', true, false, true),
  ('Sucursal Norte', 'Local', false, true, true)
on conflict do nothing;

-- 2. Clientes Demo
insert into arp_clientes (nombre, ciudad, activo)
values 
  ('Cliente General', 'Mostrador', true),
  ('Distribuidora San Juan', 'Local', true)
on conflict do nothing;
```

### C. Asignar PIN a una Ubicación Receptor
1. Abre tu terminal y genera el hash con tu secreto actual:
```bash
set -a; source .env.local; set +a
node -e "const c=require('crypto'); console.log(c.createHmac('sha256', process.env.ARP_SESSION_SECRET).update('pin:1234').digest('hex'))"
```
*(Cambia `1234` por el PIN deseado para esa sucursal)*.

2. En Supabase SQL Editor:
```sql
update arp_ubicaciones 
set pin_hmac = '<EL_HASH_GENERADO>'
where nombre = 'Sucursal Norte';
```

---

## 3. Storage para Evidencias (Fotos)

Si vas a requerir fotos de evidencia en envíos y recepciones:
1. En Supabase Dashboard ve a **Storage** → **New bucket**.
2. Nombre: `arp-evidencias`.
3. Activar **Public bucket** (o dejarlo privado si prefieres URLs firmadas).

---

## 4. Hoja de Ruta para Programar la Lógica Real (Próxima Sesión)

Cuando regreses para implementar la lógica completa, pide al asistente lo siguiente:

> *"Implementar la lógica completa del módulo Arpillas basada en el plan: crear `consultas.ts`, las acciones de servidor (`envios.ts`, `recepcion.ts`, `ventas.ts`), los 4 componentes interactivos y conectar las vistas de `/control` y `/receptor`."*

El orden de construcción recomendado es:
1. **`src/features/arpillas/consultas.ts`**: Lectura de inventario, envíos activos, catálogo de ubicaciones y clientes.
2. **`src/features/arpillas/acciones/`**:
   - `envios.ts`: Crear envío (borrador o enviado), marcar en camino, cancelar envío.
   - `recepcion.ts`: Confirmar recepción con o sin merma llamando a `arp_confirmar_recepcion`.
   - `ventas.ts`: Registrar venta llamando a `arp_registrar_venta` y redirigir a `/receptor/ticket/[folio]`.
3. **Componentes en `src/features/arpillas/componentes/`**:
   - `PanelInventario.tsx`: Tarjetas de stock actual por bodega/sucursal.
   - `TarjetaEnvio.tsx`: Lista de estatus con badges y diferencias de merma.
   - `SelectorCantidad.tsx`: Botones grandes `+` / `-` optimizados para celular.
   - `CampoEvidencia.tsx`: Captura con cámara para teléfono móvil (`capture="environment"`).
4. **Conexión de Páginas**:
   - Reemplazar los placeholders por los formularios y listas reales.
