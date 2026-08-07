export type MetodoPago = "efectivo" | "transferencia" | "mixto";

export const METODOS_PAGO: Record<
  MetodoPago,
  { etiqueta: string; corto: string; color: string }
> = {
  efectivo: {
    etiqueta: "Efectivo",
    corto: "Efectivo",
    color: "var(--color-entregado)",
  },
  transferencia: {
    etiqueta: "Transferencia",
    corto: "Transf.",
    color: "var(--color-reparto)",
  },
  mixto: {
    etiqueta: "Mixto",
    corto: "Mixto",
    color: "var(--color-recoleccion)",
  },
};

/**
 * Lo que el cliente puede elegir. "Mixto" queda fuera a propósito: describe
 * cómo terminó pagándose, un hecho que solo se conoce en la entrega.
 */
export const METODOS_CLIENTE = ["efectivo", "transferencia"] as const;

/** Se deriva de la lista de arriba: si cambia una, cambia el tipo. */
export type MetodoPagoCliente = (typeof METODOS_CLIENTE)[number];

/** Lo que el operador puede asignar, incluido el corregir a mixto. */
export const METODOS_OPERADOR = ["efectivo", "transferencia", "mixto"] as const;
