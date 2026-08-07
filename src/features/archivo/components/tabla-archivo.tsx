import Link from "next/link";
import { ESTADOS } from "@/features/pedidos/estados";
import { METODOS_PAGO } from "@/features/pedidos/metodos-pago";
import type { FilaArchivo } from "@/features/archivo/queries";
import {
  POR_PAGINA,
  aParams,
  type FiltrosArchivo,
} from "@/features/archivo/filtros";

function fechaCorta(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

export function TablaArchivo({
  filas,
  total,
  filtros,
}: {
  filas: FilaArchivo[];
  total: number;
  filtros: FiltrosArchivo;
}) {
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  function urlPagina(n: number) {
    const p = aParams({ ...filtros, pagina: n });
    return `/operador/archivo?${p.toString()}`;
  }

  if (filas.length === 0) {
    return (
      <p className="rounded-caja border border-dashed border-borde px-4 py-12 text-center text-[15px] text-tinta-suave">
        Ningún pedido coincide con estos filtros.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-caja border border-borde bg-superficie">
        <table className="w-full text-left text-[15px]">
          <thead>
            <tr className="border-b border-borde text-sm text-tinta-suave">
              <th className="px-4 py-2.5 font-medium">Folio</th>
              <th className="px-4 py-2.5 font-medium">Entrega</th>
              <th className="px-4 py-2.5 font-medium">Establecimiento</th>
              <th className="px-4 py-2.5 text-right font-medium">Botellas</th>
              <th className="px-4 py-2.5 font-medium">Estado</th>
              <th className="px-4 py-2.5 font-medium">Pago</th>
              <th className="px-4 py-2.5 font-medium">Origen</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => {
              const cfg = ESTADOS[f.estado];
              const muerto = Boolean(f.eliminado_en);
              return (
                <tr
                  key={f.id}
                  className={`border-b border-borde last:border-0 ${muerto ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/recibo/${f.folio}`}
                      target="_blank"
                      className={`cifras font-medium underline-offset-4 hover:underline ${
                        muerto ? "text-alerta line-through" : "text-acento"
                      }`}
                    >
                      {f.folio}
                    </Link>
                  </td>
                  <td className="cifras px-4 py-2.5 text-tinta-media">
                    {fechaCorta(f.fecha_entrega)}
                  </td>
                  <td className="px-4 py-2.5">
                    {f.establecimiento_nombre}
                    {f.req_etiquetado && (
                      <span className="ml-2 rounded-full bg-aviso/15 px-2 py-0.5 text-xs font-medium text-aviso">
                        Etiqueta
                      </span>
                    )}
                    {f.archivado_en && !muerto && (
                      <span className="ml-2 text-xs text-tinta-suave">
                        archivado
                      </span>
                    )}
                  </td>
                  <td className="cifras px-4 py-2.5 text-right font-medium">
                    {f.total_botellas}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cfg.color }}
                        aria-hidden="true"
                      />
                      {cfg.etiqueta}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    {f.metodo_pago ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: METODOS_PAGO[f.metodo_pago].color,
                          }}
                          aria-hidden="true"
                        />
                        {METODOS_PAGO[f.metodo_pago].corto}
                      </span>
                    ) : (
                      <span className="text-tinta-suave">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-tinta-media">
                    {f.origen === "cliente" ? "Cliente" : "Mostrador"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paginas > 1 && (
        <nav className="mt-4 flex items-center justify-between text-[15px]">
          {filtros.pagina > 1 ? (
            <Link href={urlPagina(filtros.pagina - 1)} className="text-acento">
              ← Anteriores
            </Link>
          ) : (
            <span />
          )}
          <span className="text-tinta-media">
            Página <span className="cifras">{filtros.pagina}</span> de{" "}
            <span className="cifras">{paginas}</span>
            {" · "}
            <span className="cifras">{total}</span> pedidos
          </span>
          {filtros.pagina < paginas ? (
            <Link href={urlPagina(filtros.pagina + 1)} className="text-acento">
              Siguientes →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
