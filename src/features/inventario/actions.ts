"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { exigirSesion } from "@/lib/auth/sesion";

export type Resultado = { ok: true } | { ok: false; error: string };

const esquemaProduccion = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z
    .array(
      z.object({
        productoId: z.string().uuid(),
        cantidad: z.number().int().min(1).max(9999),
      }),
    )
    .min(1, "Registra al menos un producto"),
  notas: z.string().trim().max(300).default(""),
});

export async function registrarProduccion(
  datos: z.input<typeof esquemaProduccion>,
): Promise<Resultado> {
  await exigirSesion();

  const parsed = esquemaProduccion.safeParse(datos);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos incompletos.",
    };
  }
  const d = parsed.data;

  // Snapshot del catálogo: si renombras un sabor, el histórico no cambia.
  const { data: productos, error: errProd } = await supabaseAdmin
    .from("productos")
    .select("id, nombre, presentacion, categoria")
    .in(
      "id",
      d.items.map((i) => i.productoId),
    );

  if (errProd || !productos?.length) {
    return { ok: false, error: "No se pudo leer el catálogo." };
  }

  const filas = d.items
    .map((i) => {
      const p = productos.find((x) => x.id === i.productoId);
      if (!p) return null;
      return {
        fecha: d.fecha,
        producto_id: p.id,
        producto_nombre: p.nombre,
        producto_presentacion: p.presentacion,
        categoria: p.categoria,
        cantidad: i.cantidad,
        notas: d.notas || null,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (filas.length === 0)
    return { ok: false, error: "Ningún producto válido." };

  const { error } = await supabaseAdmin.from("produccion").insert(filas);
  if (error) {
    console.error("[registrarProduccion]", error);
    return { ok: false, error: "No se pudo guardar la producción." };
  }

  revalidatePath("/operador/inventario");
  return { ok: true };
}

const esquemaGasto = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  conceptoId: z.string().uuid().nullable(),
  conceptoNuevo: z.string().trim().min(2).max(60).nullable(),
  categoriaNueva: z.enum(["materia_prima", "insumo"]).nullable(),
  montoCentavos: z.number().int().min(1),
  cantidad: z.number().positive().max(99999).nullable(),
  unidad: z.string().trim().max(20).nullable(),
  notas: z.string().trim().max(300).default(""),
});

export async function registrarGasto(
  datos: z.input<typeof esquemaGasto>,
): Promise<Resultado> {
  await exigirSesion();

  const parsed = esquemaGasto.safeParse(datos);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos incompletos.",
    };
  }
  const d = parsed.data;

  let conceptoId = d.conceptoId;
  let nombre = "";
  let categoria: "materia_prima" | "insumo" = "insumo";

  if (conceptoId) {
    const { data } = await supabaseAdmin
      .from("conceptos_gasto")
      .select("id, nombre, categoria")
      .eq("id", conceptoId)
      .maybeSingle();

    if (!data) return { ok: false, error: "El concepto ya no existe." };
    nombre = data.nombre;
    categoria = data.categoria;
  } else {
    if (!d.conceptoNuevo || !d.categoriaNueva) {
      return {
        ok: false,
        error: "Elige un concepto o escribe uno nuevo con su categoría.",
      };
    }

    // Reusa si ya existe con el mismo nombre normalizado: sin esto el
    // catálogo se llena de duplicados y el desglose por concepto se rompe.
    const { data: existente } = await supabaseAdmin
      .from("conceptos_gasto")
      .select("id, nombre, categoria")
      .eq("nombre_busqueda", d.conceptoNuevo.toLowerCase())
      .maybeSingle();

    if (existente) {
      conceptoId = existente.id;
      nombre = existente.nombre;
      categoria = existente.categoria;
    } else {
      const { data: creado, error } = await supabaseAdmin
        .from("conceptos_gasto")
        .insert({
          nombre: d.conceptoNuevo,
          categoria: d.categoriaNueva,
          unidad_default: d.unidad,
          orden_visual: 900,
        })
        .select("id, nombre, categoria")
        .single();

      if (error || !creado)
        return { ok: false, error: "No se pudo crear el concepto." };
      conceptoId = creado.id;
      nombre = creado.nombre;
      categoria = creado.categoria;
    }
  }

  const { error } = await supabaseAdmin.from("gastos").insert({
    fecha: d.fecha,
    concepto_id: conceptoId,
    concepto_nombre: nombre,
    categoria,
    monto_centavos: d.montoCentavos,
    cantidad: d.cantidad,
    unidad: d.unidad,
    notas: d.notas || null,
  });

  if (error) {
    console.error("[registrarGasto]", error);
    return { ok: false, error: "No se pudo guardar el gasto." };
  }

  revalidatePath("/operador/inventario");
  return { ok: true };
}

/** Borrado suave: los errores de captura desaparecen de la vista pero el rastro queda. */
export async function eliminarMovimiento(
  tabla: "gastos" | "produccion",
  id: string,
): Promise<Resultado> {
  await exigirSesion();

  const { error } = await supabaseAdmin
    .from(tabla)
    .update({ eliminado_en: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, error: "No se pudo eliminar." };

  revalidatePath("/operador/inventario");
  return { ok: true };
}
