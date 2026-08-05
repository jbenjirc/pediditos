export type CategoriaGasto = "materia_prima" | "insumo";

export const ETIQUETA_CATEGORIA: Record<CategoriaGasto, string> = {
  materia_prima: "Materia prima",
  insumo: "Insumos",
};

export const DIAS_SEMANA = [
  "Dom",
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
] as const;

export type ConceptoGasto = {
  id: string;
  nombre: string;
  categoria: CategoriaGasto;
  unidad_default: string | null;
};

export type ResumenInventario = {
  gastos: {
    total_centavos: number;
    movimientos: number;
    por_categoria: { categoria: CategoriaGasto; total_centavos: number }[];
    por_concepto: {
      nombre: string;
      categoria: CategoriaGasto;
      total_centavos: number;
    }[];
    por_dia_semana: { dow: number; total_centavos: number }[];
  };
  produccion: {
    total_botellas: number;
    movimientos: number;
    por_producto: {
      nombre: string;
      presentacion: string | null;
      categoria: "agua" | "pulpa";
      color_hex: string | null;
      total: number;
    }[];
    por_dia_semana: { dow: number; total: number }[];
  };
};

export type FilaGasto = {
  id: string;
  fecha: string;
  concepto_nombre: string;
  categoria: CategoriaGasto;
  monto_centavos: number;
  cantidad: number | null;
  unidad: string | null;
  notas: string | null;
  creado_en: string;
};

export type FilaProduccion = {
  id: string;
  fecha: string;
  producto_nombre: string;
  producto_presentacion: string | null;
  categoria: "agua" | "pulpa";
  cantidad: number;
  notas: string | null;
  creado_en: string;
};
