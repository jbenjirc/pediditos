import "server-only";

import { supabaseAdmin } from "./db";
import type { Estado } from "./schemas";

export type InventarioUbicacion = {
  ubicacion_id: string;
  ubicacion: string;
  ciudad: string | null;
  existencia: number;
  ultimo_movimiento: string | null;
};

export type Ubicacion = {
  id: string;
  nombre: string;
  ciudad: string | null;
  es_origen: boolean;
  es_destino: boolean;
  activo: boolean;
};

export type Cliente = {
  id: string;
  nombre: string;
  ciudad: string | null;
  telefono: string | null;
  activo: boolean;
};

export type EnvioDetalle = {
  id: string;
  folio: string;
  fecha_envio: string;
  cantidad_arpillas: number;
  origen_id: string;
  origen_nombre: string;
  destino_id: string;
  destino_nombre: string;
  evidencia_url: string | null;
  notas: string | null;
  cantidad_recibida: number | null;
  fecha_recepcion: string | null;
  evidencia_recepcion_url: string | null;
  notas_recepcion: string | null;
  estado: Estado;
  archivado: boolean;
  version: number;
  actualizado_en: string;
  creado_en: string;
  diferencia: number | null;
};

export type VentaDetalle = {
  id: string;
  folio: string;
  cliente_id: string;
  cliente_nombre: string;
  cliente_ciudad: string | null;
  ubicacion_id: string;
  ubicacion_nombre: string;
  cantidad_arpillas: number;
  fecha_venta: string;
  precio_unitario: number | null;
  total: number | null;
  cancelada: boolean;
  motivo_cancelacion: string | null;
  notas: string | null;
  creado_en: string;
};

export type ResumenControl = {
  totalInventario: number;
  enviosEnTransito: number;
  ventasRegistradas: number;
};

/**
 * Consulta del inventario actual por cada ubicación activa.
 * Lee desde la vista calculada arp_inventario_actual.
 */
export async function obtenerInventarioActual(): Promise<InventarioUbicacion[]> {
  const { data, error } = await supabaseAdmin()
    .from("arp_inventario_actual")
    .select("ubicacion_id, ubicacion, ciudad, existencia, ultimo_movimiento")
    .order("existencia", { ascending: false });

  if (error) {
    console.error("Error al obtener inventario actual:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    ubicacion_id: row.ubicacion_id ?? "",
    ubicacion: row.ubicacion ?? "Sin nombre",
    ciudad: row.ciudad,
    existencia: row.existencia ?? 0,
    ultimo_movimiento: row.ultimo_movimiento,
  }));
}

/**
 * Obtiene el inventario de una ubicación específica.
 */
export async function obtenerInventarioUbicacion(
  ubicacionId: string,
): Promise<InventarioUbicacion | null> {
  const { data, error } = await supabaseAdmin()
    .from("arp_inventario_actual")
    .select("ubicacion_id, ubicacion, ciudad, existencia, ultimo_movimiento")
    .eq("ubicacion_id", ubicacionId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ubicacion_id: data.ubicacion_id ?? ubicacionId,
    ubicacion: data.ubicacion ?? "",
    ciudad: data.ciudad,
    existencia: data.existencia ?? 0,
    ultimo_movimiento: data.ultimo_movimiento,
  };
}

/**
 * Catálogo de ubicaciones (orígenes y destinos de arpillas).
 */
