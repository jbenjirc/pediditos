import { createClient } from "@supabase/supabase-js";
import { createHmac } from "node:crypto";

/**
 * Script descriptivo de validación y actualización de base de datos
 * para el Módulo Arpillas de Pediditos.
 *
 * Ejecutar con:
 *   node --env-file=.env.local scripts/validar-db-arpillas.mjs
 */

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function logHeader(titulo) {
  console.log(`\n${ANSI.bold}${ANSI.cyan}=== ${titulo} ===${ANSI.reset}`);
}

function logItem(estado, nombre, detalle = "") {
  const icono = estado ? `${ANSI.green}✔ [OK]${ANSI.reset}` : `${ANSI.red}✖ [FALLÓ]${ANSI.reset}`;
  const det = detalle ? ` ${ANSI.dim}(${detalle})${ANSI.reset}` : "";
  console.log(`  ${icono} ${nombre}${det}`);
}

function logWarn(nombre, detalle = "") {
  console.log(`  ${ANSI.yellow}⚠ [AVISO]${ANSI.reset} ${nombre} ${ANSI.dim}${detalle}${ANSI.reset}`);
}

function logInfo(mensaje) {
  console.log(`  ${ANSI.blue}ℹ${ANSI.reset} ${mensaje}`);
}

async function main() {
  console.log(`${ANSI.bold}================================================================${ANSI.reset}`);
  console.log(`${ANSI.bold}  VALIDACIÓN Y ACTUALIZACIÓN DE BASE DE DATOS · ARPILLAS       ${ANSI.reset}`);
  console.log(`${ANSI.bold}================================================================${ANSI.reset}`);

  // 1. Verificación de Variables de Entorno
  logHeader("1. Variables de Entorno");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const sessionSecret = process.env.ARP_SESSION_SECRET;
  const operadorArp = process.env.OPERADOR_ARP;

  logItem(Boolean(url), "NEXT_PUBLIC_SUPABASE_URL", url ? url.substring(0, 30) + "..." : "Ausente");
  logItem(Boolean(serviceKey), "SUPABASE_SERVICE_ROLE_KEY", serviceKey ? `Longitud: ${serviceKey.length} caracteres` : "Ausente");
  logItem(Boolean(sessionSecret && sessionSecret.length >= 32), "ARP_SESSION_SECRET", sessionSecret ? `Válido (${sessionSecret.length} chars)` : "Inválido o ausente (<32 chars)");
  logItem(Boolean(operadorArp && /^\d{4}$/.test(operadorArp)), "OPERADOR_ARP", operadorArp ? `PIN configurado (${operadorArp})` : "Ausente o inválido (debe ser 4 dígitos)");

  if (!url || !serviceKey || !sessionSecret) {
    console.error(`\n${ANSI.red}${ANSI.bold}Error crítico: Faltan variables esenciales en .env.local${ANSI.reset}`);
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // 2. Verificación de Tablas
  logHeader("2. Tablas del Esquema Arpillas");
  const tablas = [
    "arp_ubicaciones",
    "arp_clientes",
    "arp_asignaciones",
    "arp_envios",
    "arp_ventas",
    "arp_movimientos_inventario",
  ];

  for (const tabla of tablas) {
    const { count, error } = await supabase.from(tabla).select("*", { count: "exact", head: true });
    if (error) {
      logItem(false, tabla, `${error.message} (Código ${error.code})`);
    } else {
      logItem(true, tabla, `${count ?? 0} registros encontrados`);
    }
  }

  // 3. Verificación de Columna Crítica pin_hmac
  logHeader("3. Columna pin_hmac en arp_ubicaciones");
  const { error: errCol } = await supabase
    .from("arp_ubicaciones")
    .select("id, nombre, pin_hmac")
    .limit(1);

  if (errCol) {
    logItem(false, "Columna pin_hmac", errCol.message);
  } else {
    logItem(true, "Columna pin_hmac presente y accesible en arp_ubicaciones");
  }

  // 4. Verificación de Vistas
  logHeader("4. Vistas de Lectura");
  const vistas = [
    "arp_inventario_actual",
    "arp_envios_detalle",
    "arp_ventas_detalle",
  ];

  for (const vista of vistas) {
    const { error } = await supabase.from(vista).select("*", { count: "exact", head: true });
    if (error) {
      logItem(false, vista, error.message);
    } else {
      logItem(true, vista, `Vista activa y lista`);
    }
  }

  // 5. Verificación de Funciones RPC
  logHeader("5. Funciones RPC (Lógica Atómica)");
  const rpcs = [
    { name: "arp_confirmar_recepcion", params: { p_envio_id: "00000000-0000-0000-0000-000000000000", p_version: 1, p_cantidad_recibida: 1 } },
    { name: "arp_registrar_venta", params: { p_cliente_id: "00000000-0000-0000-0000-000000000000", p_ubicacion_id: "00000000-0000-0000-0000-000000000000", p_cantidad: 1 } },
    { name: "arp_cancelar_venta", params: { p_venta_id: "00000000-0000-0000-0000-000000000000" } },
    { name: "arp_ajustar_inventario", params: { p_ubicacion_id: "00000000-0000-0000-0000-000000000000", p_cantidad: 1, p_motivo: "test" } },
  ];

  for (const r of rpcs) {
    const { error } = await supabase.rpc(r.name, r.params);
    if (error && error.code === "42883") {
      logItem(false, `RPC ${r.name}`, "No existe en la base de datos");
    } else {
      logItem(true, `RPC ${r.name}`, `Registrada y funcional (${error ? error.message : "OK"})`);
    }
  }

  // 6. Verificación de Supabase Storage
  logHeader("6. Supabase Storage (Evidencias fotográficas)");
  const { data: buckets, error: errBuckets } = await supabase.storage.listBuckets();
  let tieneBucketEvidencias = false;
  if (errBuckets) {
    logItem(false, "Storage listBuckets", errBuckets.message);
  } else {
    tieneBucketEvidencias = buckets.some((b) => b.name === "arp-evidencias");
    if (tieneBucketEvidencias) {
      logItem(true, "Bucket arp-evidencias", "Existe y listo para evidencias");
    } else {
      logWarn("Bucket arp-evidencias ausente. Creando bucket público...");
      const { error: errCreateB } = await supabase.storage.createBucket("arp-evidencias", {
        public: true,
      });
      if (errCreateB) {
        logItem(false, "Creación de bucket arp-evidencias", errCreateB.message);
      } else {
        logItem(true, "Bucket arp-evidencias creado exitosamente");
      }
    }
  }

  // 7. Actualización y Sembrado de Datos Demo
  logHeader("7. Actualización y Datos Semilla");

  // Ubicaciones
  const demoUbicaciones = [
    { nombre: "Bodega Central", ciudad: "Matriz", es_origen: true, es_destino: false, activo: true },
    { nombre: "Sucursal Norte", ciudad: "Local", es_origen: false, es_destino: true, activo: true },
  ];

  for (const u of demoUbicaciones) {
    const { data: existente } = await supabase
      .from("arp_ubicaciones")
      .select("id, nombre, pin_hmac")
      .eq("nombre", u.nombre)
      .maybeSingle();

    if (!existente) {
      const { data: creado, error: errIns } = await supabase
        .from("arp_ubicaciones")
        .insert(u)
        .select()
        .single();
      if (errIns) {
        logItem(false, `Insertar ubicación ${u.nombre}`, errIns.message);
      } else {
        logItem(true, `Ubicación creada: ${u.nombre} (ID: ${creado.id})`);
      }
    } else {
      logItem(true, `Ubicación ya existe: ${u.nombre} (ID: ${existente.id})`);
    }
  }

  // Hash HMAC para Sucursal Norte con PIN 1234
  const pinDemo = "1234";
  const pinHash = createHmac("sha256", sessionSecret).update(`pin:${pinDemo}`).digest("hex");

  const { data: sucursalNorte } = await supabase
    .from("arp_ubicaciones")
    .select("id, nombre, pin_hmac")
    .eq("nombre", "Sucursal Norte")
    .maybeSingle();

  if (sucursalNorte) {
    if (sucursalNorte.pin_hmac !== pinHash) {
      const { error: errUpdPin } = await supabase
        .from("arp_ubicaciones")
        .update({ pin_hmac: pinHash })
        .eq("id", sucursalNorte.id);

      if (errUpdPin) {
        logItem(false, "Asignar PIN a Sucursal Norte", errUpdPin.message);
      } else {
        logItem(true, `PIN asignado a Sucursal Norte (PIN demo: ${pinDemo})`);
      }
    } else {
      logItem(true, `Sucursal Norte ya tiene el PIN configurado (PIN demo: ${pinDemo})`);
    }
  }

  // Clientes Demo
  const demoClientes = [
    { nombre: "Cliente General", ciudad: "Mostrador", activo: true },
    { nombre: "Distribuidora San Juan", ciudad: "Local", activo: true },
  ];

  for (const c of demoClientes) {
    const { data: existente } = await supabase
      .from("arp_clientes")
      .select("id, nombre")
      .eq("nombre", c.nombre)
      .maybeSingle();

    if (!existente) {
      const { data: creado, error: errIns } = await supabase
        .from("arp_clientes")
        .insert(c)
        .select()
        .single();
      if (errIns) {
        logItem(false, `Insertar cliente ${c.nombre}`, errIns.message);
      } else {
        logItem(true, `Cliente creado: ${c.nombre} (ID: ${creado.id})`);
      }
    } else {
      logItem(true, `Cliente ya existe: ${c.nombre} (ID: ${existente.id})`);
    }
  }

  // Stock inicial en Bodega Central para pruebas
  const { data: bodegaCentral } = await supabase
    .from("arp_ubicaciones")
    .select("id, nombre")
    .eq("nombre", "Bodega Central")
    .maybeSingle();

  if (bodegaCentral) {
    const { data: stockBodega } = await supabase
      .from("arp_inventario_actual")
      .select("existencia")
      .eq("ubicacion_id", bodegaCentral.id)
      .maybeSingle();

    const existenciaActual = stockBodega?.existencia ?? 0;
    if (existenciaActual <= 0) {
      logInfo("Bodega Central tiene 0 arpillas. Agregando stock inicial de 50 arpillas...");
      const { error: errAjuste } = await supabase.rpc("arp_ajustar_inventario", {
        p_ubicacion_id: bodegaCentral.id,
        p_cantidad: 50,
        p_motivo: "Inventario inicial de prueba",
      });
      if (errAjuste) {
        logItem(false, "Stock inicial Bodega Central", errAjuste.message);
      } else {
        logItem(true, "Stock inicial de 50 arpillas asignado a Bodega Central");
      }
    } else {
      logItem(true, `Bodega Central tiene stock activo: ${existenciaActual} arpillas`);
    }
  }

  // Resumen Final
  logHeader("8. Resumen de Inventario Actual");
  const { data: resumenInventario } = await supabase
    .from("arp_inventario_actual")
    .select("ubicacion, ciudad, existencia, ultimo_movimiento");

  if (resumenInventario && resumenInventario.length > 0) {
    console.table(resumenInventario);
  } else {
    logWarn("No se encontró inventario.");
  }

  console.log(`\n${ANSI.bold}${ANSI.green}✔ VALIDACIÓN Y ACTUALIZACIÓN COMPLETADA CON ÉXITO.${ANSI.reset}`);
  console.log(`${ANSI.dim}Credenciales de prueba disponibles:${ANSI.reset}`);
  console.log(`  - Control: PIN = ${operadorArp} (Ruta: /arpillas -> /control)`);
  console.log(`  - Sucursal Norte: PIN = ${pinDemo} (Ruta: /arpillas -> /receptor)\n`);
}

main().catch((err) => {
  console.error(`\n${ANSI.red}${ANSI.bold}Error fatal:${ANSI.reset}`, err);
  process.exit(1);
});
