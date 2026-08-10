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

/**
 * Fecha y hora de un timestamptz, siempre en horario de Chiapas.
 *
 * La zona se pasa SIEMPRE de forma explícita. Sin ella, toLocaleString usa
 * el reloj de quien renderiza: tu máquina en desarrollo, pero UTC en el
 * servidor de Vercel. Eso mostraba las horas 6 adelantadas en producción.
 */
export function fechaHoraLegible(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: ZONA,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Versión compacta para cards y tablas: "7 ago, 3:15 p.m." */
export function fechaHoraCorta(iso: string): string {
  return new Date(iso).toLocaleString("es-MX", {
    timeZone: ZONA,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Solo la hora: "3:15 p.m." */
export function horaDeISO(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-MX", {
    timeZone: ZONA,
    hour: "numeric",
    minute: "2-digit",
  });
}
