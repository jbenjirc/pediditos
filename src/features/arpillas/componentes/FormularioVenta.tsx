"use client";

import { useState, useActionState, useTransition } from "react";
import Link from "next/link";
import type { Cliente } from "../consultas";
import { SelectorCantidad } from "./SelectorCantidad";
import { aInputLocal } from "../fechas";
import {
  registrarVentaAccion,
  registrarClienteRapidoAccion,
  type EstadoAccionVenta,
} from "../acciones/ventas";

interface FormularioVentaProps {
  clientes: Cliente[];
  stockDisponible: number;
  ubicacionNombre: string;
}

const ESTADO_INICIAL: EstadoAccionVenta = {};

export function FormularioVenta({
  clientes: clientesIniciales,
  stockDisponible,
  ubicacionNombre,
}: FormularioVentaProps) {
  const [clientes, setClientes] = useState(clientesIniciales);
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [mostrandoNuevoCliente, setMostrandoNuevoCliente] = useState(false);
  const [errorCliente, setErrorCliente] = useState<string | null>(null);
  const [isPendingCliente, startClienteTransition] = useTransition();

  const [estado, formAction, isPending] = useActionState(
    registrarVentaAccion,
    ESTADO_INICIAL,
  );

  const numPrecio = parseFloat(precioUnitario) || 0;
  const totalEstimado = cantidad * numPrecio;

  const handleCrearCliente = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorCliente(null);
    const fd = new FormData(e.currentTarget);
    startClienteTransition(async () => {
      const res = await registrarClienteRapidoAccion(fd);
      if (res.exito && res.clienteId) {
        const nuevoNombre = String(fd.get("nombre"));
        const nuevo = {
          id: res.clienteId,
          nombre: nuevoNombre,
          ciudad: String(fd.get("ciudad") || "Local"),
          telefono: String(fd.get("telefono") || ""),
          activo: true,
        };
        setClientes((prev) => [nuevo, ...prev]);
        setClienteId(res.clienteId);
        setMostrandoNuevoCliente(false);
      } else {
        setErrorCliente(res.error ?? "No se pudo crear el cliente");
      }
    });
  };

  if (stockDisponible <= 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center shadow-sm">
        <span className="text-3xl">⚠️</span>
        <h2 className="mt-3 text-base font-bold text-amber-900">
          Sin Inventario Disponible en {ubicacionNombre}
        </h2>
        <p className="mt-1 text-sm text-amber-700">
          El stock actual es de 0 arpillas. Para registrar una venta, confirma
          primero la recepción de un envío de arpillas.
        </p>
        <Link
          href="/receptor"
          className="mt-5 inline-block rounded-xl bg-amber-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-900"
        >
          ← Volver a Recepción
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario Principal de Venta */}
      <form
        action={formAction}
        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-black tracking-tight text-neutral-900">
              Datos de la Venta
            </h2>
            <p className="text-xs text-neutral-500">
              Descontará stock de <strong>{ubicacionNombre}</strong> (Disponibles:{" "}
              <strong className="text-emerald-700">{stockDisponible}</strong>).
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            {stockDisponible} arpillas en stock
          </span>
        </div>

        {estado.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            {estado.error}
          </div>
        )}

        {/* Cliente */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-700">
              Cliente
            </label>
            <button
              type="button"
              onClick={() => setMostrandoNuevoCliente(true)}
              className="text-xs font-bold text-neutral-900 underline hover:text-neutral-600"
            >
              + Nuevo Cliente
            </button>
          </div>
          <select
            name="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-3 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-900"
          >
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.ciudad ? `(${c.ciudad})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha y Hora */}
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-700">
            Fecha y Hora de la Venta
          </label>
          <input
            type="datetime-local"
            name="fechaVenta"
            defaultValue={aInputLocal()}
            required
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />
        </div>

        {/* Selector de Cantidad */}
        <SelectorCantidad
          name="cantidadArpillas"
          valorInicial={1}
          min={1}
          max={Math.min(stockDisponible, 50)}
          etiqueta="Cantidad de Arpillas a Vender"
          onChange={(n) => setCantidad(n)}
        />

        {/* Precio Unitario Opcional y Total Estimado */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-700">
              Precio Unitario (Opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-neutral-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precioUnitario"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-neutral-300 bg-white pl-8 pr-3 py-2.5 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 flex flex-col justify-center">
            <span className="text-xs font-medium text-neutral-400">
              Importe Total Estimado
            </span>
            <span className="text-xl font-black text-neutral-900">
              ${totalEstimado.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-700">
            Observaciones o Notas
          </label>
          <input
            type="text"
            name="notas"
            maxLength={300}
            placeholder="Ej: Pago de contado, retiro en mostrador..."
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
          />
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-neutral-900 py-4 text-base font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? "Registrando venta..." : "Confirmar Venta y Generar Ticket →"}
        </button>
      </form>

      {/* Modal / Formulario Rápido de Nuevo Cliente */}
      {mostrandoNuevoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleCrearCliente}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                Nuevo Cliente Rápido
              </h3>
              <button
                type="button"
                onClick={() => setMostrandoNuevoCliente(false)}
                className="text-xs font-semibold text-neutral-400 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            {errorCliente && (
              <p className="text-xs font-bold text-red-600">{errorCliente}</p>
            )}

            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                required
                autoFocus
                placeholder="Ej: Abarrotes La Esperanza"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">
                Ciudad o Localidad
              </label>
              <input
                type="text"
                name="ciudad"
                placeholder="Ej: Local"
                defaultValue="Local"
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-neutral-700">
                Teléfono (10 dígitos opcional)
              </label>
              <input
                type="tel"
                name="telefono"
                placeholder="10 dígitos"
                maxLength={10}
                className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isPendingCliente}
                className="flex-1 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
              >
                {isPendingCliente ? "Guardando…" : "Guardar Cliente"}
              </button>
              <button
                type="button"
                onClick={() => setMostrandoNuevoCliente(false)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
