"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirSesion } from "@/lib/auth/sesion";
import { ESTADOS, type EstadoPedido } from "@/features/pedidos/estados";

export type ResultadoAccion = { ok: true } | { ok: false; error: string };

/**
 * Avanza el pedido al siguiente estado del flujo.
 *
 * Concurrencia optimista: el update exige que `estado` siga siendo el que el
 * operador tenía en pantalla. Si otra tablet ya lo movió, no afecta ninguna
 * fila y avisamos en vez de sobrescribir en silencio. Sin esto, dos toques
 * casi simultáneos pueden retroceder un pedido sin que nadie se entere.
 */
export async function avanzarEstado(
  pedidoId: string,
  estadoVisto: EstadoPedido,
): Promise<ResultadoAccion> {
  await exigirSesion();

  const siguiente = ESTADOS[estadoVisto]?.siguiente;
  if (!siguiente) {
    return { ok: false, error: "Este pedido ya está en su último estado." };
  }

  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .update({ estado: siguiente })
    .eq("id", pedidoId)
    .eq("estado", estadoVisto)
    .is("eliminado_en", null)
    .select("id");

  if (error) {
    console.error("[avanzarEstado]", error);
    return { ok: false, error: "No se pudo actualizar. Intenta de nuevo." };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error: "Otra persona ya cambió este pedido. Se actualizó la pantalla.",
    };
  }

  revalidatePath("/operador/pedidos");
  return { ok: true };
}

/** Deshace el último cambio de estado. El error humano es más común que el técnico. */
export async function retrocederEstado(
  pedidoId: string,
  estadoVisto: EstadoPedido,
): Promise<ResultadoAccion> {
  await exigirSesion();

  const anterior: Partial<Record<EstadoPedido, EstadoPedido>> = {
    pendiente_recoleccion: "recibido",
    en_reparto: "pendiente_recoleccion",
    entregado: "en_reparto",
  };

  const destino = anterior[estadoVisto];
  if (!destino) {
    return { ok: false, error: "Este pedido no se puede regresar." };
  }

  const { data, error } = await supabaseAdmin
    .from("pedidos")
    .update({ estado: destino })
    .eq("id", pedidoId)
    .eq("estado", estadoVisto)
    .is("eliminado_en", null)
    .select("id");

  if (error || !data?.length) {
    return { ok: false, error: "No se pudo regresar el pedido." };
  }

  revalidatePath("/operador/pedidos");
  return { ok: true };
}

/** Lo saca del tablero pero lo conserva en Archivo. */
export async function archivarPedido(
  pedidoId: string,
): Promise<ResultadoAccion> {
  await exigirSesion();

  const { error } = await supabaseAdmin
    .from("pedidos")
    .update({ archivado_en: new Date().toISOString() })
    .eq("id", pedidoId);

  if (error) return { ok: false, error: "No se pudo archivar." };

  revalidatePath("/operador/pedidos");
  return { ok: true };
}

/**
 * Borrado suave. El pedido deja de existir para la app pero la fila permanece:
 * si mañana alguien reclama un pedido "que nunca llegó", ahí está el registro.
 */
export async function eliminarPedido(
  pedidoId: string,
): Promise<ResultadoAccion> {
  await exigirSesion();

  const { error } = await supabaseAdmin
    .from("pedidos")
    .update({ eliminado_en: new Date().toISOString(), estado: "cancelado" })
    .eq("id", pedidoId);

  if (error) return { ok: false, error: "No se pudo eliminar." };

  revalidatePath("/operador/pedidos");
  return { ok: true };
}
