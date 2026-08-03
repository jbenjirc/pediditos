import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Umbral a partir del cual la lista de negocios muestra buscador. */
export const UMBRAL_BUSCADOR = 25;

export type Producto = {
  id: string;
  nombre: string;
  categoria: "agua" | "pulpa";
  presentacion: string | null;
  unidad: string;
  color_hex: string | null;
};

export type Establecimiento = {
  id: string;
  nombre: string;
  hora_apertura_default: string | null;
};

export async function obtenerCatalogo(): Promise<Producto[]> {
  const { data, error } = await supabaseAdmin
    .from("productos")
    .select("id, nombre, categoria, presentacion, unidad, color_hex")
    .eq("activo", true)
    .order("orden_visual");

  if (error) throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  return data ?? [];
}

export async function obtenerEstablecimientos(): Promise<Establecimiento[]> {
  const { data, error } = await supabaseAdmin
    .from("establecimientos")
    .select("id, nombre, hora_apertura_default")
    .eq("activo", true)
    .order("nombre");

  if (error)
    throw new Error(`No se pudieron cargar los negocios: ${error.message}`);
  return data ?? [];
}
