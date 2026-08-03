export type EstadoPedido =
  | "recibido"
  | "pendiente_recoleccion"
  | "en_reparto"
  | "entregado"
  | "cancelado";

type Config = {
  etiqueta: string;
  color: string;
  columna: "pendientes" | "completados" | "fuera";
  /** Estado al que lleva el botón dinámico. null = fin del flujo. */
  siguiente: EstadoPedido | null;
  /** Texto del botón: nombra la acción, no el estado destino. */
  accion: string | null;
};

export const ESTADOS: Record<EstadoPedido, Config> = {
  recibido: {
    etiqueta: "Recibido",
    color: "var(--color-recibido)",
    columna: "pendientes",
    siguiente: "pendiente_recoleccion",
    accion: "Marcar preparado",
  },
  pendiente_recoleccion: {
    etiqueta: "Pendiente de recolección",
    color: "var(--color-recoleccion)",
    columna: "pendientes",
    siguiente: "en_reparto",
    accion: "Salió a reparto",
  },
  en_reparto: {
    etiqueta: "En reparto",
    color: "var(--color-reparto)",
    columna: "completados",
    siguiente: "entregado",
    accion: "Marcar entregado",
  },
  entregado: {
    etiqueta: "Entregado",
    color: "var(--color-entregado)",
    columna: "completados",
    siguiente: null,
    accion: null,
  },
  cancelado: {
    etiqueta: "Cancelado",
    color: "var(--color-alerta)",
    columna: "fuera",
    siguiente: null,
    accion: null,
  },
};

export const ORDEN_FLUJO: EstadoPedido[] = [
  "recibido",
  "pendiente_recoleccion",
  "en_reparto",
  "entregado",
];
