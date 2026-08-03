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
