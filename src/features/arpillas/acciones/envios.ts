"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "../db";
import { exigirSesion } from "../sesion";
import {
  envioBorradorSchema,
  envioConfirmadoSchema,
  type Estado,
} from "../schemas";
import { mensajeDeError } from "../errores";

export type EstadoAccionEnvio = {
  exito?: boolean;
  error?: string | null;
  folio?: string;
};

/**
 * Crea un nuevo envío de arpillas desde el panel de Control.
 * Puede guardarse como 'borrador' o marcarse directamente como 'enviado' (en camino).
 */
export async function crearEnvioAccion(
  _previo: EstadoAccionEnvio,
  formData: FormData,
): Promise<EstadoAccionEnvio> {
  await exigirSesion("control");

  const esConfirmado = formData.get("tipoAccion") === "enviar";

  const datosRaw = {
    fechaEnvio: formData.get("fechaEnvio"),
    cantidadArpillas: formData.get("cantidadArpillas"),
    origenId: formData.get("origenId"),
    destinoId: formData.get("destinoId"),
    evidenciaUrl: formData.get("evidenciaUrl") || undefined,
    notas: formData.get("notas") || undefined,
  };

  const schema = esConfirmado ? envioConfirmadoSchema : envioBorradorSchema;
  const validacion = schema.safeParse(datosRaw);

  if (!validacion.success) {
    const primerError = validacion.error.issues[0]?.message ?? "Datos inválidos";
    return { exito: false, error: primerError };
  }

  const datos = validacion.data;

  try {
    const { data: nuevoEnvio, error } = await supabaseAdmin()
      .from("arp_envios")
      .insert({
        origen_id: datos.origenId,
        destino_id: datos.destinoId,
        cantidad_arpillas: datos.cantidadArpillas,
        fecha_envio: datos.fechaEnvio,
        evidencia_url: datos.evidenciaUrl ?? null,
        notas: datos.notas ?? null,
        estado: (esConfirmado ? "enviado" : "borrador") as Estado,
      })
      .select("id, folio")
      .single();

    if (error) {
      console.error("Error al insertar envío:", error);
      return { exito: false, error: mensajeDeError(error) };
    }

    revalidatePath("/control");
    revalidatePath("/control/envios");
    revalidatePath("/receptor");

    return { exito: true, error: null, folio: nuevoEnvio.folio };
  } catch (err) {
    console.error("Excepción en crearEnvioAccion:", err);
    return {
      exito: false,
      error: "Ocurrió un error inesperado al procesar el envío.",
    };
  }
}

/**
 * Transiciona el estado de un envío (e.g. de 'borrador' a 'enviado').
 * Respeta concurrencia optimista comparando la versión previa.
 */
export async function despacharEnvioAccion({
  envioId,
  version,
  evidenciaUrl,
}: {
  envioId: string;
  version: number;
  evidenciaUrl?: string;
}): Promise<EstadoAccionEnvio> {
  await exigirSesion("control");

  try {
    const payload: {
      estado: Estado;
      evidencia_url?: string;
    } = {
      estado: "enviado",
    };

    if (evidenciaUrl) {
      payload.evidencia_url = evidenciaUrl;
    }

    const { data, error } = await supabaseAdmin()
      .from("arp_envios")
      .update(payload)
      .eq("id", envioId)
      .eq("version", version)
      .select("id, folio")
      .maybeSingle();

    if (error) {
      return { exito: false, error: mensajeDeError(error) };
    }

    if (!data) {
      return {
        exito: false,
        error: "Conflicto de versión. El envío fue modificado previamente.",
      };
    }

    revalidatePath("/control");
    revalidatePath("/control/envios");
    revalidatePath("/receptor");

    return { exito: true, error: null, folio: data.folio };
  } catch (err) {
    console.error("Error en despacharEnvioAccion:", err);
    return { exito: false, error: "No se pudo actualizar el envío." };
  }
}

/**
 * Cancela un envío que aún no ha sido recibido.
 */
export async function cancelarEnvioAccion({
  envioId,
  version,
}: {
  envioId: string;
  version: number;
}): Promise<EstadoAccionEnvio> {
  await exigirSesion("control");

  try {
    const { data, error } = await supabaseAdmin()
      .from("arp_envios")
      .update({ estado: "cancelado" })
      .eq("id", envioId)
      .eq("version", version)
      .select("id, folio")
      .maybeSingle();

    if (error) {
      return { exito: false, error: mensajeDeError(error) };
    }

    if (!data) {
      return {
        exito: false,
        error: "Conflicto de versión al cancelar.",
      };
    }

    revalidatePath("/control");
    revalidatePath("/control/envios");
    revalidatePath("/receptor");

    return { exito: true, error: null, folio: data.folio };
  } catch (err) {
    console.error("Error en cancelarEnvioAccion:", err);
    return { exito: false, error: "No se pudo cancelar el envío." };
  }
}
