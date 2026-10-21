"use client";

import { useState } from "react";
import type { EnvioDetalle } from "../consultas";
import { ETIQUETA_ESTADO } from "../schemas";
import { formatearFechaHora } from "../fechas";
import { SelectorCantidad } from "./SelectorCantidad";
import { CampoEvidencia } from "./CampoEvidencia";
import { confirmarRecepcionAccion } from "../acciones/recepcion";
import { despacharEnvioAccion, cancelarEnvioAccion } from "../acciones/envios";

interface TarjetaEnvioProps {
  envio: EnvioDetalle;
  modo?: "control" | "receptor";
}

const ESTILOS_BADGE = {
  borrador: "bg-neutral-100 text-neutral-700 border-neutral-200",
  enviado: "bg-sky-50 text-sky-700 border-sky-200",
  recibido: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelado: "bg-red-50 text-red-700 border-red-200",
};

export function TarjetaEnvio({ envio, modo = "control" }: TarjetaEnvioProps) {
  const [mostrandoFormularioRecepcion, setMostrandoFormularioRecepcion] =
    useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const esReceptor = modo === "receptor";
  const esControl = modo === "control";

  const handleDespachar = async () => {
    if (!confirm(`¿Marcar el envío ${envio.folio} como en camino?`)) return;
    setCargando(true);
    setErrorAccion(null);
    const res = await despacharEnvioAccion({
      envioId: envio.id,
      version: envio.version,
    });
    setCargando(false);
    if (!res.exito) setErrorAccion(res.error ?? "Error al despachar");
  };

  const handleCancelar = async () => {
    if (!confirm(`¿Estás seguro de cancelar el envío ${envio.folio}?`)) return;
    setCargando(true);
    setErrorAccion(null);
    const res = await cancelarEnvioAccion({
      envioId: envio.id,
      version: envio.version,
    });
    setCargando(false);
    if (!res.exito) setErrorAccion(res.error ?? "Error al cancelar");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="p-5">
        {/* Encabezado Folio + Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-neutral-900">
              {envio.folio}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                ESTILOS_BADGE[envio.estado]
              }`}
            >
              {ETIQUETA_ESTADO[envio.estado]}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xl font-black text-neutral-900">
              {envio.cantidad_arpillas}
            </span>
            <span className="ml-1 text-xs text-neutral-500">arpillas</span>
          </div>
        </div>

        {/* Origen -> Destino */}
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <span className="font-semibold">{envio.origen_nombre}</span>
          <span className="text-neutral-400">→</span>
          <span className="font-semibold text-neutral-900">
            {envio.destino_nombre}
          </span>
        </div>

        {/* Fechas y Notas */}
        <div className="mt-3 space-y-1 text-xs text-neutral-500">
          <div>Enviado: {formatearFechaHora(envio.fecha_envio)}</div>
          {envio.fecha_recepcion && (
            <div>Recibido: {formatearFechaHora(envio.fecha_recepcion)}</div>
          )}
          {envio.notas && (
            <p className="mt-2 rounded-lg bg-neutral-50 p-2 text-neutral-600 italic">
              &quot;{envio.notas}&quot;
            </p>
          )}
        </div>

        {/* Diferencia o Merma si ya fue recibido */}
        {envio.estado === "recibido" && envio.cantidad_recibida !== null && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 p-3 text-xs">
            <span className="text-neutral-600">
              Recibidas: <strong>{envio.cantidad_recibida}</strong> arpillas
            </span>
            {envio.diferencia !== null && envio.diferencia !== 0 && (
              <span
                className={`font-semibold ${
                  envio.diferencia < 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {envio.diferencia < 0
                  ? `Merma: ${Math.abs(envio.diferencia)}`
                  : `Excedente: +${envio.diferencia}`}
              </span>
            )}
          </div>
        )}

        {/* Enlaces de Evidencia Fotográfica */}
        {(envio.evidencia_url || envio.evidencia_recepcion_url) && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {envio.evidencia_url && (
              <a
                href={envio.evidencia_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                📷 Evidencia Envío
              </a>
            )}
            {envio.evidencia_recepcion_url && (
              <a
                href={envio.evidencia_recepcion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                📸 Evidencia Recepción
              </a>
            )}
          </div>
        )}

        {errorAccion && (
          <p className="mt-3 text-xs font-semibold text-red-600">{errorAccion}</p>
        )}

        {/* Acciones para Control */}
        {esControl && envio.estado === "borrador" && (
          <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-3">
            <button
              type="button"
              disabled={cargando}
              onClick={handleDespachar}
              className="flex-1 rounded-xl bg-neutral-900 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {cargando ? "Actualizando…" : "Despachar (En Camino)"}
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={handleCancelar}
              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Botón para Receptor cuando el envío está en camino */}
        {esReceptor &&
          envio.estado === "enviado" &&
          !mostrandoFormularioRecepcion && (
            <div className="mt-4 border-t border-neutral-100 pt-3">
              <button
                type="button"
                onClick={() => setMostrandoFormularioRecepcion(true)}
                className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                Confirmar Recepción
              </button>
            </div>
          )}
      </div>

      {/* Formulario Expandible de Recepción (para Receptor) */}
      {esReceptor && envio.estado === "enviado" && mostrandoFormularioRecepcion && (
        <form
          action={async (formData) => {
            setCargando(true);
            setErrorAccion(null);
            const res = await confirmarRecepcionAccion({}, formData);
            setCargando(false);
            if (res.exito) {
              setMostrandoFormularioRecepcion(false);
            } else {
              setErrorAccion(res.error ?? "No se pudo confirmar la recepción");
            }
          }}
          className="border-t border-neutral-200 bg-neutral-50 p-5 space-y-4"
        >
          <input type="hidden" name="envioId" value={envio.id} />
          <input type="hidden" name="version" value={envio.version} />

          <h4 className="text-sm font-bold text-neutral-900">
            Recepción del Folio {envio.folio}
          </h4>

          <SelectorCantidad
            name="cantidadRecibida"
            valorInicial={envio.cantidad_arpillas}
            min={0}
            max={50}
            etiqueta="Arpillas recibidas físicamente"
          />

          <CampoEvidencia
            name="evidenciaUrl"
            etiqueta="Foto de descarga / arpillas"
            requerido={true}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-700">
              Notas u observaciones (opcional)
            </label>
            <input
              type="text"
              name="notas"
              maxLength={300}
              placeholder="Ej: Llegaron 2 arpillas rotas..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={cargando}
              className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {cargando ? "Confirmando en base..." : "Registrar Recepción"}
            </button>
            <button
              type="button"
              disabled={cargando}
              onClick={() => setMostrandoFormularioRecepcion(false)}
              className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-white"
            >
              Cerrar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
