"use server";

import { supabaseAdmin } from "../db";
import { randomUUID } from "node:crypto";

export type ResultadoSubidaEvidencia =
  | { exito: true; url: string }
  | { exito: false; error: string };

const BUCKET = "arp-evidencias";
const MAX_TAMANO_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Server Action para subir fotos de evidencia tomadas desde el celular.
 * Sube al bucket público `arp-evidencias` y devuelve la URL final.
 */
export async function subirEvidenciaAccion(
  formData: FormData,
): Promise<ResultadoSubidaEvidencia> {
  try {
    const archivo = formData.get("archivo") as File | null;
    if (!archivo || archivo.size === 0) {
      return { exito: false, error: "No se seleccionó ningún archivo de imagen." };
    }

    if (archivo.size > MAX_TAMANO_BYTES) {
      return {
        exito: false,
        error: "La imagen es demasiado pesada. Máximo permitido: 8 MB.",
      };
    }

    if (!archivo.type.startsWith("image/")) {
      return {
        exito: false,
        error: "El archivo seleccionado debe ser una imagen (JPG, PNG, WebP).",
      };
    }

    const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const nombreArchivo = `${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`;
    const buffer = Buffer.from(await archivo.arrayBuffer());

    const { error: errorSubida } = await supabaseAdmin()
      .storage.from(BUCKET)
      .upload(nombreArchivo, buffer, {
        contentType: archivo.type,
        upsert: false,
      });

    if (errorSubida) {
      console.error("Error al subir archivo a Storage:", errorSubida);
      return {
        exito: false,
        error: `Error al almacenar evidencia: ${errorSubida.message}`,
      };
    }

    const { data: urlData } = supabaseAdmin()
      .storage.from(BUCKET)
      .getPublicUrl(nombreArchivo);

    if (!urlData?.publicUrl) {
      return { exito: false, error: "No se pudo generar la URL pública." };
    }

    return { exito: true, url: urlData.publicUrl };
  } catch (err) {
    console.error("Excepción al procesar evidencia:", err);
    return { exito: false, error: "Ocurrió un error inesperado al subir la foto." };
  }
}
