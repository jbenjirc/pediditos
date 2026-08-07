"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Establecimiento } from "@/features/catalogo/queries";
import { ESTADOS, ORDEN_FLUJO } from "@/features/pedidos/estados";
import {
  METODOS_OPERADOR,
  METODOS_PAGO,
} from "@/features/pedidos/metodos-pago";
import {
  aParams,
  primerDiaDelMes,
  restarDias,
  type FiltrosArchivo,
} from "@/features/archivo/filtros";

function Campo({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-sm font-medium text-tinta-media">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

const claseInput =
  "w-full min-w-0 rounded-caja border border-borde bg-superficie px-3 py-2 text-[15px]";

export function FiltrosArchivoPanel({
  filtros,
  establecimientos,
  hoy,
}: {
  filtros: FiltrosArchivo;
  establecimientos: Establecimiento[];
  hoy: string;
}) {
  const router = useRouter();
  const [folio, setFolio] = useState(filtros.folio);

  function aplicar(cambios: Partial<FiltrosArchivo>) {
    // Cualquier cambio de filtro regresa a la página 1: seguir en la 4 con un
    // conjunto distinto casi siempre deja al operador viendo una tabla vacía.
    const p = aParams({ ...filtros, ...cambios, pagina: 1 });
    router.replace(`/operador/archivo?${p.toString()}`);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (folio !== filtros.folio) aplicar({ folio });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folio]);

  const atajos: { texto: string; desde: string; hasta: string }[] = [
    { texto: "Hoy", desde: hoy, hasta: hoy },
    { texto: "7 días", desde: restarDias(hoy, 6), hasta: hoy },
    { texto: "30 días", desde: restarDias(hoy, 29), hasta: hoy },
    { texto: "Este mes", desde: primerDiaDelMes(hoy), hasta: hoy },
  ];

  const buscandoFolio = filtros.folio.length >= 2;

  return (
    <aside
      className="flex min-w-0 flex-col gap-5 rounded-caja border border-borde
                 bg-superficie p-4 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)]
                 lg:overflow-y-auto"
    >
      <Campo etiqueta="Folio">
        <input
          type="search"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          placeholder="260803-001"
          className={`cifras ${claseInput}`}
        />
      </Campo>

      {buscandoFolio ? (
        <p className="rounded-caja bg-elevado px-3 py-2.5 text-sm text-tinta-media">
          Buscando por folio en todo el histórico. Los demás filtros no aplican.
        </p>
      ) : (
        <>
          <div>
            <p className="mb-1.5 text-sm font-medium text-tinta-media">
              Periodo
            </p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {atajos.map((a) => {
                const activo =
                  filtros.desde === a.desde && filtros.hasta === a.hasta;
                return (
                  <button
                    key={a.texto}
                    type="button"
                    onClick={() => aplicar({ desde: a.desde, hasta: a.hasta })}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      activo
                        ? "border-acento bg-acento/5 font-medium text-acento"
                        : "border-borde text-tinta-media"
                    }`}
                  >
                    {a.texto}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                value={filtros.desde}
                max={filtros.hasta}
                onChange={(e) => aplicar({ desde: e.target.value })}
                className={`cifras ${claseInput}`}
                aria-label="Desde"
              />
              <input
                type="date"
                value={filtros.hasta}
                min={filtros.desde}
                onChange={(e) => aplicar({ hasta: e.target.value })}
                className={`cifras ${claseInput}`}
                aria-label="Hasta"
              />
            </div>
          </div>

          <Campo etiqueta="Establecimiento">
            <select
              value={filtros.establecimientoId ?? ""}
              onChange={(e) =>
                aplicar({ establecimientoId: e.target.value || null })
              }
              className={claseInput}
            >
              <option value="">Todos</option>
              {establecimientos.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nombre}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Estado">
            <select
              value={filtros.estado ?? ""}
              onChange={(e) =>
                aplicar({
                  estado: (e.target.value || null) as FiltrosArchivo["estado"],
                })
              }
              className={claseInput}
            >
              <option value="">Todos</option>
              {ORDEN_FLUJO.map((s) => (
                <option key={s} value={s}>
                  {ESTADOS[s].etiqueta}
                </option>
              ))}
              <option value="cancelado">Cancelado</option>
            </select>
          </Campo>

          <Campo etiqueta="Origen">
            <select
              value={filtros.origen ?? ""}
              onChange={(e) =>
                aplicar({
                  origen: (e.target.value || null) as FiltrosArchivo["origen"],
                })
              }
              className={claseInput}
            >
              <option value="">Todos</option>
              <option value="cliente">Cliente</option>
              <option value="operador">Mostrador</option>
            </select>
          </Campo>

          <Campo etiqueta="Método de pago">
            <select
              value={filtros.metodoPago ?? ""}
              onChange={(e) =>
                aplicar({
                  metodoPago: (e.target.value ||
                    null) as FiltrosArchivo["metodoPago"],
                })
              }
              className={claseInput}
            >
              <option value="">Todos</option>
              {METODOS_OPERADOR.map((m) => (
                <option key={m} value={m}>
                  {METODOS_PAGO[m].etiqueta}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Etiquetado">
            <select
              value={
                filtros.etiquetado === null
                  ? ""
                  : filtros.etiquetado
                    ? "1"
                    : "0"
              }
              onChange={(e) =>
                aplicar({
                  etiquetado:
                    e.target.value === "" ? null : e.target.value === "1",
                })
              }
              className={claseInput}
            >
              <option value="">Todos</option>
              <option value="1">Solo con etiquetado</option>
              <option value="0">Solo sin etiquetado</option>
            </select>
          </Campo>

          <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
            <input
              type="checkbox"
              checked={filtros.incluirEliminados}
              onChange={(e) => aplicar({ incluirEliminados: e.target.checked })}
              className="h-4 w-4 accent-[var(--color-acento)]"
            />
            Incluir eliminados
          </label>
        </>
      )}

      <button
        type="button"
        onClick={() => {
          setFolio("");
          router.replace("/operador/archivo");
        }}
        className="self-start text-sm text-tinta-suave underline underline-offset-4 hover:text-tinta"
      >
        Limpiar filtros
      </button>
    </aside>
  );
}
