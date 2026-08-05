import type { ResumenProduccion } from "@/features/archivo/queries";

/**
 * La respuesta que buscas al entrar a Archivo: cuánto se produjo de cada cosa
 * en el rango filtrado. La tabla de abajo es el respaldo, esto es el número.
 */
export function PanelProduccion({ resumen }: { resumen: ResumenProduccion }) {
  const grupos = [
    {
      titulo: "Medio litro",
      filas: resumen.productos.filter((p) => p.presentacion === "500ml"),
    },
    {
      titulo: "Un litro",
      filas: resumen.productos.filter((p) => p.presentacion === "1L"),
    },
    {
      titulo: "Pulpas",
      filas: resumen.productos.filter((p) => p.categoria === "pulpa"),
    },
  ].filter((g) => g.filas.length > 0);

  return (
    <section className="mb-6 rounded-caja border border-borde bg-superficie p-5">
      <header className="mb-4 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b-2 border-tinta pb-3">
        <h2 className="font-display text-lg font-semibold">
          Producción del periodo
        </h2>
        <p className="text-[15px] text-tinta-media">
          <span className="cifras font-bold text-tinta">{resumen.pedidos}</span>{" "}
          pedidos
          {" · "}
          <span className="cifras font-bold text-tinta">
            {resumen.botellas}
          </span>{" "}
          botellas
        </p>
      </header>

      {resumen.productos.length === 0 ? (
        <p className="py-6 text-center text-[15px] text-tinta-suave">
          No hay producción en este rango.
        </p>
      ) : (
        <div className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-tinta-suave">
                {g.titulo}
              </h3>
              <ul className="space-y-1.5">
                {g.filas.map((p, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <span
                      className="h-5 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          p.color_hex ?? "var(--color-borde-fuerte)",
                      }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-[15px]">{p.nombre}</span>
                    <span className="cifras text-lg font-semibold">
                      {p.total}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
