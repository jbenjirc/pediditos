"use client";

import { useState, useActionState, useEffect } from "react";
import type { Ubicacion } from "../consultas";
import { SelectorCantidad } from "./SelectorCantidad";
import { CampoEvidencia } from "./CampoEvidencia";
import { aInputLocal } from "../fechas";
import { crearEnvioAccion, type EstadoAccionEnvio } from "../acciones/envios";

interface FormularioNuevoEnvioProps {
  ubicaciones: Ubicacion[];
}

const ESTADO_INICIAL: EstadoAccionEnvio = {};

export function FormularioNuevoEnvio({
  ubicaciones,
}: FormularioNuevoEnvioProps) {
  const [abierto, setAbierto] = useState(false);
  const [estado, formAction, isPending] = useActionState(
    crearEnvioAccion,
    ESTADO_INICIAL,
  );

  const origenes = ubicaciones.filter((u) => u.es_origen);
  const destinos = ubicaciones.filter((u) => u.es_destino);

  const [origenSeleccionado, setOrigenSeleccionado] = useState(
    origenes[0]?.id || ubicaciones[0]?.id || "",
  );
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(
    destinos[0]?.id || ubicaciones[1]?.id || "",
  );

  const mostrarFormulario = abierto && !estado.exito;

  return (
    <div className="w-full">
      {!mostrarFormulario ? (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-[0.99] sm:w-auto sm:px-6"
        >
          <span>+</span>
          <span>Registrar Nuevo Envío</span>
        </button>
      ) : (
        <form
          action={formAction}
          className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Nuevo Envío de Arpillas
              </h2>
              <p className="text-xs text-neutral-500">
                Selecciona la bodega de origen, la sucursal de destino y la cantidad.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
            >
              Cancelar
            </button>
          </div>

          {estado.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {estado.error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Origen */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-700">
                Ubicación de Origen
              </label>
              <select
                name="origenId"
                value={origenSeleccionado}
                onChange={(e) => setOrigenSeleccionado(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              >
                {ubicaciones.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} {u.ciudad ? `(${u.ciudad})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-700">
                Ubicación de Destino
              </label>
              <select
                name="destinoId"
                value={destinoSeleccionado}
                onChange={(e) => setDestinoSeleccionado(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
              >
                {ubicaciones.map((u) => (
                  <option
                    key={u.id}
                    value={u.id}
                    disabled={u.id === origenSeleccionado}
                  >
                    {u.nombre} {u.ciudad ? `(${u.ciudad})` : ""}{" "}
                    {u.id === origenSeleccionado ? "(Mismo que origen)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha y Hora de Envío */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-700">
              Fecha y Hora de Salida
            </label>
            <input
              type="datetime-local"
              name="fechaEnvio"
              defaultValue={aInputLocal()}
              required
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          {/* Selector de Cantidad */}
          <SelectorCantidad
            name="cantidadArpillas"
            valorInicial={10}
            min={1}
            max={50}
            etiqueta="Cantidad de Arpillas a Enviar"
          />

          {/* Evidencia Fotográfica (Camión o Carga) */}
          <CampoEvidencia
            name="evidenciaUrl"
            etiqueta="Foto de Carga / Salida (Opcional en Borrador)"
            requerido={false}
          />

          {/* Notas */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-700">
              Notas u Observaciones del Chofer / Camión
            </label>
            <textarea
              name="notas"
              rows={2}
              maxLength={300}
              placeholder="Ej: Chofer Juan Pérez, placas 123-ABC, carga en buen estado..."
              className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          {/* Botones de Envío */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="submit"
              name="tipoAccion"
              value="borrador"
              disabled={isPending}
              className="rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 active:scale-95 disabled:opacity-50"
            >
              Guardar como Borrador
            </button>
            <button
              type="submit"
              name="tipoAccion"
              value="enviar"
              disabled={isPending}
              className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
            >
              {isPending ? "Procesando…" : "Despachar (Marcar en Camino)"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
