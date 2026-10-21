"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../db";
import { exigirSesion } from "../sesion";
import { ventaSchema, clienteSchema } from "../schemas";
import { mensajeDeError } from "../errores";

export type EstadoAccionVenta = {
  exito?: boolean;
  error?: string | null;
  folio?: string;
};

/**
 * Registra una venta en mostrador o ruta desde la sesión del receptor.
 * Descuenta atómicamente el inventario local llamando a arp_registrar_venta.
 * Redirige a /receptor/ticket/[folio] al completarse.
 */
export async function registrarVentaAccion(
  _previo: EstadoAccionVenta,
  formData: FormData,
): Promise<EstadoAccionVenta> {
  const sesion = await exigirSesion("receptor");

  const datosRaw = {
    clienteId: formData.get("clienteId"),
    fechaVenta: formData.get("fechaVenta"),
    cantidadArpillas: formData.get("cantidadArpillas"),
    precioUnitario: formData.get("precioUnitario") || undefined,
    notas: formData.get("notas") || undefined,
  };

  const validacion = ventaSchema.safeParse(datosRaw);
  if (!validacion.success) {
    const primerError = validacion.error.issues[0]?.message ?? "Datos inválidos";
    return { exito: false, error: primerError };
  }

  const datos = validacion.data;
  let folioRedireccion: string | null = null;

  try {
    const { data: venta, error } = await supabaseAdmin().rpc(
      "arp_registrar_venta",
      {
        p_cliente_id: datos.clienteId,
        p_ubicacion_id: sesion.ubicacionId!,
        p_cantidad: datos.cantidadArpillas,
        p_fecha: datos.fechaVenta,
        p_precio_unitario: datos.precioUnitario ?? undefined,
        p_notas: datos.notas || undefined,
        p_usuario_id: undefined,
      },
    );

    if (error) {
      console.error("Error al registrar venta:", error);
      return { exito: false, error: mensajeDeError(error) };
    }

    folioRedireccion = (venta as { folio?: string })?.folio ?? null;

    revalidatePath("/receptor");
    revalidatePath("/control");
  } catch (err: unknown) {
    // Si ya es un redirect de Next.js, volver a lanzarlo
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    console.error("Excepción en registrarVentaAccion:", err);
    return {
      exito: false,
      error: "No se pudo completar el registro de la venta.",
    };
  }

  if (folioRedireccion) {
    redirect(`/receptor/ticket/${folioRedireccion}`);
  }

  return { exito: true };
}

/**
 * Cancela una venta registrada y revierte el inventario mediante arp_cancelar_venta.
 */
export async function cancelarVentaAccion({
  ventaId,
  motivo,
}: {
  ventaId: string;
  motivo: string;
}): Promise<EstadoAccionVenta> {
  await exigirSesion("receptor");

  try {
    const { data: ventaCancelada, error } = await supabaseAdmin().rpc(
      "arp_cancelar_venta",
      {
        p_venta_id: ventaId,
        p_motivo: motivo || "Cancelación por solicitud de operador",
        p_usuario_id: undefined,
      },
    );

    if (error) {
      return { exito: false, error: mensajeDeError(error) };
    }

    revalidatePath("/receptor");
    revalidatePath("/control");

    return {
      exito: true,
      error: null,
      folio: (ventaCancelada as { folio?: string })?.folio,
    };
  } catch (err) {
    console.error("Error en cancelarVentaAccion:", err);
    return { exito: false, error: "No se pudo cancelar la venta." };
  }
}

/**
 * Permite registrar un cliente rápido directamente desde el flujo de venta.
 */
export async function registrarClienteRapidoAccion(
  formData: FormData,
): Promise<{ exito: boolean; clienteId?: string; error?: string }> {
  await exigirSesion("receptor");

  const datosRaw = {
    nombre: formData.get("nombre"),
    ciudad: formData.get("ciudad") || undefined,
    telefono: formData.get("telefono") || undefined,
  };

  const validacion = clienteSchema.safeParse(datosRaw);
  if (!validacion.success) {
    return {
      exito: false,
      error: validacion.error.issues[0]?.message ?? "Datos de cliente inválidos",
    };
  }

  const { data, error } = await supabaseAdmin()
    .from("arp_clientes")
    .insert({
      nombre: validacion.data.nombre,
      ciudad: validacion.data.ciudad ?? "Local",
      telefono: validacion.data.telefono ?? null,
      activo: true,
    })
    .select("id")
    .single();

  if (error) {
    return { exito: false, error: "No se pudo registrar el cliente." };
  }

  return { exito: true, clienteId: data.id };
}
