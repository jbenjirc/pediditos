"use client";

import { useState } from "react";
import { CANTIDAD_MAX } from "../schemas";

interface SelectorCantidadProps {
  name?: string;
  valorInicial?: number;
  min?: number;
  max?: number;
  etiqueta?: string;
  unidad?: string;
  onChange?: (nuevoValor: number) => void;
}

/**
 * Selector numérico ergonómico para pantallas táctiles de teléfono móvil.
 * Botones amplios (+ / -) con targets generosos (>48px) y lectura numérica grande.
 */
export function SelectorCantidad({
  name = "cantidadArpillas",
  valorInicial = 1,
  min = 1,
  max = CANTIDAD_MAX,
  etiqueta = "Cantidad",
  unidad = "arpillas",
  onChange,
}: SelectorCantidadProps) {
  const [cantidad, setCantidad] = useState(valorInicial);

  const actualizar = (nuevo: number) => {
    const restringido = Math.max(min, Math.min(max, nuevo));
    setCantidad(restringido);
    onChange?.(restringido);
  };

  const decrementar = () => actualizar(cantidad - 1);
  const incrementar = () => actualizar(cantidad + 1);

  return (
    <div className="w-full">
      {etiqueta && (
        <label className="mb-2 block text-sm font-medium text-neutral-700">
          {etiqueta}
        </label>
      )}

      {/* Input oculto para formularios tradicionales de Next.js */}
      {name && <input type="hidden" name={name} value={cantidad} />}

      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-2 shadow-inner">
        <button
          type="button"
          onClick={decrementar}
          disabled={cantidad <= min}
          aria-label="Disminuir cantidad"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-2xl font-semibold text-neutral-800 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:active:scale-100"
        >
          −
        </button>

        <div className="flex flex-col items-center justify-center px-4">
          <input
            type="number"
            min={min}
            max={max}
            value={cantidad}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) actualizar(val);
            }}
            className="w-24 bg-transparent text-center text-3xl font-extrabold tracking-tight text-neutral-900 tabular-nums outline-none"
          />
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {unidad}
          </span>
        </div>

        <button
          type="button"
          onClick={incrementar}
          disabled={cantidad >= max}
          aria-label="Aumentar cantidad"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white text-2xl font-semibold text-neutral-800 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:active:scale-100"
        >
          +
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-neutral-400 px-1">
        <span>Mínimo: {min}</span>
        <span>Máximo: {max}</span>
      </div>
    </div>
  );
}
