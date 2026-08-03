"use client";

import type { Establecimiento, Producto } from "@/features/catalogo/queries";
import { CintaSabores } from "@/components/cinta-sabores";
import { etiquetaDia, fechaLocal, horaLegible } from "@/lib/fechas";

export type EstadoPedido = {
  establecimientoId: string | null;
  establecimientoNuevo: string;
  fechaEntrega: "hoy" | "manana";
  horaApertura: string;
  cantidades: Record<string, number>;
  reqEtiquetado: boolean;
  notas: string;
};

const HORAS_COMUNES = ["06:00", "06:30", "07:00", "07:30", "08:00", "09:00"];

/* ------------------------------------------------------------------ */
/* Piezas compartidas                                                  */
/* ------------------------------------------------------------------ */

export function Titulo({
  children,
  ayuda,
}: {
  children: string;
  ayuda?: string;
}) {
  return (
    <header className="mb-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {children}
      </h1>
      {ayuda && <p className="mt-1 text-[15px] text-tinta-media">{ayuda}</p>}
    </header>
  );
}

function BotonOpcion({
  activo,
  onClick,
  children,
}: {
  activo?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={[
        "w-full rounded-caja border px-4 py-4 text-left text-[17px] transition-colors",
        activo
          ? "border-acento bg-acento/5 font-medium text-acento"
          : "border-borde bg-superficie text-tinta active:bg-elevado",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Contador({
  valor,
  onCambio,
  etiqueta,
}: {
  valor: number;
  onCambio: (n: number) => void;
  etiqueta: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onCambio(Math.max(0, valor - 1))}
        disabled={valor === 0}
        aria-label={`Quitar uno de ${etiqueta}`}
        className="h-11 w-11 rounded-caja border border-borde bg-superficie text-xl
                   text-tinta-media disabled:opacity-30 active:bg-elevado"
      >
        −
      </button>
      <span
        className="cifras w-10 text-center text-lg font-medium"
        aria-live="polite"
        aria-label={`${etiqueta}: ${valor}`}
      >
        {valor}
      </span>
      <button
        type="button"
        onClick={() => onCambio(Math.min(999, valor + 1))}
        aria-label={`Agregar uno de ${etiqueta}`}
        className="h-11 w-11 rounded-caja border border-acento bg-acento text-xl
                   font-medium text-white active:bg-acento-vivo"
      >
        +
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paso 1 · Negocio                                                    */
/* ------------------------------------------------------------------ */

export function PasoNegocio({
  establecimientos,
  recordado,
  estado,
  set,
  onOlvidar,
  mostrarBuscador,
  filtro,
  setFiltro,
}: {
  establecimientos: Establecimiento[];
  recordado: Establecimiento | null;
  estado: EstadoPedido;
  set: (p: Partial<EstadoPedido>) => void;
  onOlvidar: () => void;
  mostrarBuscador: boolean;
  filtro: string;
  setFiltro: (s: string) => void;
}) {
  const escribiendo =
    estado.establecimientoId === null && estado.establecimientoNuevo !== "";

  if (recordado && estado.establecimientoId === recordado.id && !escribiendo) {
    return (
      <>
        <Titulo ayuda="Si es correcto, continúa.">
          ¿Pides para tu negocio de siempre?
        </Titulo>
        <div className="rounded-caja border border-acento bg-acento/5 p-5">
          <p className="font-display text-xl font-semibold text-acento">
            {recordado.nombre}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onOlvidar();
            set({ establecimientoId: null });
          }}
          className="mt-4 w-full py-3 text-[15px] text-tinta-media underline underline-offset-4"
        >
          Soy otro negocio
        </button>
      </>
    );
  }

  const lista = mostrarBuscador
    ? establecimientos.filter((e) =>
        e.nombre.toLowerCase().includes(filtro.trim().toLowerCase()),
      )
    : establecimientos;

  return (
    <>
      <Titulo ayuda="Toca el nombre de tu negocio.">
        ¿Para qué negocio es?
      </Titulo>

      {mostrarBuscador && (
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar"
          className="mb-3 w-full rounded-caja border border-borde bg-superficie px-4 py-3 text-[17px]"
        />
      )}

      <div className="flex flex-col gap-2">
        {lista.map((e) => (
          <BotonOpcion
            key={e.id}
            activo={estado.establecimientoId === e.id}
            onClick={() =>
              set({
                establecimientoId: e.id,
                establecimientoNuevo: "",
                horaApertura:
                  e.hora_apertura_default?.slice(0, 5) ?? estado.horaApertura,
              })
            }
          >
            {e.nombre}
          </BotonOpcion>
        ))}
      </div>

      <div className="mt-5 border-t border-borde pt-5">
        <label
          htmlFor="negocio-nuevo"
          className="mb-2 block text-[15px] font-medium text-tinta-media"
        >
          No está mi negocio
        </label>
        <input
          id="negocio-nuevo"
          type="text"
          value={estado.establecimientoNuevo}
          onChange={(e) =>
            set({
              establecimientoNuevo: e.target.value,
              establecimientoId: null,
            })
          }
          placeholder="Abarrotes Lupita"
          maxLength={80}
          className="w-full rounded-caja border border-borde bg-superficie px-4 py-3 text-[17px]"
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Paso 2 · Cuándo                                                     */
/* ------------------------------------------------------------------ */

export function PasoCuando({
  estado,
  set,
  horaLibre,
  setHoraLibre,
}: {
  estado: EstadoPedido;
  set: (p: Partial<EstadoPedido>) => void;
  horaLibre: boolean;
  setHoraLibre: (b: boolean) => void;
}) {
  return (
    <>
      <Titulo ayuda="Así sabemos cuándo llevártelo.">
        ¿Para cuándo lo necesitas?
      </Titulo>

      <div className="grid grid-cols-2 gap-2">
        {(["hoy", "manana"] as const).map((v) => (
          <BotonOpcion
            key={v}
            activo={estado.fechaEntrega === v}
            onClick={() => set({ fechaEntrega: v })}
          >
            <span className="block font-medium">
              {v === "hoy" ? "Hoy" : "Mañana"}
            </span>
            <span className="mt-0.5 block text-sm text-tinta-suave">
              {etiquetaDia(fechaLocal(v === "manana" ? 1 : 0))}
            </span>
          </BotonOpcion>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold">
        ¿A qué hora abres?
      </h2>

      <div className="grid grid-cols-3 gap-2">
        {HORAS_COMUNES.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => {
              set({ horaApertura: h });
              setHoraLibre(false);
            }}
            aria-pressed={!horaLibre && estado.horaApertura === h}
            className={[
              "cifras rounded-caja border py-4 text-[16px] transition-colors",
              !horaLibre && estado.horaApertura === h
                ? "border-acento bg-acento/5 font-medium text-acento"
                : "border-borde bg-superficie text-tinta active:bg-elevado",
            ].join(" ")}
          >
            {horaLegible(h).replace(" a.m.", "").replace(" p.m.", "")}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setHoraLibre(true)}
        className="mt-4 w-full py-2 text-[15px] text-tinta-media underline underline-offset-4"
      >
        Otra hora
      </button>

      {horaLibre && (
        <input
          type="time"
          value={estado.horaApertura}
          onChange={(e) => set({ horaApertura: e.target.value })}
          className="cifras mt-2 w-full rounded-caja border border-borde bg-superficie px-4 py-3 text-[17px]"
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Paso 3 · Cantidades                                                 */
/* ------------------------------------------------------------------ */

export function PasoCantidades({
  catalogo,
  estado,
  set,
}: {
  catalogo: Producto[];
  estado: EstadoPedido;
  set: (p: Partial<EstadoPedido>) => void;
}) {
  const grupos = [
    {
      titulo: "Medio litro",
      items: catalogo.filter((p) => p.presentacion === "500ml"),
    },
    {
      titulo: "Un litro",
      items: catalogo.filter((p) => p.presentacion === "1L"),
    },
    {
      titulo: "Pulpas",
      items: catalogo.filter((p) => p.categoria === "pulpa"),
    },
  ].filter((g) => g.items.length > 0);

  function cambiar(id: string, n: number) {
    set({ cantidades: { ...estado.cantidades, [id]: n } });
  }

  return (
    <>
      <Titulo ayuda="Toca + o − para cada sabor.">¿Qué te llevamos?</Titulo>

      {grupos.map((g) => (
        <section key={g.titulo} className="mb-7">
          <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-tinta-suave">
            {g.titulo}
          </h2>
          <ul className="divide-y divide-borde rounded-caja border border-borde bg-superficie">
            {g.items.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                <span
                  className="h-8 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: p.color_hex ?? "var(--color-borde-fuerte)",
                  }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-[17px] leading-tight">
                  {p.nombre}
                </span>
                <Contador
                  valor={estado.cantidades[p.id] ?? 0}
                  onCambio={(n) => cambiar(p.id, n)}
                  etiqueta={`${p.nombre} ${p.presentacion ?? ""}`.trim()}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Paso 4 · Extras                                                     */
/* ------------------------------------------------------------------ */

export function PasoExtras({
  estado,
  set,
}: {
  estado: EstadoPedido;
  set: (p: Partial<EstadoPedido>) => void;
}) {
  return (
    <>
      <Titulo>¿Necesitas etiquetado?</Titulo>

      <div className="grid grid-cols-2 gap-2">
        <BotonOpcion
          activo={estado.reqEtiquetado}
          onClick={() => set({ reqEtiquetado: true })}
        >
          Sí, con etiqueta
        </BotonOpcion>
        <BotonOpcion
          activo={!estado.reqEtiquetado}
          onClick={() => set({ reqEtiquetado: false })}
        >
          No hace falta
        </BotonOpcion>
      </div>

      <h2 className="mb-2 mt-8 font-display text-lg font-semibold">
        Notas para el pedido
      </h2>
      <p className="mb-3 text-[15px] text-tinta-media">
        Opcional. Por ejemplo: menos hielo.
      </p>
      <textarea
        value={estado.notas}
        onChange={(e) => set({ notas: e.target.value })}
        maxLength={500}
        rows={4}
        className="w-full rounded-caja border border-borde bg-superficie px-4 py-3 text-[17px]"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Paso 5 · Resumen                                                    */
/* ------------------------------------------------------------------ */

export function PasoResumen({
  catalogo,
  establecimientos,
  estado,
}: {
  catalogo: Producto[];
  establecimientos: Establecimiento[];
  estado: EstadoPedido;
}) {
  const elegidos = catalogo
    .map((p) => ({ ...p, cantidad: estado.cantidades[p.id] ?? 0 }))
    .filter((p) => p.cantidad > 0);

  const botellas = elegidos
    .filter((p) => p.categoria === "agua")
    .reduce((a, p) => a + p.cantidad, 0);

  const nombre =
    establecimientos.find((e) => e.id === estado.establecimientoId)?.nombre ||
    estado.establecimientoNuevo;

  return (
    <>
      <Titulo ayuda="Revisa antes de enviar.">Tu pedido</Titulo>

      <div className="rounded-caja border border-borde bg-superficie p-5">
        <p className="font-display text-xl font-semibold">{nombre}</p>
        <p className="mt-1 text-[15px] text-tinta-media">
          {etiquetaDia(fechaLocal(estado.fechaEntrega === "manana" ? 1 : 0))} ·
          abre a las {horaLegible(estado.horaApertura)}
        </p>

        <div className="my-5">
          <CintaSabores
            alto={10}
            segmentos={elegidos.map((p) => ({
              color: p.color_hex,
              cantidad: p.cantidad,
              nombre: p.nombre,
            }))}
          />
        </div>

        <ul className="divide-y divide-borde">
          {elegidos.map((p) => (
            <li
              key={p.id}
              className="flex items-baseline justify-between gap-3 py-2.5"
            >
              <span className="text-[16px]">
                {p.nombre}
                {p.presentacion && (
                  <span className="text-tinta-suave"> · {p.presentacion}</span>
                )}
              </span>
              <span className="cifras text-[17px] font-medium">
                {p.cantidad}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-baseline justify-between border-t-2 border-tinta pt-4">
          <span className="font-display text-lg font-semibold">
            Total de botellas
          </span>
          <span className="cifras text-2xl font-bold">{botellas}</span>
        </div>

        <dl className="mt-5 space-y-1.5 text-[15px]">
          <div className="flex justify-between gap-4">
            <dt className="text-tinta-media">Etiquetado</dt>
            <dd className="font-medium">
              {estado.reqEtiquetado ? "Sí" : "No"}
            </dd>
          </div>
          {estado.notas.trim() && (
            <div>
              <dt className="text-tinta-media">Notas</dt>
              <dd className="mt-0.5">{estado.notas}</dd>
            </div>
          )}
        </dl>
      </div>
    </>
  );
}
