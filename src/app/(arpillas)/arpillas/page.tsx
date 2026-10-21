"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoAcceso } from "./actions";

const ESTADO_INICIAL: EstadoAcceso = { error: null };

/**
 * Pantalla propia del módulo. Vive en /arpillas y no en /acceso porque esa
 * ruta ya existe en el proyecto: los grupos entre paréntesis no aparecen en
 * la URL, así que duplicar el segmento rompe el build.
 */
export default function AccesoArpillas() {
  const [estado, accion, pendiente] = useActionState(
    iniciarSesion,
    ESTADO_INICIAL,
  );

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 p-6">
      <form
        action={accion}
        className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-sm"
      >
        <h1 className="text-center text-xl font-semibold tracking-tight">
          Arpillas
        </h1>
        <p className="mt-1 text-center text-sm text-neutral-500">
          Escribe tu PIN de 4 dígitos
        </p>

        <input
          name="pin"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          required
          autoFocus
          // Solo onChange: onBeforeInput bloquea la entrada de dígitos en
          // los teclados de Android.
          onChange={(e) => {
            e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
          }}
          className="mt-6 w-full rounded-xl border border-neutral-300 bg-white px-4 py-4 text-center text-3xl tracking-[0.5em] tabular-nums outline-none focus:border-neutral-900"
        />

        {estado.error && (
          <p className="mt-3 text-center text-sm text-red-600">
            {estado.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pendiente}
          className="mt-6 w-full rounded-xl bg-neutral-900 py-3 font-medium text-white disabled:opacity-50"
        >
          {pendiente ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
