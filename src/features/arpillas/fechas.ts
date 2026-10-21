/**
 * Todo lo que tenga que ver con fechas pasa por aquí.
 *
 * Vercel corre en UTC. Si se llama a toLocaleString sin timeZone explícito,
 * el servidor renderiza una hora y el navegador otra, y los envíos aparecen
 * seis horas adelantados. La regla es: nunca formatear fechas fuera de este
 * archivo.
 *
 * México ya no aplica horario de verano desde 2022, así que el offset es
 * constante (-06:00). Aun así se calcula con Intl para no hardcodearlo.
 */

export const ZONA = "America/Mexico_City";

export function formatearFechaHora(valor: string | Date): string {
  return new Date(valor).toLocaleString("es-MX", {
    timeZone: ZONA,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatearFecha(valor: string | Date): string {
  return new Date(valor).toLocaleDateString("es-MX", {
    timeZone: ZONA,
    dateStyle: "medium",
  });
}

export function formatearHora(valor: string | Date): string {
  return new Date(valor).toLocaleTimeString("es-MX", {
    timeZone: ZONA,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Offset de la zona, en minutos, para un instante dado. */
function offsetMinutos(fecha: Date): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(fecha);

  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  const comoUTC = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second),
  );
  return (comoUTC - fecha.getTime()) / 60_000;
}

/** Instante ISO -> valor para <input type="datetime-local"> en hora de México. */
export function aInputLocal(valor: string | Date = new Date()): string {
  const fecha = new Date(valor);
  const desplazada = new Date(fecha.getTime() + offsetMinutos(fecha) * 60_000);
  return desplazada.toISOString().slice(0, 16);
}

/** Valor de <input type="datetime-local"> (hora de México) -> ISO en UTC. */
export function desdeInputLocal(valor: string): string {
  const [fechaStr, horaStr] = valor.split("T");
  const [anio, mes, dia] = fechaStr.split("-").map(Number);
  const [hora, minuto] = horaStr.split(":").map(Number);

  const tentativo = Date.UTC(anio, mes - 1, dia, hora, minuto);
  const offset = offsetMinutos(new Date(tentativo));
  return new Date(tentativo - offset * 60_000).toISOString();
}

/** Lunes 00:00 hora de México de la semana en curso, como ISO en UTC. */
export function inicioDeSemana(referencia: Date = new Date()): string {
  const local = aInputLocal(referencia).slice(0, 10);
  const [anio, mes, dia] = local.split("-").map(Number);
  const diaSemana = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
  const retroceso = (diaSemana + 6) % 7; // domingo = 0 -> retrocede 6
  const lunes = new Date(Date.UTC(anio, mes - 1, dia - retroceso));
  return desdeInputLocal(`${lunes.toISOString().slice(0, 10)}T00:00`);
}
