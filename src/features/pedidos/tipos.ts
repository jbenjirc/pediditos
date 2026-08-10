export type ResultadoPedido =
  | {
      ok: true;
      folio: string;
      establecimientoNombre: string;
      totalBotellas: number;
      creadoEn: string;
    }
  | { ok: false; error: string };

/** Forma que devuelve la función crear_pedido de Postgres. */
export type RespuestaCrearPedido = {
  folio: string;
  pedido_id: string;
  establecimiento_id: string;
  establecimiento_nombre: string;
  total_botellas: number;
  creado_en: string;
};

export const COOKIE_NEGOCIO = "ultimo_negocio";
