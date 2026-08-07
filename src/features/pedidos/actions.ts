"use server";

import { cookies, headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { esquemaPedido, type DatosPedido } from "@/features/pedidos/schema";
import {
  COOKIE_NEGOCIO,
  type RespuestaCrearPedido,
  type ResultadoPedido,
} from "@/features/pedidos/tipos";
import { fechaLocal } from "@/lib/fechas";

/**
 * Postgres asigna SQLSTATE P0001 a los `raise exception` sin código propio,
 * es decir, exactamente los mensajes que yo redacté para el cliente.
 * Todo lo demás (violaciones de constraint, timeouts, permisos) es interno
 * y no debe llegar a la pantalla del tendero.
 */
function mensajeSeguro(error: { code?: string; message: string }): string {
  if (error.code === "P0001") return error.message;
  console.error("[crearPedido] error inesperado:", error);
  return "No se pudo enviar el pedido. Intenta de nuevo o llama a la tienda.";
}

export async function crearPedido(
  datos: DatosPedido,
): Promise<ResultadoPedido> {
  const parsed = esquemaPedido.safeParse(datos);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Faltan datos del pedido.",
    };
  }
  const d = parsed.data;

  const h = await headers();
  const dispositivo = h.get("user-agent") ?? "";

  const { data, error } = await supabaseAdmin.rpc("crear_pedido", {
    p_pedido: {
      establecimiento_id: d.establecimientoId,
      establecimiento_nuevo: d.establecimientoNuevo,
      fecha_entrega: fechaLocal(d.fechaEntrega === "manana" ? 1 : 0),
      hora_apertura: d.horaApertura,
      req_etiquetado: d.reqEtiquetado,
      metodo_pago: d.metodoPago,
      notas: d.notas,
      origen: "cliente",
      dispositivo,
      items: d.items.map((i) => ({
        producto_id: i.productoId,
        cantidad: i.cantidad,
      })),
    },
  });

  if (error) {
    return { ok: false, error: mensajeSeguro(error) };
  }

  // La RPC devuelve Json: puede ser null y TypeScript exige pasar por unknown.
  const r = data as unknown as RespuestaCrearPedido | null;

  if (!r?.folio) {
    console.error("[crearPedido] respuesta vacía de la RPC:", data);
    return {
      ok: false,
      error: "No se pudo confirmar el pedido. Intenta de nuevo.",
    };
  }

  // Recuerda el negocio en este dispositivo: la próxima vez el paso 1 desaparece.
  // Es una preferencia, no una credencial: no da acceso a nada.
  const store = await cookies();
  store.set(COOKIE_NEGOCIO, r.establecimiento_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return {
    ok: true,
    folio: r.folio,
    establecimientoNombre: r.establecimiento_nombre,
    totalBotellas: r.total_botellas,
  };
}

export async function olvidarNegocio(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NEGOCIO);
}
