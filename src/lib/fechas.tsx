export const ZONA = "America/Mexico_City";

/** Fecha local de operación en formato YYYY-MM-DD, sin depender del reloj del navegador. */
export function fechaLocal(desplazamientoDias = 0): string {
  const ahora = new Date();
  const local = new Date(ahora.toLocaleString("en-US", { timeZone: ZONA }));
  local.setDate(local.getDate() + desplazamientoDias);
  return [
    local.getFullYear(),
    String(local.getMonth() + 1).padStart(2, "0"),
    String(local.getDate()).padStart(2, "0"),
  ].join("-");
}

export function etiquetaDia(fechaISO: string): string {
  const [a, m, d] = fechaISO.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "07:30" -> "7:30 a.m." */
export function horaLegible(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const sufijo = h < 12 ? "a.m." : "p.m.";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}
