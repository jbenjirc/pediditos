"use client";

import { useState, useRef, useTransition } from "react";
import { subirEvidenciaAccion } from "../acciones/evidencia";

interface CampoEvidenciaProps {
  name?: string;
  etiqueta?: string;
  requerido?: boolean;
  valorInicial?: string;
  onFotoSubida?: (url: string) => void;
}

/**
 * Campo para captura o subida de evidencia fotográfica.
 * Diseñado para teléfonos móviles: activa la cámara trasera con `capture="environment"`.
 * Realiza la subida al Storage de Supabase en segundo plano y previsualiza la imagen.
 */
export function CampoEvidencia({
  name = "evidenciaUrl",
  etiqueta = "Foto de Evidencia",
  requerido = false,
  valorInicial = "",
  onFotoSubida,
}: CampoEvidenciaProps) {
  const [url, setUrl] = useState(valorInicial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const procesarArchivo = async (archivo: File) => {
    setError(null);
    const fd = new FormData();
    fd.append("archivo", archivo);

    startTransition(async () => {
      const res = await subirEvidenciaAccion(fd);
      if (res.exito) {
        setUrl(res.url);
        onFotoSubida?.(res.url);
      } else {
        setError(res.error);
      }
    });
  };

  const limpiar = () => {
    setUrl("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-700">
          {etiqueta} {requerido && <span className="text-red-500">*</span>}
        </label>
        {url && (
          <button
            type="button"
            onClick={limpiar}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Quitar foto
          </button>
        )}
      </div>

      {/* Input oculto para propagar la URL en formularios */}
      <input type="hidden" name={name} value={url} required={requerido} />

      {/* Input de archivo real */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const archivo = e.target.files?.[0];
          if (archivo) procesarArchivo(archivo);
        }}
      />

      {url ? (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-900 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Evidencia cargada"
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Evidencia guardada
            </span>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md transition hover:bg-white/30"
            >
              Cambiar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/80 p-6 text-center transition hover:border-neutral-400 hover:bg-neutral-100/70 active:scale-[0.99]"
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
              <span className="text-sm font-medium text-neutral-600">
                Subiendo foto a Supabase...
              </span>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                📷
              </div>
              <span className="mt-3 text-sm font-semibold text-neutral-900">
                Tomar foto o subir evidencia
              </span>
              <span className="mt-1 text-xs text-neutral-500">
                Abre la cámara en celular o galería en computadora
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
