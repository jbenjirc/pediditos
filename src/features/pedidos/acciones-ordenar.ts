"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirSesion } from "@/lib/auth/sesion";
import { esquemaPedido, type DatosPedido } from "@/features/pedidos/schema";
import type {
  RespuestaCrearPedido,
  ResultadoPedido,
} from "@/features/pedidos/tipos";
import { fechaLocal } from "@/lib/fechas";

/**
 * Captura desde el mostrador. Misma función de Postgres que la del cliente,
 * pero con `origen: "operador"`: así puedes distinguir después cuántos
 * pedidos entran solos y cuántos siguen pasando por teléfono, que es el dato
 * que dice si la pantalla del cliente está sirviendo o no.
 */
export async function crearPedidoOperador(
  datos: DatosPedido,
): Promise<ResultadoPedido> {
  await exigirSesion();

  const parsed = esquemaPedido.safeParse(datos);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Faltan datos del pedido.",
    };
  }
  const d = parsed.data;

  const h = await headers();

  const { data, error } = await supabaseAdmin.rpc("crear_pedido", {
    p_pedido: {
      establecimiento_id: d.establecimientoId,
      establecimiento_nuevo: d.establecimientoNuevo,
      fecha_entrega: fechaLocal(d.fechaEntrega === "manana" ? 1 : 0),
      hora_apertura: d.horaApertura,
      req_etiquetado: d.reqEtiquetado,
      notas: d.notas,
      origen: "operador",
      dispositivo: `mostrador · ${h.get("user-agent") ?? ""}`,
      items: d.items.map((i) => ({
        producto_id: i.productoId,
        cantidad: i.cantidad,
      })),
    },
  });

  if (error) {
    if (error.code === "P0001") return { ok: false, error: error.message };
    console.error("[crearPedidoOperador]", error);
    return { ok: false, error: "No se pudo guardar el pedido." };
  }

  const r = data as unknown as RespuestaCrearPedido | null;
  if (!r?.folio) {
    return { ok: false, error: "No se pudo confirmar el pedido." };
  }

  revalidatePath("/operador/pedidos");

  return {
    ok: true,
    folio: r.folio,
    establecimientoNombre: r.establecimiento_nombre,
    totalBotellas: r.total_botellas,
  };
}
