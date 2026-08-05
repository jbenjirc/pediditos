/**
 * El dinero vive en centavos como entero en toda la app. Estas funciones son
 * la única frontera con los pesos que ve el usuario.
 */

export function aCentavos(pesos: string): number | null {
  const limpio = pesos.replace(/[^\d.]/g, "");
  if (limpio === "") return null;
  const n = Number(limpio);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

export function aPesos(centavos: number): string {
  return (centavos / 100).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });
}

/** Sin decimales, para totales grandes en los paneles. */
export function aPesosCorto(centavos: number): string {
  return (centavos / 100).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}
