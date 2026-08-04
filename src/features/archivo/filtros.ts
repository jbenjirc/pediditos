import type { EstadoPedido } from "@/features/pedidos/estados";
import { fechaLocal } from "@/lib/fechas";

export const POR_PAGINA = 50;

export type FiltrosArchivo = {
  desde: string;
  hasta: string;
  establecimientoId: string | null;
  estado: EstadoPedido | null;
  etiquetado: boolean | null;
  origen: "cliente" | "operador" | null;
  incluirEliminados: boolean;
  folio: string;
  pagina: number;
};

const ESTADOS_VALIDOS = [
  "recibido",
  "pendiente_recoleccion",
  "en_reparto",
  "entregado",
  "cancelado",
];

/** Resta días a una fecha YYYY-MM-DD sin salirse de la zona local. */
export function restarDias(fechaISO: string, dias: number): string {
  const [a, m, d] = fechaISO.split("-").map(Number);
  const f = new Date(a, m - 1, d);
  f.setDate(f.getDate() - dias);
  return [
    f.getFullYear(),
    String(f.getMonth() + 1).padStart(2, "0"),
    String(f.getDate()).padStart(2, "0"),
  ].join("-");
}

export function primerDiaDelMes(fechaISO: string): string {
  return fechaISO.slice(0, 8) + "01";
}

/** Los filtros viven en la URL; esto los normaliza a algo confiable. */
export function leerFiltros(
  sp: Record<string, string | undefined>,
): FiltrosArchivo {
  const hoy = fechaLocal();
  const esFecha = (v?: string) =>
    v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;

  const desde = esFecha(sp.desde) ?? restarDias(hoy, 6);
  const hasta = esFecha(sp.hasta) ?? hoy;

  const estado = ESTADOS_VALIDOS.includes(sp.estado ?? "")
    ? (sp.estado as EstadoPedido)
    : null;

  const origen =
    sp.origen === "cliente" || sp.origen === "operador" ? sp.origen : null;

  const etiquetado =
    sp.etiquetado === "1" ? true : sp.etiquetado === "0" ? false : null;

  const pagina = Math.max(1, Number(sp.pagina) || 1);

  return {
    // Si el rango viene invertido, lo enderezamos en vez de devolver vacío.
    desde: desde <= hasta ? desde : hasta,
    hasta: desde <= hasta ? hasta : desde,
    establecimientoId: sp.establecimiento || null,
    estado,
    etiquetado,
    origen,
    incluirEliminados: sp.eliminados === "1",
    folio: (sp.folio ?? "").trim(),
    pagina,
  };
}

export function aParams(f: Partial<FiltrosArchivo>): URLSearchParams {
  const p = new URLSearchParams();
  if (f.desde) p.set("desde", f.desde);
  if (f.hasta) p.set("hasta", f.hasta);
  if (f.establecimientoId) p.set("establecimiento", f.establecimientoId);
  if (f.estado) p.set("estado", f.estado);
  if (f.origen) p.set("origen", f.origen);
  if (f.etiquetado === true) p.set("etiquetado", "1");
  if (f.etiquetado === false) p.set("etiquetado", "0");
  if (f.incluirEliminados) p.set("eliminados", "1");
  if (f.folio) p.set("folio", f.folio);
  if (f.pagina && f.pagina > 1) p.set("pagina", String(f.pagina));
  return p;
}
