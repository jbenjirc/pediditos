"use client";

import { useMemo, useState, useTransition } from "react";
import type { Establecimiento, Producto } from "@/features/catalogo/queries";
import {
  crearPedido,
  olvidarNegocio,
  type ResultadoPedido,
} from "@/features/pedidos/actions";
import {
  PasoCantidades,
  PasoCuando,
  PasoExtras,
  PasoNegocio,
  PasoResumen,
  type EstadoPedido,
} from "./pasos";

const PASOS = ["Negocio", "Cuándo", "Bebidas", "Extras", "Revisar"] as const;

export function WizardPedido({
  catalogo,
  establecimientos,
  recordado,
  mostrarBuscador,
}: {
  catalogo: Producto[];
  establecimientos: Establecimiento[];
  recordado: Establecimiento | null;
  mostrarBuscador: boolean;
}) {
  const [paso, setPaso] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [horaLibre, setHoraLibre] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<Extract<
    ResultadoPedido,
    { ok: true }
  > | null>(null);
  const [enviando, iniciarEnvio] = useTransition();
  const [memoria, setMemoria] = useState(recordado);

  const [estado, setEstado] = useState<EstadoPedido>({
    establecimientoId: recordado?.id ?? null,
    establecimientoNuevo: "",
    fechaEntrega: "hoy",
    horaApertura: recordado?.hora_apertura_default?.slice(0, 5) ?? "07:00",
    cantidades: {},
    reqEtiquetado: false,
    notas: "",
  });

  const set = (p: Partial<EstadoPedido>) => setEstado((e) => ({ ...e, ...p }));

  const totalPiezas = useMemo(
    () => Object.values(estado.cantidades).reduce((a, n) => a + n, 0),
    [estado.cantidades],
  );

  // Cada paso declara qué le falta. El botón no se deshabilita en silencio:
  // se explica qué hace falta para avanzar.
  const faltante: string | null = (() => {
    if (paso === 0) {
      const tiene =
        estado.establecimientoId !== null ||
        estado.establecimientoNuevo.trim().length >= 3;
      return tiene ? null : "Elige tu negocio o escribe su nombre.";
    }
    if (paso === 2)
      return totalPiezas > 0 ? null : "Agrega al menos una bebida.";
    return null;
  })();

  function avanzar() {
    if (faltante) {
      setError(faltante);
      return;
    }
    setError(null);
    setPaso((p) => Math.min(PASOS.length - 1, p + 1));
  }

  function enviar() {
    setError(null);
    iniciarEnvio(async () => {
      const r = await crearPedido({
        establecimientoId: estado.establecimientoId,
        establecimientoNuevo: estado.establecimientoId
          ? null
          : estado.establecimientoNuevo.trim(),
        fechaEntrega: estado.fechaEntrega,
        horaApertura: estado.horaApertura,
        items: Object.entries(estado.cantidades)
          .filter(([, n]) => n > 0)
          .map(([productoId, cantidad]) => ({ productoId, cantidad })),
        reqEtiquetado: estado.reqEtiquetado,
        notas: estado.notas,
      });

      if (r.ok) setExito(r);
      else setError(r.error);
    });
  }

  if (exito) {
    return <ModalEnviado resultado={exito} />;
  }

  const ultimo = paso === PASOS.length - 1;

  return (
    <div className="flex min-h-dvh flex-col bg-lienzo">
      {/* Progreso: segmentos, no porcentaje. Se lee de un vistazo. */}
      <div className="sticky top-0 z-10 bg-lienzo px-5 pb-3 pt-5">
        <div
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={paso + 1}
          aria-valuemin={1}
          aria-valuemax={PASOS.length}
          aria-label={`Paso ${paso + 1} de ${PASOS.length}`}
        >
          {PASOS.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${i <= paso ? "bg-acento" : "bg-borde"}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-tinta-suave">
          Paso {paso + 1} de {PASOS.length} · {PASOS[paso]}
        </p>
      </div>

      <div className="flex-1 px-5 pb-40 pt-4">
        {paso === 0 && (
          <PasoNegocio
            establecimientos={establecimientos}
            recordado={memoria}
            estado={estado}
            set={set}
            onOlvidar={() => {
              setMemoria(null);
              void olvidarNegocio();
            }}
            mostrarBuscador={mostrarBuscador}
            filtro={filtro}
            setFiltro={setFiltro}
          />
        )}
        {paso === 1 && (
          <PasoCuando
            estado={estado}
            set={set}
            horaLibre={horaLibre}
            setHoraLibre={setHoraLibre}
          />
        )}
        {paso === 2 && (
          <PasoCantidades catalogo={catalogo} estado={estado} set={set} />
        )}
        {paso === 3 && <PasoExtras estado={estado} set={set} />}
        {paso === 4 && (
          <PasoResumen
            catalogo={catalogo}
            establecimientos={establecimientos}
            estado={estado}
          />
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-borde bg-superficie px-5 pb-6 pt-4">
        {error && (
          <p role="alert" className="mb-3 text-[15px] font-medium text-alerta">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          {paso > 0 && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setPaso((p) => p - 1);
              }}
              className="rounded-caja border border-borde px-5 py-4 text-[17px] text-tinta-media"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={ultimo ? enviar : avanzar}
            disabled={enviando}
            className="flex-1 rounded-caja bg-acento px-5 py-4 text-[17px] font-medium text-white
                       active:bg-acento-vivo disabled:opacity-60"
          >
            {enviando ? "Enviando…" : ultimo ? "Enviar pedido" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEnviado({
  resultado,
}: {
  resultado: Extract<ResultadoPedido, { ok: true }>;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-lienzo px-6 text-center">
      <div className="w-full max-w-sm rounded-caja border border-borde bg-superficie p-8">
        <p className="text-[15px] text-tinta-media">Pedido recibido</p>

        <p className="cifras mt-3 text-4xl font-bold tracking-tight text-acento">
          {resultado.folio}
        </p>
        <p className="mt-2 text-[15px] text-tinta-media">
          Guarda este folio. Con él puedes preguntar por tu pedido.
        </p>

        <p className="mt-6 border-t border-borde pt-6 text-[17px]">
          <span className="font-medium">{resultado.establecimientoNombre}</span>
          <br />
          <span className="cifras">{resultado.totalBotellas}</span> botellas
        </p>

        <a
          href={`/recibo/${resultado.folio}`}
          className="mt-7 block rounded-caja bg-acento px-5 py-4 text-[17px] font-medium text-white"
        >
          Ver recibo
        </a>
        <a
          href="/"
          className="mt-3 block py-3 text-[15px] text-tinta-media underline underline-offset-4"
        >
          Hacer otro pedido
        </a>
      </div>
    </div>
  );
}
