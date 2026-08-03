type Segmento = { color: string | null; cantidad: number; nombre: string };

/**
 * Firma visual de la app: una barra de segmentos proporcional al pedido.
 * Permite reconocer un pedido de un vistazo, sin leer. Se usa igual en el
 * resumen del cliente y en las cards del operador.
 */
export function CintaSabores({
  segmentos,
  alto = 8,
}: {
  segmentos: Segmento[];
  alto?: number;
}) {
  const activos = segmentos.filter((s) => s.cantidad > 0);
  const total = activos.reduce((a, s) => a + s.cantidad, 0);

  if (total === 0) {
    return (
      <div
        className="w-full rounded-full bg-borde"
        style={{ height: alto }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="flex w-full overflow-hidden rounded-full"
      style={{ height: alto }}
      role="img"
      aria-label={activos.map((s) => `${s.nombre}: ${s.cantidad}`).join(", ")}
    >
      {activos.map((s, i) => (
        <span
          key={i}
          style={{
            width: `${(s.cantidad / total) * 100}%`,
            backgroundColor: s.color ?? "var(--color-tinta-suave)",
          }}
        />
      ))}
    </div>
  );
}
