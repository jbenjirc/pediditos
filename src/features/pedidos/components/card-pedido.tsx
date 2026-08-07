"use client";

import { useState, useTransition } from "react";
import { CintaSabores } from "@/components/cinta-sabores";
import {
  archivarPedido,
  avanzarEstado,
  cambiarMetodoPago,
  eliminarPedido,
  retrocederEstado,
} from "@/features/pedidos/acciones-operador";
import {
  METODOS_OPERADOR,
  METODOS_PAGO,
} from "@/features/pedidos/metodos-pago";
import { ESTADOS } from "@/features/pedidos/estados";
import type { PedidoTablero } from "@/features/pedidos/queries";
import { horaLegible } from "@/lib/fechas";

export function CardPedido({ pedido }: { pedido: PedidoTablero }) {
  const [error, setError] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [editandoPago, setEditandoPago] = useState(false);
  const [pendiente, iniciar] = useTransition();

  const cfg = ESTADOS[pedido.estado];
  const items = pedido.pedido_items ?? [];
  const aguas = items.filter((i) => i.categoria === "agua");
  const pulpas = items.filter((i) => i.categoria === "pulpa");

  function ejecutar(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    iniciar(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "No se pudo completar la acción.");
    });
  }

  return (
    <article
      className="rounded-caja border border-borde bg-superficie p-4"
      style={{ borderLeft: `4px solid ${cfg.color}`, borderRadius: 0 }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-[17px] font-semibold leading-tight">
            {pedido.establecimiento_nombre}
          </h3>
          <p className="cifras mt-0.5 text-sm text-tinta-suave">
            {pedido.folio}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {pedido.req_etiquetado && (
            <span className="rounded-full bg-aviso/15 px-2.5 py-1 text-xs font-medium text-aviso">
              Etiquetar
            </span>
          )}
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: cfg.color }}
          >
            {cfg.etiqueta}
          </span>
        </div>
      </header>

      <p className="mt-2 text-sm text-tinta-media">
        Abre a las {horaLegible(String(pedido.hora_apertura).slice(0, 5))}
        <span className="text-tinta-suave">
          {" · "}
          pedido{" "}
          {new Date(pedido.creado_en).toLocaleString("es-MX", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </p>

      <div className="my-3">
        <CintaSabores
          alto={6}
          segmentos={items.map((i) => ({
            color: i.productos?.color_hex ?? null,
            cantidad: i.cantidad,
            nombre: i.producto_nombre,
          }))}
        />
      </div>

      <ul className="space-y-0.5 text-[15px]">
        {aguas.map((i, n) => (
          <li key={n} className="flex justify-between gap-3">
            <span>
              {i.producto_nombre}
              <span className="text-tinta-suave">
                {" "}
                · {i.producto_presentacion}
              </span>
            </span>
            <span className="cifras font-medium">{i.cantidad}</span>
          </li>
        ))}
        {pulpas.map((i, n) => (
          <li
            key={`p${n}`}
            className="flex justify-between gap-3 text-tinta-media"
          >
            <span>Pulpa {i.producto_nombre}</span>
            <span className="cifras font-medium">{i.cantidad}</span>
          </li>
        ))}
      </ul>

      <p className="mt-2 flex justify-between border-t border-borde pt-2 text-[15px]">
        <span className="font-medium">Total botellas</span>
        <span className="cifras text-lg font-bold">
          {pedido.total_botellas}
        </span>
      </p>

      <div className="mt-2">
        {editandoPago ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {METODOS_OPERADOR.map((m) => (
              <button
                key={m}
                type="button"
                disabled={pendiente}
                onClick={() => {
                  ejecutar(() => cambiarMetodoPago(pedido.id, m));
                  setEditandoPago(false);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  pedido.metodo_pago === m
                    ? "border-acento bg-acento text-white"
                    : "border-borde text-tinta-media"
                }`}
              >
                {METODOS_PAGO[m].corto}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEditandoPago(false)}
              className="px-2 text-xs text-tinta-suave"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditandoPago(true)}
            className="inline-flex items-center gap-1.5 text-sm text-tinta-media hover:text-tinta"
            title="Cambiar método de pago"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: pedido.metodo_pago
                  ? METODOS_PAGO[pedido.metodo_pago].color
                  : "var(--color-borde-fuerte)",
              }}
              aria-hidden="true"
            />
            {pedido.metodo_pago
              ? METODOS_PAGO[pedido.metodo_pago].etiqueta
              : "Pago sin definir"}
            <span className="text-tinta-suave">·</span>
            <span className="text-xs text-tinta-suave underline underline-offset-2">
              cambiar
            </span>
          </button>
        )}
      </div>

      {pedido.notas && (
        <p className="mt-2 rounded-caja bg-elevado px-3 py-2 text-sm text-tinta-media">
          {pedido.notas}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-alerta">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {cfg.siguiente && (
          <button
            type="button"
            disabled={pendiente}
            onClick={() =>
              ejecutar(() => avanzarEstado(pedido.id, pedido.estado))
            }
            className="flex-1 rounded-caja bg-acento px-4 py-3 text-[15px] font-medium
                       text-white active:bg-acento-vivo disabled:opacity-50"
          >
            {cfg.accion}
          </button>
        )}

        {pedido.estado === "entregado" && (
          <button
            type="button"
            disabled={pendiente}
            onClick={() => ejecutar(() => archivarPedido(pedido.id))}
            className="flex-1 rounded-caja border border-borde px-4 py-3 text-[15px]
                       text-tinta-media disabled:opacity-50"
          >
            Archivar
          </button>
        )}

        <a
          href={`/recibo/${pedido.folio}`}
          target="_blank"
          rel="noopener"
          className="rounded-caja border border-borde px-4 py-3 text-[15px] text-tinta-media"
        >
          Imprimir
        </a>

        {pedido.estado !== "recibido" && (
          <button
            type="button"
            disabled={pendiente}
            onClick={() =>
              ejecutar(() => retrocederEstado(pedido.id, pedido.estado))
            }
            className="rounded-caja px-3 py-3 text-[15px] text-tinta-suave disabled:opacity-50"
            title="Regresar al estado anterior"
          >
            Deshacer
          </button>
        )}
      </div>

      <div className="mt-2 text-right">
        {confirmando ? (
          <span className="inline-flex items-center gap-3 text-sm">
            <span className="text-tinta-media">¿Eliminar este pedido?</span>
            <button
              type="button"
              disabled={pendiente}
              onClick={() => ejecutar(() => eliminarPedido(pedido.id))}
              className="font-medium text-alerta underline underline-offset-4"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="text-tinta-media"
            >
              Cancelar
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="text-sm text-tinta-suave hover:text-alerta"
          >
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
}
