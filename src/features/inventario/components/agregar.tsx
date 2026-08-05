"use client";

import { useMemo, useState, useTransition } from "react";
import type { Producto } from "@/features/catalogo/queries";
import {
  registrarGasto,
  registrarProduccion,
} from "@/features/inventario/actions";
import {
  ETIQUETA_CATEGORIA,
  type ConceptoGasto,
} from "@/features/inventario/tipos";
import { aCentavos, aPesos } from "@/lib/dinero";

type Pestana = "produccion" | "gasto";

const claseInput =
  "w-full min-w-0 rounded-caja border border-borde bg-superficie px-3 py-2 text-[15px]";

function Etiqueta({
  children,
  htmlFor,
}: {
  children: string;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-tinta-media"
    >
      {children}
    </label>
  );
}

export function Agregar({
  catalogo,
  conceptos,
  hoy,
}: {
  catalogo: Producto[];
  conceptos: ConceptoGasto[];
  hoy: string;
}) {
  const [pestana, setPestana] = useState<Pestana>("produccion");
  const [aviso, setAviso] = useState<{
    texto: string;
    tipo: "ok" | "error";
  } | null>(null);
  const [enviando, iniciar] = useTransition();

  // ---- Producción ----
  const [fechaProd, setFechaProd] = useState(hoy);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [notasProd, setNotasProd] = useState("");

  // ---- Gasto ----
  const [fechaGasto, setFechaGasto] = useState(hoy);
  const [conceptoId, setConceptoId] = useState("");
  const [conceptoNuevo, setConceptoNuevo] = useState("");
  const [categoriaNueva, setCategoriaNueva] = useState<
    "materia_prima" | "insumo"
  >("materia_prima");
  const [monto, setMonto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("");
  const [notasGasto, setNotasGasto] = useState("");

  const sabores = useMemo(() => {
    const aguas = catalogo.filter((p) => p.categoria === "agua");
    return [...new Set(aguas.map((p) => p.nombre))].map((nombre) => ({
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
    .map((p) => ({ ...p, cantidad: cantidades[p.id] ?? 0 }))
    .filter((p) => p.cantidad > 0);

  const totalBotellas = elegidos
    .filter((p) => p.categoria === "agua")
    .reduce((a, p) => a + p.cantidad, 0);

  const conceptoElegido = conceptos.find((c) => c.id === conceptoId);
  const centavos = aCentavos(monto);
  const nuevoConcepto = conceptoId === "";

  function campoCantidad(p: Producto | undefined, etiqueta: string) {
    if (!p) return <span />;
    const v = cantidades[p.id] ?? 0;
    return (
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={etiqueta}
        value={v === 0 ? "" : String(v)}
        placeholder="0"
        onFocus={(ev) => ev.target.select()}
        onChange={(ev) => {
          const n = ev.target.value.replace(/\D/g, "").slice(0, 4);
          setCantidades((c) => ({ ...c, [p.id]: n === "" ? 0 : Number(n) }));
        }}
        className={`cifras h-11 w-full rounded-caja border text-center ${
          v > 0
            ? "border-acento bg-acento/5 font-semibold text-acento"
            : "border-borde bg-superficie"
        }`}
      />
    );
  }

  function guardar() {
    setAviso(null);

    if (pestana === "produccion") {
      iniciar(async () => {
        const r = await registrarProduccion({
          fecha: fechaProd,
          notas: notasProd,
          items: Object.entries(cantidades)
            .filter(([, n]) => n > 0)
            .map(([productoId, c]) => ({ productoId, cantidad: c })),
        });
        if (r.ok) {
          setCantidades({});
          setNotasProd("");
          setAviso({ texto: "Producción registrada.", tipo: "ok" });
        } else setAviso({ texto: r.error, tipo: "error" });
      });
      return;
    }

    if (centavos === null) {
      setAviso({ texto: "Escribe un monto válido.", tipo: "error" });
      return;
    }

    iniciar(async () => {
      const r = await registrarGasto({
        fecha: fechaGasto,
        conceptoId: nuevoConcepto ? null : conceptoId,
        conceptoNuevo: nuevoConcepto ? conceptoNuevo.trim() : null,
        categoriaNueva: nuevoConcepto ? categoriaNueva : null,
        montoCentavos: centavos,
        cantidad: cantidad.trim()
          ? Number(cantidad.replace(/[^\d.]/g, ""))
          : null,
        unidad: unidad.trim() || null,
        notas: notasGasto,
      });
      if (r.ok) {
        setMonto("");
        setCantidad("");
        setNotasGasto("");
        setConceptoNuevo("");
        setAviso({ texto: "Gasto registrado.", tipo: "ok" });
      } else setAviso({ texto: r.error, tipo: "error" });
    });
  }

  const listo =
    pestana === "produccion"
      ? elegidos.length > 0
      : centavos !== null &&
        (!nuevoConcepto || conceptoNuevo.trim().length >= 2);

  return (
    <section className="mb-6 rounded-caja border border-borde bg-superficie">
      <header className="flex flex-wrap gap-1 border-b border-borde px-4">
        {(["produccion", "gasto"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPestana(p);
              setAviso(null);
            }}
            aria-current={pestana === p ? "true" : undefined}
            className={`border-b-2 px-4 py-3 text-[15px] font-medium transition-colors ${
              pestana === p
                ? "border-acento text-acento"
                : "border-transparent text-tinta-media hover:text-tinta"
            }`}
          >
            {p === "produccion" ? "Agregar producción" : "Agregar gasto"}
          </button>
        ))}
      </header>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ---------------- Formulario ---------------- */}
        <div className="min-w-0">
          {pestana === "produccion" ? (
            <>
              <div className="mb-4 max-w-56">
                <Etiqueta htmlFor="fecha-prod">Fecha</Etiqueta>
                <input
                  id="fecha-prod"
                  type="date"
                  value={fechaProd}
                  max={hoy}
                  onChange={(e) => setFechaProd(e.target.value)}
                  className={`cifras ${claseInput}`}
                />
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_78px_78px] items-center gap-x-3 gap-y-2">
                <span />
                <span className="text-center text-sm font-medium text-tinta-suave">
                  500 ml
                </span>
                <span className="text-center text-sm font-medium text-tinta-suave">
                  1 L
                </span>

                {sabores.map((s) => (
                  <div key={s.nombre} className="contents">
                    <span className="flex min-w-0 items-center gap-2.5 text-[16px]">
                      <span
                        className="h-6 w-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            s.color ?? "var(--color-borde-fuerte)",
                        }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{s.nombre}</span>
                    </span>
                    {campoCantidad(s.medio, `${s.nombre} 500ml`)}
                    {campoCantidad(s.litro, `${s.nombre} 1L`)}
                  </div>
                ))}
              </div>

              {pulpas.length > 0 && (
                <div className="mt-5 grid grid-cols-[minmax(0,1fr)_78px_78px] items-center gap-x-3 gap-y-2 border-t border-borde pt-4">
                  {pulpas.map((p) => (
                    <div key={p.id} className="contents">
                      <span className="truncate text-[16px]">
                        Pulpa {p.nombre}
                      </span>
                      {campoCantidad(p, `Pulpa ${p.nombre}`)}
                      <span />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <Etiqueta htmlFor="notas-prod">Notas</Etiqueta>
                <input
                  id="notas-prod"
                  type="text"
                  value={notasProd}
                  onChange={(e) => setNotasProd(e.target.value)}
                  maxLength={300}
                  placeholder="Opcional"
                  className={claseInput}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 [&>div]:min-w-0">
              <div>
                <Etiqueta htmlFor="fecha-gasto">Fecha</Etiqueta>
                <input
                  id="fecha-gasto"
                  type="date"
                  value={fechaGasto}
                  max={hoy}
                  onChange={(e) => setFechaGasto(e.target.value)}
                  className={`cifras ${claseInput}`}
                />
              </div>

              <div>
                <Etiqueta htmlFor="concepto">Concepto</Etiqueta>
                <select
                  id="concepto"
                  value={conceptoId}
                  onChange={(e) => {
                    setConceptoId(e.target.value);
                    const c = conceptos.find((x) => x.id === e.target.value);
                    if (c?.unidad_default) setUnidad(c.unidad_default);
                  }}
                  className={claseInput}
                >
                  <option value="">— Concepto nuevo —</option>
                  {(["materia_prima", "insumo"] as const).map((cat) => (
                    <optgroup key={cat} label={ETIQUETA_CATEGORIA[cat]}>
                      {conceptos
                        .filter((c) => c.categoria === cat)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {nuevoConcepto && (
                <div className="sm:col-span-2">
                  <div className="grid gap-3 rounded-caja bg-elevado p-3 sm:grid-cols-2 [&>div]:min-w-0">
                    <div>
                      <Etiqueta htmlFor="concepto-nuevo">
                        Nombre del concepto
                      </Etiqueta>
                      <input
                        id="concepto-nuevo"
                        type="text"
                        value={conceptoNuevo}
                        onChange={(e) => setConceptoNuevo(e.target.value)}
                        maxLength={60}
                        placeholder="Vasos térmicos"
                        className={claseInput}
                      />
                    </div>
                    <div>
                      <Etiqueta>Categoría</Etiqueta>
                      <div className="flex gap-2">
                        {(["materia_prima", "insumo"] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCategoriaNueva(c)}
                            aria-pressed={categoriaNueva === c}
                            className={`min-w-0 flex-1 truncate rounded-caja border px-3 py-2 text-sm ${
                              categoriaNueva === c
                                ? "border-acento bg-acento/5 font-medium text-acento"
                                : "border-borde text-tinta-media"
                            }`}
                          >
                            {c === "materia_prima" ? "Materia prima" : "Insumo"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Etiqueta htmlFor="monto">Monto</Etiqueta>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-suave">
                    $
                  </span>
                  <input
                    id="monto"
                    type="text"
                    inputMode="decimal"
                    value={monto}
                    onChange={(e) =>
                      setMonto(e.target.value.replace(/[^\d.]/g, ""))
                    }
                    placeholder="0.00"
                    className={`cifras ${claseInput} pl-7`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 [&>div]:min-w-0">
                <div>
                  <Etiqueta htmlFor="cantidad">Cantidad</Etiqueta>
                  <input
                    id="cantidad"
                    type="text"
                    inputMode="decimal"
                    value={cantidad}
                    onChange={(e) =>
                      setCantidad(e.target.value.replace(/[^\d.]/g, ""))
                    }
                    placeholder="0"
                    className={`cifras ${claseInput}`}
                  />
                </div>
                <div>
                  <Etiqueta htmlFor="unidad">Unidad</Etiqueta>
                  <input
                    id="unidad"
                    type="text"
                    value={unidad}
                    onChange={(e) => setUnidad(e.target.value)}
                    maxLength={20}
                    placeholder="kg"
                    className={claseInput}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <Etiqueta htmlFor="notas-gasto">Notas</Etiqueta>
                <input
                  id="notas-gasto"
                  type="text"
                  value={notasGasto}
                  onChange={(e) => setNotasGasto(e.target.value)}
                  maxLength={300}
                  placeholder="Opcional"
                  className={claseInput}
                />
              </div>
            </div>
          )}
        </div>

        {/* ---------------- Resumen ---------------- */}
        <aside className="flex min-w-0 flex-col rounded-caja border border-borde bg-elevado p-4">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-tinta-suave">
            Se va a registrar
          </h3>

          <div className="flex-1">
            {pestana === "produccion" ? (
              elegidos.length === 0 ? (
                <p className="text-[15px] text-tinta-suave">
                  Escribe cantidades para ver el resumen.
                </p>
              ) : (
                <>
                  <ul className="space-y-1 text-[15px]">
                    {elegidos.map((p) => (
                      <li key={p.id} className="flex justify-between gap-3">
                        <span className="min-w-0 truncate">
                          {p.categoria === "pulpa" ? "Pulpa " : ""}
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
                  <p className="mt-3 flex items-baseline justify-between border-t-2 border-tinta pt-3">
                    <span className="font-display font-semibold">Botellas</span>
                    <span className="cifras text-xl font-bold">
                      {totalBotellas}
                    </span>
                  </p>
                </>
              )
            ) : (
              <dl className="space-y-2 text-[15px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-tinta-media">Concepto</dt>
                  <dd className="min-w-0 truncate font-medium">
                    {conceptoElegido?.nombre || conceptoNuevo || "—"}
                  </dd>
                </div>
                {cantidad.trim() && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-tinta-media">Cantidad</dt>
                    <dd className="cifras font-medium">
                      {cantidad} {unidad}
                    </dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 border-t-2 border-tinta pt-3">
                  <dt className="font-display font-semibold">Monto</dt>
                  <dd className="cifras text-xl font-bold">
                    {centavos !== null ? aPesos(centavos) : "—"}
                  </dd>
                </div>
              </dl>
            )}
          </div>

          {aviso && (
            <p
              role={aviso.tipo === "error" ? "alert" : "status"}
              className={`mt-4 text-[15px] font-medium ${
                aviso.tipo === "error" ? "text-alerta" : "text-acento"
              }`}
            >
              {aviso.texto}
            </p>
          )}

          <button
            type="button"
            onClick={guardar}
            disabled={enviando || !listo}
            className="mt-4 w-full rounded-caja bg-acento px-4 py-3 text-[16px] font-medium
                       text-white active:bg-acento-vivo disabled:opacity-40"
          >
            {enviando ? "Guardando…" : "Registrar"}
          </button>
        </aside>
      </div>
    </section>
  );
}
