import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { EstadoPedido } from "@/features/pedidos/estados";
import type { MetodoPago } from "@/features/pedidos/metodos-pago";

export type ItemPedido = {
  producto_nombre: string;
  producto_presentacion: string | null;
  categoria: "agua" | "pulpa";
  cantidad: number;
  productos: { color_hex: string | null } | null;
};

export type PedidoTablero = {
  id: string;
  folio: string;
  establecimiento_nombre: string;
  hora_apertura: string;
  fecha_entrega: string;
  creado_en: string;
  estado: EstadoPedido;
  req_etiquetado: boolean;
  metodo_pago: MetodoPago | null;
  notas: string | null;
  total_botellas: number;
  pedido_items: ItemPedido[];
};

const CAMPOS = `
  id, folio, establecimiento_nombre, hora_apertura, fecha_entrega, creado_en,
  estado, req_etiquetado, metodo_pago, notas, total_botellas,
  pedido_items ( producto_nombre, producto_presentacion, categoria, cantidad,
                 productos ( color_hex ) )
`;

/**
 * Tablero del día: filtra por fecha_entrega, no por fecha de creación.
 * Un pedido capturado anoche para hoy tiene que aparecer hoy.
 * Orden por hora de apertura: primero el negocio que abre más temprano.
 */
export async function obtenerPedidosDelDia(
  fecha: string,
): Promise<PedidoTablero[]> {
  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select(CAMPOS)
    .eq("fecha_entrega", fecha)
    .is("eliminado_en", null)
    .is("archivado_en", null)
    .order("hora_apertura", { ascending: true });

  if (error)
    throw new Error(`No se pudieron cargar los pedidos: ${error.message}`);
  return (data ?? []) as unknown as PedidoTablero[];
}

/**
 * Búsqueda por folio. Ignora el filtro de fecha a propósito: si el operador
 * teclea un folio es porque busca ESE pedido, sea de hoy o no.
 */
export async function buscarPorFolio(folio: string): Promise<PedidoTablero[]> {
  const q = folio.trim();
  if (q.length < 2) return [];

  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .select(CAMPOS)
    .ilike("folio", `%${q}%`)
    .is("eliminado_en", null)
    .order("creado_en", { ascending: false })
    .limit(50);

  if (error) throw new Error(`No se pudo buscar: ${error.message}`);
  return (data ?? []) as unknown as PedidoTablero[];
}
