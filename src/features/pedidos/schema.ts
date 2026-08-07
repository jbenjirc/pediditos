import { z } from "zod";

export const esquemaPedido = z
  .object({
    establecimientoId: z.string().uuid().nullable(),
    establecimientoNuevo: z.string().trim().min(3).max(80).nullable(),
    fechaEntrega: z.enum(["hoy", "manana"]),
    horaApertura: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora no válida"),
    items: z
      .array(
        z.object({
          productoId: z.string().uuid(),
          cantidad: z.number().int().min(1).max(999),
        }),
      )
      .min(1, "Agrega al menos un producto"),
    reqEtiquetado: z.boolean(),
    // El cliente NO puede mandar "mixto": la validación es aquí, en el
    // servidor, no en la interfaz. Una petición manipulada se rechaza.
    metodoPago: z.enum(["efectivo", "transferencia"]),
    notas: z.string().trim().max(500).default(""),
  })
  .refine(
    (d) => d.establecimientoId !== null || d.establecimientoNuevo !== null,
    {
      message: "Elige un negocio o escribe su nombre",
      path: ["establecimientoId"],
    },
  );

export type DatosPedido = z.infer<typeof esquemaPedido>;

/** El operador sí puede asignar "mixto", porque corrige después del hecho. */
export const esquemaPedidoOperador = z
  .object({
    establecimientoId: z.string().uuid().nullable(),
    establecimientoNuevo: z.string().trim().min(3).max(80).nullable(),
    fechaEntrega: z.enum(["hoy", "manana"]),
    horaApertura: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora no válida"),
    items: z
      .array(
        z.object({
          productoId: z.string().uuid(),
          cantidad: z.number().int().min(1).max(999),
        }),
      )
      .min(1, "Agrega al menos un producto"),
    reqEtiquetado: z.boolean(),
    metodoPago: z.enum(["efectivo", "transferencia", "mixto"]),
    notas: z.string().trim().max(500).default(""),
  })
  .refine(
    (d) => d.establecimientoId !== null || d.establecimientoNuevo !== null,
    {
      message: "Elige un negocio o escribe su nombre",
      path: ["establecimientoId"],
    },
  );

export type DatosPedidoOperador = z.infer<typeof esquemaPedidoOperador>;
