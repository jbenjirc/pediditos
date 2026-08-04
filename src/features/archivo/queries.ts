import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EstadoPedido } from "@/features/pedidos/estados";
import { POR_PAGINA, type FiltrosArchivo } from "@/features/archivo/filtros";

export type FilaArchivo = {
  id: string;
  folio: string;
  establecimiento_nombre: string;
  fecha_entrega: string;
  hora_apertura: string;
  creado_en: string;
  estado: EstadoPedido;
  req_etiquetado: boolean;
  origen: "cliente" | "operador";
  total_botellas: number;
  archivado_en: string | null;
  eliminado_en: string | null;
};

export type ResumenProduccion = {
  pedidos: number;
  botellas: number;
  productos: {
    nombre: string;
    presentacion: string | null;
    categoria: "agua" | "pulpa";
    color_hex: string | null;
    total: number;
  }[];
};

/**
 * Lista paginada. A propósito NO trae pedido_items: la tabla solo muestra
 * totales, y el desglose de un pedido se ve en su recibo. Con meses de
 * operación, traer los renglones aquí serían decenas de miles de filas que
 * nadie lee.
 */
export async function listarArchivo(
  f: FiltrosArchivo,
): Promise<{ filas: FilaArchivo[]; total: number }> {
  let q = supabaseAdmin.from("pedidos").select(
    `id, folio, establecimiento_nombre, fecha_entrega, hora_apertura, creado_en,
       estado, req_etiquetado, origen, total_botellas, archivado_en, eliminado_en`,
    { count: "exact" },
  );

  // Buscar por folio ignora el rango de fechas: si tecleas un folio buscas
  // ESE pedido, no uno que además caiga en la semana que tenías filtrada.
  if (f.folio.length >= 2) {
    q = q.ilike("folio", `%${f.folio}%`);
  } else {
    q = q.gte("fecha_entrega", f.desde).lte("fecha_entrega", f.hasta);
    if (f.establecimientoId)
      q = q.eq("establecimiento_id", f.establecimientoId);
    if (f.estado) q = q.eq("estado", f.estado);
    if (f.etiquetado !== null) q = q.eq("req_etiquetado", f.etiquetado);
    if (f.origen) q = q.eq("origen", f.origen);
  }

  if (!f.incluirEliminados) q = q.is("eliminado_en", null);

  const inicio = (f.pagina - 1) * POR_PAGINA;

  const { data, count, error } = await q
    .order("fecha_entrega", { ascending: false })
    .order("creado_en", { ascending: false })
    .range(inicio, inicio + POR_PAGINA - 1);

  if (error) throw new Error(`No se pudo cargar el archivo: ${error.message}`);

  return { filas: (data ?? []) as FilaArchivo[], total: count ?? 0 };
}

export async function obtenerResumenProduccion(
  f: FiltrosArchivo,
): Promise<ResumenProduccion> {
  const { data, error } = await supabaseAdmin.rpc("resumen_produccion", {
    p_filtros: {
      desde: f.desde,
      hasta: f.hasta,
      establecimiento_id: f.establecimientoId,
      estado: f.estado,
      etiquetado: f.etiquetado,
      origen: f.origen,
      incluir_eliminados: f.incluirEliminados,
      incluir_archivados: true,
    },
  });

  if (error)
    throw new Error(`No se pudo calcular el resumen: ${error.message}`);

  return (
    (data as unknown as ResumenProduccion) ?? {
      pedidos: 0,
      botellas: 0,
      productos: [],
    }
  );
}