export async function obtenerUbicaciones({
  activasSolo = true,
}: { activasSolo?: boolean } = {}): Promise<Ubicacion[]> {
  let query = supabaseAdmin()
    .from("arp_ubicaciones")
    .select("id, nombre, ciudad, es_origen, es_destino, activo")
    .order("nombre", { ascending: true });

  if (activasSolo) {
    query = query.eq("activo", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error al obtener ubicaciones:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Catálogo de clientes registrados para venta de arpillas.
 */
export async function obtenerClientes({
  activosSolo = true,
}: { activosSolo?: boolean } = {}): Promise<Cliente[]> {
  let query = supabaseAdmin()
    .from("arp_clientes")
    .select("id, nombre, ciudad, telefono, activo")
    .order("nombre", { ascending: true });

  if (activosSolo) {
    query = query.eq("activo", true);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Consulta de envíos detallados con soporte de filtros.
 */
export async function obtenerEnvios(filtros?: {
  destinoId?: string;
  origenId?: string;
  estado?: Estado;
  limite?: number;
}): Promise<EnvioDetalle[]> {
  let query = supabaseAdmin()
    .from("arp_envios_detalle")
    .select("*")
    .order("fecha_envio", { ascending: false });

  if (filtros?.destinoId) {
    query = query.eq("destino_id", filtros.destinoId);
  }
  if (filtros?.origenId) {
    query = query.eq("origen_id", filtros.origenId);
  }
  if (filtros?.estado) {
    query = query.eq("estado", filtros.estado);
  }
  if (filtros?.limite) {
    query = query.limit(filtros.limite);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error al obtener envios:", error);
    return [];
  }

  return (data ?? []) as unknown as EnvioDetalle[];
}

/**
 * Envíos pendientes de recepción para una sucursal destino específica.
 * Filtra los envíos que están en camino ('enviado').
 */
export async function obtenerEnviosPendientesReceptor(
  destinoId: string,
): Promise<EnvioDetalle[]> {
  const { data, error } = await supabaseAdmin()
    .from("arp_envios_detalle")
    .select("*")
    .eq("destino_id", destinoId)
    .eq("estado", "enviado")
    .order("fecha_envio", { ascending: true });

  if (error) {
    console.error("Error al obtener envíos pendientes de receptor:", error);
    return [];
  }

  return (data ?? []) as unknown as EnvioDetalle[];
}

/**
 * Consulta un envío individual por su ID.
 */
export async function obtenerEnvioPorId(
  id: string,
): Promise<EnvioDetalle | null> {
  const { data, error } = await supabaseAdmin()
    .from("arp_envios_detalle")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as EnvioDetalle;
}

/**
 * Consulta listado de ventas detalladas.
 */
export async function obtenerVentas(filtros?: {
  ubicacionId?: string;
  limite?: number;
}): Promise<VentaDetalle[]> {
  let query = supabaseAdmin()
    .from("arp_ventas_detalle")
    .select("*")
    .order("fecha_venta", { ascending: false });

  if (filtros?.ubicacionId) {
    query = query.eq("ubicacion_id", filtros.ubicacionId);
  }
  if (filtros?.limite) {
    query = query.limit(filtros.limite);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error al obtener ventas:", error);
    return [];
  }

  return (data ?? []) as unknown as VentaDetalle[];
}

/**
 * Obtiene una venta individual por su folio (para comprobante / ticket).
 */
export async function obtenerVentaPorFolio(
  folio: string,
): Promise<VentaDetalle | null> {
  const { data, error } = await supabaseAdmin()
    .from("arp_ventas_detalle")
    .select("*")
    .eq("folio", folio)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as VentaDetalle;
}

/**
 * Resumen para las tarjetas superiores del panel de control.
 */
export async function obtenerResumenControl(): Promise<ResumenControl> {
  const [inventario, enviosTransito, ventas] = await Promise.all([
    supabaseAdmin().from("arp_inventario_actual").select("existencia"),
    supabaseAdmin()
      .from("arp_envios")
      .select("*", { count: "exact", head: true })
      .eq("estado", "enviado"),
    supabaseAdmin()
      .from("arp_ventas")
      .select("*", { count: "exact", head: true })
      .eq("cancelada", false),
  ]);

  const totalInventario = (inventario.data ?? []).reduce(
    (sum, row) => sum + (row.existencia ?? 0),
    0,
  );

  return {
    totalInventario,
    enviosEnTransito: enviosTransito.count ?? 0,
    ventasRegistradas: ventas.count ?? 0,
  };
}
