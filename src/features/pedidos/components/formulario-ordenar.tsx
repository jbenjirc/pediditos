"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { CintaSabores } from "@/components/cinta-sabores";
import type { Establecimiento, Producto } from "@/features/catalogo/queries";
import { crearPedidoOperador } from "@/features/pedidos/acciones-ordenar";
import { etiquetaDia, fechaLocal } from "@/lib/fechas";

type Estado = {
  establecimientoId: string | null;
  establecimientoNuevo: string;
  fechaEntrega: "hoy" | "manana";
  horaApertura: string;
  cantidades: Record<string, number>;
  reqEtiquetado: boolean;
  notas: string;
};

const INICIAL: Estado = {
  establecimientoId: null,
  establecimientoNuevo: "",
  fechaEntrega: "hoy",
  horaApertura: "07:00",
  cantidades: {},
  reqEtiquetado: false,
  notas: "",
};

function Caja({
  titulo,
  children,
  className = "",
}: {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-caja border border-borde bg-superficie p-5 ${className}`}
    >
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-tinta-suave">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Campo numérico: el operador teclea, no toca +/− catorce veces. */
function Cantidad({
  valor,
  onCambio,
  etiqueta,
}: {
  valor: number;
  onCambio: (n: number) => void;
  etiqueta: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-label={etiqueta}
      value={valor === 0 ? "" : String(valor)}
      placeholder="0"
      onChange={(e) => {
        const limpio = e.target.value.replace(/\D/g, "").slice(0, 3);
        onCambio(limpio === "" ? 0 : Number(limpio));
      }}
      onFocus={(e) => e.target.select()}
      className={`cifras h-12 w-full rounded-caja border text-center text-lg
                  ${valor > 0 ? "border-acento bg-acento/5 font-semibold text-acento" : "border-borde bg-superficie"}`}
    />
  );
}

export function FormularioOrdenar({
  catalogo,
  establecimientos,
}: {
  catalogo: Producto[];
  establecimientos: Establecimiento[];
}) {
  const [e, setE] = useState<Estado>(INICIAL);
  const [error, setError] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<{
    folio: string;
    nombre: string;
  } | null>(null);
  const [enviando, iniciar] = useTransition();
  const refNegocio = useRef<HTMLSelectElement>(null);

  const set = (p: Partial<Estado>) => setE((v) => ({ ...v, ...p }));

  // Rejilla sabor × tamaño: una fila por sabor, una columna por presentación.
  // Para quien toma pedidos por teléfono es mucho más rápido que una lista.
  const sabores = useMemo(() => {
    const aguas = catalogo.filter((p) => p.categoria === "agua");
    const nombres = [...new Set(aguas.map((p) => p.nombre))];
    return nombres.map((nombre) => ({
      nombre,
      color: aguas.find((p) => p.nombre === nombre)?.color_hex ?? null,
      medio: aguas.find(
        (p) => p.nombre === nombre && p.presentacion === "500ml",
      ),
      litro: aguas.find((p) => p.nombre === nombre && p.presentacion === "1L"),
    }));
  }, [catalogo]);

  const pulpas = catalogo.filter((p) => p.categoria === "pulpa");

  const elegidos = catalogo
    .map((p) => ({ ...p, cantidad: e.cantidades[p.id] ?? 0 }))
    .filter((p) => p.cantidad > 0);

  const botellas = elegidos
    .filter((p) => p.categoria === "agua")
    .reduce((a, p) => a + p.cantidad, 0);

  const nombreElegido =
    establecimientos.find((x) => x.id === e.establecimientoId)?.nombre ||
    e.establecimientoNuevo;

  function limpiar() {
    setE(INICIAL);
    setError(null);
    refNegocio.current?.focus();
  }

  function ordenar() {
    setError(null);
    iniciar(async () => {
      const r = await crearPedidoOperador({
        establecimientoId: e.establecimientoId,
        establecimientoNuevo: e.establecimientoId
          ? null
          : e.establecimientoNuevo.trim(),
        fechaEntrega: e.fechaEntrega,
        horaApertura: e.horaApertura,
        items: Object.entries(e.cantidades)
          .filter(([, n]) => n > 0)
          .map(([productoId, cantidad]) => ({ productoId, cantidad })),
        reqEtiquetado: e.reqEtiquetado,
        notas: e.notas,
      });

      if (!r.ok) {
        setError(r.error);
        return;
      }

      // Limpia solo: el operador casi siempre tiene otro pedido esperando.
      setUltimo({ folio: r.folio, nombre: r.establecimientoNombre });
      setE(INICIAL);
      refNegocio.current?.focus();
    });
  }

  return (
    <>
      {ultimo && (
        <div
          role="status"
          className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-caja
                     border border-acento bg-acento/5 px-5 py-4"
        >
          <p className="text-[15px]">
            Guardado{" "}
            <span className="cifras font-bold text-acento">{ultimo.folio}</span>{" "}
            para <span className="font-medium">{ultimo.nombre}</span>
          </p>
          <div className="flex items-center gap-3">
            <a
              href={`/recibo/${ultimo.folio}`}
              target="_blank"
              rel="noopener"
              className="rounded-caja border border-acento px-4 py-2 text-[15px] text-acento"
            >
              Imprimir
            </a>
            <button
              type="button"
              onClick={() => setUltimo(null)}
              className="text-sm text-tinta-suave"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <Caja titulo="Cliente">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="negocio"
                  className="mb-1.5 block text-[15px] font-medium"
                >
                  Establecimiento
                </label>
                <select
                  id="negocio"
                  ref={refNegocio}
                  value={e.establecimientoId ?? ""}
                  onChange={(ev) => {
                    const id = ev.target.value || null;
                    const est = establecimientos.find((x) => x.id === id);
                    set({
                      establecimientoId: id,
                      establecimientoNuevo: "",
                      horaApertura:
                        est?.hora_apertura_default?.slice(0, 5) ??
                        e.horaApertura,
                    });
                  }}
                  className="h-12 w-full rounded-caja border border-borde bg-superficie px-3 text-[16px]"
                >
                  <option value="">— Negocio nuevo —</option>
                  {establecimientos.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="hora"
                  className="mb-1.5 block text-[15px] font-medium"
                >
                  Hora de apertura
                </label>
                <input
                  id="hora"
                  type="time"
                  value={e.horaApertura}
                  onChange={(ev) => set({ horaApertura: ev.target.value })}
                  className="cifras h-12 w-full rounded-caja border border-borde bg-superficie px-3 text-[16px]"
                />
              </div>
            </div>

            {e.establecimientoId === null && (
              <div className="mt-4">
                <label
                  htmlFor="nuevo"
                  className="mb-1.5 block text-[15px] font-medium"
                >
                  Nombre del negocio nuevo
                </label>
                <input
                  id="nuevo"
                  type="text"
                  value={e.establecimientoNuevo}
                  onChange={(ev) =>
                    set({ establecimientoNuevo: ev.target.value })
                  }
                  maxLength={80}
                  placeholder="Abarrotes Lupita"
                  className="h-12 w-full rounded-caja border border-borde bg-superficie px-3 text-[16px]"
                />
              </div>
            )}

            <fieldset className="mt-4">
              <legend className="mb-1.5 text-[15px] font-medium">
                Entrega
              </legend>
              <div className="flex gap-2">
                {(["hoy", "manana"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set({ fechaEntrega: v })}
                    aria-pressed={e.fechaEntrega === v}
                    className={`flex-1 rounded-caja border px-4 py-2.5 text-[15px] ${
                      e.fechaEntrega === v
                        ? "border-acento bg-acento/5 font-medium text-acento"
                        : "border-borde text-tinta-media"
                    }`}
                  >
                    {v === "hoy" ? "Hoy" : "Mañana"}
                    <span className="ml-2 text-sm text-tinta-suave">
                      {
                        etiquetaDia(fechaLocal(v === "manana" ? 1 : 0)).split(
                          ",",
                        )[0]
                      }
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
          </Caja>

          <Caja titulo="Orden">
            <div className="grid grid-cols-[1fr_88px_88px] items-center gap-x-3 gap-y-2">
              <span />
              <span className="text-center text-sm font-medium text-tinta-suave">
                500 ml
              </span>
              <span className="text-center text-sm font-medium text-tinta-suave">
                1 L
              </span>

              {sabores.map((s) => (
                <div key={s.nombre} className="contents">
                  <span className="flex items-center gap-2.5 text-[16px]">
                    <span
                      className="h-6 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: s.color ?? "var(--color-borde-fuerte)",
                      }}
                      aria-hidden="true"
                    />
                    {s.nombre}
                  </span>
                  {[s.medio, s.litro].map((p, i) =>
                    p ? (
                      <Cantidad
                        key={p.id}
                        valor={e.cantidades[p.id] ?? 0}
                        etiqueta={`${s.nombre} ${p.presentacion}`}
                        onCambio={(n) =>
                          set({ cantidades: { ...e.cantidades, [p.id]: n } })
                        }
                      />
                    ) : (
                      <span key={i} />
                    ),
                  )}
                </div>
              ))}
            </div>

            {pulpas.length > 0 && (
              <div className="mt-6 border-t border-borde pt-4">
                <p className="mb-2 text-sm font-medium uppercase tracking-wide text-tinta-suave">
                  Pulpas
                </p>
                <div className="grid grid-cols-[1fr_88px] items-center gap-x-3 gap-y-2">
                  {pulpas.map((p) => (
                    <div key={p.id} className="contents">
                      <span className="text-[16px]">{p.nombre}</span>
                      <Cantidad
                        valor={e.cantidades[p.id] ?? 0}
                        etiqueta={`Pulpa ${p.nombre}`}
                        onCambio={(n) =>
                          set({ cantidades: { ...e.cantidades, [p.id]: n } })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Caja>
        </div>

        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <Caja titulo="Extras">
            <label className="flex cursor-pointer items-center gap-3 text-[16px]">
              <input
                type="checkbox"
                checked={e.reqEtiquetado}
                onChange={(ev) => set({ reqEtiquetado: ev.target.checked })}
                className="h-5 w-5 accent-[var(--color-acento)]"
              />
              Requiere etiquetado
            </label>

            <label
              htmlFor="notas"
              className="mb-1.5 mt-4 block text-[15px] font-medium"
            >
              Notas
            </label>
            <textarea
              id="notas"
              rows={3}
              maxLength={500}
              value={e.notas}
              onChange={(ev) => set({ notas: ev.target.value })}
              className="w-full rounded-caja border border-borde bg-superficie px-3 py-2 text-[15px]"
            />
          </Caja>

          <Caja titulo="Resumen">
            <p className="font-display text-lg font-semibold">
              {nombreElegido || (
                <span className="text-tinta-suave">Sin cliente</span>
              )}
            </p>

            <div className="my-4">
              <CintaSabores
                alto={8}
                segmentos={elegidos.map((p) => ({
                  color: p.color_hex,
                  cantidad: p.cantidad,
                  nombre: p.nombre,
                }))}
              />
            </div>

            {elegidos.length === 0 ? (
              <p className="text-[15px] text-tinta-suave">
                Aún no hay productos.
              </p>
            ) : (
              <ul className="space-y-1 text-[15px]">
                {elegidos.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <span>
                      {p.nombre}
                      {p.presentacion && (
                        <span className="text-tinta-suave">
                          {" "}
                          · {p.presentacion}
                        </span>
                      )}
                    </span>
                    <span className="cifras font-medium">{p.cantidad}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 flex items-baseline justify-between border-t-2 border-tinta pt-3">
              <span className="font-display font-semibold">Botellas</span>
              <span className="cifras text-2xl font-bold">{botellas}</span>
            </p>
          </Caja>

          <div>
            {error && (
              <p
                role="alert"
                className="mb-3 text-[15px] font-medium text-alerta"
              >
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={limpiar}
                disabled={enviando}
                className="rounded-caja border border-borde px-5 py-3.5 text-[16px] text-tinta-media"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={ordenar}
                disabled={enviando}
                className="flex-1 rounded-caja bg-acento px-5 py-3.5 text-[16px] font-medium
                           text-white active:bg-acento-vivo disabled:opacity-60"
              >
                {enviando ? "Guardando…" : "Ordenar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
