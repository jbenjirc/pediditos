"use client";

import { useState, useTransition } from "react";
import { eliminarMovimiento } from "@/features/inventario/actions";
import {
  ETIQUETA_CATEGORIA,
  type FilaGasto,
  type FilaProduccion,
} from "@/features/inventario/tipos";
import { aPesos } from "@/lib/dinero";

function fechaCorta(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function BotonEliminar({
  tabla,
  id,
}: {
  tabla: "gastos" | "produccion";
  id: string;
}) {
  const [confirma, setConfirma] = useState(false);
  const [pendiente, iniciar] = useTransition();

  if (!confirma) {
    return (
      <button
        type="button"
        onClick={() => setConfirma(true)}
        className="text-sm text-tinta-suave hover:text-alerta"
      >
        Eliminar
      </button>
    );
  }

  return (
    <span className="flex items-center justify-end gap-2 text-sm">
      <button
        type="button"
        disabled={pendiente}
        onClick={() => iniciar(() => void eliminarMovimiento(tabla, id))}
        className="font-medium text-alerta"
      >
        Sí
      </button>
      <button
        type="button"
        onClick={() => setConfirma(false)}
        className="text-tinta-media"
      >
        No
      </button>
    </span>
  );
}

export function TablaMovimientos({
  gastos,
  produccion,
}: {
  gastos: FilaGasto[];
  produccion: FilaProduccion[];
}) {
  const [vista, setVista] = useState<"gastos" | "produccion">("gastos");

  return (
    <section className="min-w-0 rounded-caja border border-borde bg-superficie">
      <header className="flex flex-wrap gap-1 border-b border-borde px-4">
        {(["gastos", "produccion"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVista(v)}
            aria-current={vista === v ? "true" : undefined}
            className={`border-b-2 px-4 py-3 text-[15px] font-medium transition-colors ${
              vista === v
                ? "border-acento text-acento"
                : "border-transparent text-tinta-media hover:text-tinta"
            }`}
          >
            {v === "gastos"
              ? `Gastos (${gastos.length})`
              : `Producción (${produccion.length})`}
          </button>
        ))}
      </header>

      <div className="overflow-x-auto">
        {vista === "gastos" ? (
          gastos.length === 0 ? (
            <p className="px-4 py-10 text-center text-[15px] text-tinta-suave">
              Sin gastos en este periodo.
            </p>
          ) : (
            <table className="w-full min-w-[540px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-borde text-sm text-tinta-suave">
                  <th className="px-4 py-2.5 font-medium">Fecha</th>
                  <th className="px-4 py-2.5 font-medium">Concepto</th>
                  <th className="px-4 py-2.5 font-medium">Categoría</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    Cantidad
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">Monto</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-borde last:border-0"
                  >
                    <td className="cifras px-4 py-2.5 text-tinta-media">
                      {fechaCorta(g.fecha)}
                    </td>
                    <td className="px-4 py-2.5">
                      {g.concepto_nombre}
                      {g.notas && (
                        <span className="ml-2 text-sm text-tinta-suave">
                          {g.notas}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-tinta-media">
                      {ETIQUETA_CATEGORIA[g.categoria]}
                    </td>
                    <td className="cifras px-4 py-2.5 text-right text-tinta-media">
                      {g.cantidad
                        ? `${g.cantidad} ${g.unidad ?? ""}`.trim()
                        : "—"}
                    </td>
                    <td className="cifras px-4 py-2.5 text-right font-medium">
                      {aPesos(g.monto_centavos)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <BotonEliminar tabla="gastos" id={g.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : produccion.length === 0 ? (
          <p className="px-4 py-10 text-center text-[15px] text-tinta-suave">
            Sin producción en este periodo.
          </p>
        ) : (
          <table className="w-full min-w-[540px] text-left text-[15px]">
            <thead>
              <tr className="border-b border-borde text-sm text-tinta-suave">
                <th className="px-4 py-2.5 font-medium">Fecha</th>
                <th className="px-4 py-2.5 font-medium">Hora</th>
                <th className="px-4 py-2.5 font-medium">Producto</th>
                <th className="px-4 py-2.5 text-right font-medium">Cantidad</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {produccion.map((p) => (
                <tr key={p.id} className="border-b border-borde last:border-0">
                  <td className="cifras px-4 py-2.5 text-tinta-media">
                    {fechaCorta(p.fecha)}
                  </td>
                  <td className="cifras px-4 py-2.5 text-sm text-tinta-suave">
                    {new Date(p.creado_en).toLocaleTimeString("es-MX", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5">
                    {p.categoria === "pulpa" ? "Pulpa " : ""}
                    {p.producto_nombre}
                    {p.producto_presentacion && (
                      <span className="text-tinta-suave">
                        {" "}
                        · {p.producto_presentacion}
                      </span>
                    )}
                  </td>
                  <td className="cifras px-4 py-2.5 text-right font-medium">
                    {p.cantidad}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <BotonEliminar tabla="produccion" id={p.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
