import type { InventarioUbicacion } from "../consultas";
import { formatearFechaHora } from "../fechas";

interface PanelInventarioProps {
  inventario: InventarioUbicacion[];
  titulo?: string;
  subtitulo?: string;
}

/**
 * Tarjetas de inventario en tiempo real por cada bodega y sucursal.
 */
export function PanelInventario({
  inventario,
  titulo = "Existencias por Ubicación",
  subtitulo = "Balance neto derivado de movimientos, envíos y ventas.",
}: PanelInventarioProps) {
  if (inventario.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-neutral-500">
          No hay ubicaciones registradas con inventario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(titulo || subtitulo) && (
        <div>
          {titulo && (
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">
              {titulo}
            </h2>
          )}
          {subtitulo && (
            <p className="text-xs text-neutral-500">{subtitulo}</p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inventario.map((item) => {
          const tieneStock = item.existencia > 0;
          const esCritico = item.existencia === 0;

          return (
            <div
              key={item.ubicacion_id}
              className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900">
                      {item.ubicacion}
                    </h3>
                    {item.ciudad && (
                      <span className="inline-block text-xs font-medium text-neutral-400">
                        📍 {item.ciudad}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      tieneStock
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : esCritico
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {tieneStock ? "Disponible" : "Sin Stock"}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
                    {item.existencia}
                  </span>
                  <span className="text-sm font-medium text-neutral-500">
                    arpillas
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
                {item.ultimo_movimiento ? (
                  <span>
                    Último mov: {formatearFechaHora(item.ultimo_movimiento)}
                  </span>
                ) : (
                  <span>Sin movimientos recientes</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
