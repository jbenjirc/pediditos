import { aPesos, aPesosCorto } from "@/lib/dinero";
import {
  DIAS_SEMANA,
  ETIQUETA_CATEGORIA,
  type ResumenInventario,
} from "@/features/inventario/tipos";
import { SelectorPeriodo } from "./selector-periodo";

/**
 * Barras en CSS puro. El alto fijo vive en la pista, nunca en el contenedor:
 * si se fija el contenedor, las etiquetas de arriba y abajo lo desbordan.
 */
function Barras({
  datos,
  formato,
  color = "var(--color-acento)",
}: {
  datos: { dow: number; valor: number }[];
  formato: (n: number) => string;
  color?: string;
}) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  const porDia = DIAS_SEMANA.map(
    (_, i) => datos.find((d) => d.dow === i)?.valor ?? 0,
  );

  return (
    <div className="flex gap-1.5">
      {porDia.map((v, i) => (
        <div
          key={i}
          className="flex min-w-0 flex-1 flex-col items-center gap-1"
        >
          <span className="w-full truncate text-center text-[11px] text-tinta-suave">
            {v > 0 ? formato(v) : "\u00a0"}
          </span>
          <div className="flex h-16 w-full items-end">
            <div
              className="w-full rounded-t"
              style={{
                height: `${Math.max(v > 0 ? 4 : 2, (v / max) * 64)}px`,
                backgroundColor: color,
                opacity: v > 0 ? 1 : 0.15,
              }}
              role="img"
              aria-label={`${DIAS_SEMANA[i]}: ${formato(v)}`}
            />
          </div>
          <span className="text-xs text-tinta-suave">{DIAS_SEMANA[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Bloque({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-2.5 text-sm font-medium uppercase tracking-wide text-tinta-suave">
        {titulo}
      </h3>
      {children}
    </div>
  );
}

export function FiltrosYConteo({
  resumen,
  desde,
  hasta,
  hoy,
}: {
  resumen: ResumenInventario;
  desde: string;
  hasta: string;
  hoy: string;
}) {
  const { gastos, produccion } = resumen;
  const top = gastos.por_concepto.slice(0, 6);
  const maxConcepto = Math.max(1, ...top.map((c) => c.total_centavos));
  const vacio = gastos.movimientos === 0 && produccion.movimientos === 0;

  return (
    <section className="mb-6 min-w-0 overflow-hidden rounded-caja border border-borde bg-superficie p-5">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <SelectorPeriodo desde={desde} hasta={hasta} hoy={hoy} />

        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <p>
            <span className="cifras text-2xl font-bold">
              {aPesos(gastos.total_centavos)}
            </span>
            <span className="ml-2 text-[15px] text-tinta-media">gastado</span>
          </p>
          <p>
            <span className="cifras text-2xl font-bold">
              {produccion.total_botellas}
            </span>
            <span className="ml-2 text-[15px] text-tinta-media">
              botellas producidas
            </span>
          </p>
          <p className="text-[15px] text-tinta-suave">
            <span className="cifras">
              {gastos.movimientos + produccion.movimientos}
            </span>{" "}
            movimientos
          </p>
        </div>
      </div>

      {vacio ? (
        <p className="border-t border-borde pt-6 text-center text-[15px] text-tinta-suave">
          No hay movimientos registrados en este periodo.
        </p>
      ) : (
        <div className="mt-6 grid gap-x-8 gap-y-6 border-t border-borde pt-5 lg:grid-cols-3">
          <Bloque titulo="En qué se fue">
            {top.length === 0 ? (
              <p className="text-[15px] text-tinta-suave">Sin gastos.</p>
            ) : (
              <>
                <ul className="space-y-1.5">
                  {top.map((c) => (
                    <li
                      key={c.nombre}
                      className="flex min-w-0 items-center gap-2.5"
                    >
                      <span
                        className="w-20 shrink-0 truncate text-[15px]"
                        title={c.nombre}
                      >
                        {c.nombre}
                      </span>
                      <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-elevado">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${(c.total_centavos / maxConcepto) * 100}%`,
                            backgroundColor:
                              c.categoria === "materia_prima"
                                ? "var(--color-acento)"
                                : "var(--color-reparto)",
                          }}
                        />
                      </span>
                      <span className="cifras w-20 shrink-0 text-right text-sm font-medium">
                        {aPesos(c.total_centavos)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-tinta-media">
                  {gastos.por_categoria.map((c) => (
                    <span key={c.categoria}>
                      {ETIQUETA_CATEGORIA[c.categoria]}:{" "}
                      <span className="cifras font-medium text-tinta">
                        {aPesos(c.total_centavos)}
                      </span>
                    </span>
                  ))}
                </p>
              </>
            )}
          </Bloque>

          <Bloque titulo="Gasto por día de la semana">
            <Barras
              datos={gastos.por_dia_semana.map((d) => ({
                dow: d.dow,
                valor: d.total_centavos,
              }))}
              formato={aPesosCorto}
            />
          </Bloque>

          <Bloque titulo="Botellas por día de la semana">
            <Barras
              datos={produccion.por_dia_semana.map((d) => ({
                dow: d.dow,
                valor: d.total,
              }))}
              formato={(n) => String(n)}
              color="var(--color-reparto)"
            />
          </Bloque>
        </div>
      )}

      {produccion.por_producto.length > 0 && (
        <div className="mt-6 border-t border-borde pt-5">
          <h3 className="mb-2.5 text-sm font-medium uppercase tracking-wide text-tinta-suave">
            Producción por sabor
          </h3>
          <ul className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-4">
            {produccion.por_producto.map((p, i) => (
              <li key={i} className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-5 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: p.color_hex ?? "var(--color-borde-fuerte)",
                  }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-[15px]">
                  {p.categoria === "pulpa" ? "Pulpa " : ""}
                  {p.nombre}
                  {p.presentacion && (
                    <span className="text-tinta-suave">
                      {" "}
                      · {p.presentacion}
                    </span>
                  )}
                </span>
                <span className="cifras font-semibold">{p.total}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
