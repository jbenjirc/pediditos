import { z } from "zod";

/**
 * Los permisos se aplican aquí, no en la UI.
 *
 * El receptor no puede tocar cantidad enviada, origen ni destino: esos campos
 * simplemente no existen en su esquema, así que aunque manipule el formulario
 * el server action los descarta. Cada rol tiene su propio esquema y ninguno
 * hereda del otro.
 */

export const CANTIDAD_MAX = 50;

const cantidad = z.coerce
  .number({ message: "Escribe una cantidad" })
  .int("Debe ser un número entero")
  .min(1, "Mínimo 1 arpilla")
  .max(CANTIDAD_MAX, `Máximo ${CANTIDAD_MAX} arpillas`);

const id = z.string().uuid("Selección inválida");
const fechaISO = z.string().datetime({ offset: true });
const notas = z.string().trim().max(300, "Máximo 300 caracteres").optional();
const evidencia = z.string().url("La foto no se subió correctamente");

// ---------------------------------------------------------------------------
// Operador de control
// ---------------------------------------------------------------------------

const envioCampos = z.object({
  fechaEnvio: fechaISO,
  cantidadArpillas: cantidad,
  origenId: id,
  destinoId: id,
  evidenciaUrl: evidencia.optional(),
  notas,
});

const origenDistintoDestino = <
  T extends { origenId: string; destinoId: string },
>(
  datos: T,
) => datos.origenId !== datos.destinoId;

const mensajeOrigenDestino = {
  message: "El origen y el destino deben ser distintos",
  path: ["destinoId"] as const,
};

/** Guardar sin confirmar: la foto todavía puede faltar. */
export const envioBorradorSchema = envioCampos.refine(
  origenDistintoDestino,
  mensajeOrigenDestino,
);

/** Confirmar el envío: la evidencia se vuelve obligatoria. */
export const envioConfirmadoSchema = envioCampos
  .extend({ evidenciaUrl: evidencia })
  .refine(origenDistintoDestino, mensajeOrigenDestino);

export const editarEnvioSchema = envioCampos
  .extend({
    id,
    version: z.coerce.number().int().positive(),
  })
  .refine(origenDistintoDestino, mensajeOrigenDestino);

export const ajusteInventarioSchema = z.object({
  ubicacionId: id,
  // Aquí sí se admite negativo: es el único movimiento manual.
  cantidad: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, "El ajuste no puede ser cero")
    .refine((n) => Math.abs(n) <= CANTIDAD_MAX, "Ajuste demasiado grande"),
  motivo: z.string().trim().min(5, "Explica el motivo del ajuste").max(300),
});

// ---------------------------------------------------------------------------
// Receptor
// ---------------------------------------------------------------------------

export const recepcionSchema = z.object({
  envioId: id,
  version: z.coerce.number().int().positive(),
  // Puede ser 0: llegó el camión y no traía nada utilizable.
  cantidadRecibida: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .max(CANTIDAD_MAX, `Máximo ${CANTIDAD_MAX} arpillas`),
  evidenciaUrl: evidencia, // obligatoria siempre para el receptor
  notas,
});

export const ventaSchema = z.object({
  clienteId: id,
  fechaVenta: fechaISO,
  cantidadArpillas: cantidad,
  precioUnitario: z.coerce.number().nonnegative().optional(),
  notas,
  // ubicacionId NO va aquí: sale de la sesión del receptor, no del formulario.
});

export const clienteSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre").max(80),
  ciudad: z.string().trim().max(80).optional(),
  telefono: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Deben ser 10 dígitos")
    .optional()
    .or(z.literal("")),
});

// ---------------------------------------------------------------------------

export type EnvioBorrador = z.infer<typeof envioBorradorSchema>;
export type EnvioConfirmado = z.infer<typeof envioConfirmadoSchema>;
export type EditarEnvio = z.infer<typeof editarEnvioSchema>;
export type Recepcion = z.infer<typeof recepcionSchema>;
export type Venta = z.infer<typeof ventaSchema>;
export type AjusteInventario = z.infer<typeof ajusteInventarioSchema>;

export const ESTADOS = [
  "borrador",
  "enviado",
  "recibido",
  "cancelado",
] as const;
export type Estado = (typeof ESTADOS)[number];

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  recibido: "Recibido",
  cancelado: "Cancelado",
};
