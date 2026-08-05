import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  ConceptoGasto,
  FilaGasto,
  FilaProduccion,
  ResumenInventario,
} from "@/features/inventario/tipos";

export async function obtenerConceptos(): Promise<ConceptoGasto[]> {
  const { data, error } = await supabaseAdmin
    .from("conceptos_gasto")
    .select("id, nombre, categoria, unidad_default")
    .eq("activo", true)
    .order("categoria")
    .order("orden_visual");

  if (error)
    throw new Error(`No se pudieron cargar los conceptos: ${error.message}`);
  return data ?? [];
}

export async function obtenerResumenInventario(
  desde: string,
  hasta: string,
): Promise<ResumenInventario> {
  const { data, error } = await supabaseAdmin.rpc("resumen_inventario", {
    p_filtros: { desde, hasta },
  });

  if (error)
    throw new Error(`No se pudo calcular el resumen: ${error.message}`);
  return data as unknown as ResumenInventario;
}

export async function listarGastos(
  desde: string,
  hasta: string,
): Promise<FilaGasto[]> {
  const { data, error } = await supabaseAdmin
    .from("gastos")
    .select(
      "id, fecha, concepto_nombre, categoria, monto_centavos, cantidad, unidad, notas, creado_en",
    )
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .is("eliminado_en", null)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false })
    .limit(200);

  if (error)
    throw new Error(`No se pudieron cargar los gastos: ${error.message}`);
  return (data ?? []) as FilaGasto[];
}

export async function listarProduccion(
  desde: string,
  hasta: string,
): Promise<FilaProduccion[]> {
  const { data, error } = await supabaseAdmin
    .from("produccion")
    .select(
      "id, fecha, producto_nombre, producto_presentacion, categoria, cantidad, notas, creado_en",
    )
    .gte("fecha", desde)
    .lte("fecha", hasta)
    .is("eliminado_en", null)
    .order("fecha", { ascending: false })
    .order("creado_en", { ascending: false })
    .limit(200);

  if (error)
    throw new Error(`No se pudo cargar la producción: ${error.message}`);
  return (data ?? []) as FilaProduccion[];
}
