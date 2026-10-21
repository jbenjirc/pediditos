"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../db";
import { exigirSesion } from "../sesion";
import { recepcionSchema } from "../schemas";
import { mensajeDeError } from "../errores";

export type EstadoAccionRecepcion = {
  exito?: boolean;
  error?: string | null;
  folio?: string;
};

/**
 * Confirmación de recepción de un envío en sucursal destino.
 * Ejecuta atómicamente la función RPC arp_confirmar_recepcion,
 * actualizando el estado y sumando el inventario recibido.
 */
export async function confirmarRecepcionAccion(
  _previo: EstadoAccionRecepcion,
  formData: FormData,
): Promise<EstadoAccionRecepcion> {
  const sesion = await exigirSesion("receptor");

  const datosRaw = {
    envioId: formData.get("envioId"),
    version: formData.get("version"),
    cantidadRecibida: formData.get("cantidadRecibida"),
    evidenciaUrl: formData.get("evidenciaUrl") || undefined,
    notas: formData.get("notas") || undefined,
  };

  const validacion = recepcionSchema.safeParse(datosRaw);
  if (!validacion.success) {
    const primerError = validacion.error.issues[0]?.message ?? "Datos inválidos";
    return { exito: false, error: primerError };
  }

  const datos = validacion.data;

  try {
    // Verificación de seguridad: el envío debe corresponder a la ubicación de la sesión
    const { data: envio, error: errorEnvio } = await supabaseAdmin()
      .from("arp_envios")
      .select("id, folio, destino_id, version, estado")
      .eq("id", datos.envioId)
      .maybeSingle();

    if (errorEnvio || !envio) {
      return { exito: false, error: "El envío no existe." };
    }

    if (envio.destino_id !== sesion.ubicacionId) {
      return {
        exito: false,
        error: "No tienes permiso para recibir envíos destinados a otra sucursal.",
      };
    }

    if (envio.estado !== "enviado") {
      return {
        exito: false,
        error: `Este envío no está en tránsito (estatus actual: ${envio.estado}).`,
      };
    }

    // Invocación atómica del RPC
    const { data: envioConfirmado, error: errorRpc } = await supabaseAdmin().rpc(
      "arp_confirmar_recepcion",
      {
        p_envio_id: datos.envioId,
        p_version: datos.version,
        p_cantidad_recibida: datos.cantidadRecibida,
        p_evidencia_url: datos.evidenciaUrl,
        p_notas: datos.notas || undefined,
        p_usuario_id: undefined,
      },
    );

    if (errorRpc) {
      console.error("Error al ejecutar arp_confirmar_recepcion:", errorRpc);
      return { exito: false, error: mensajeDeError(errorRpc) };
    }

    revalidatePath("/receptor");
    revalidatePath("/control");
    revalidatePath("/control/envios");

    return {
      exito: true,
      error: null,
      folio: envioConfirmado ? (envioConfirmado as { folio?: string }).folio : envio.folio,
    };
  } catch (err) {
    console.error("Excepción en confirmarRecepcionAccion:", err);
    return {
      exito: false,
      error: "Ocurrió un error inesperado al confirmar la recepción.",
    };
  }
}
