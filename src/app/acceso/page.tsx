"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { entrar, type EstadoAcceso } from "@/features/acceso/actions";

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"];

export default function AccesoPage() {
  const [estado, accion, enviando] = useActionState<EstadoAcceso, FormData>(
    entrar,
    { error: null },
  );
  const [pin, setPin] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Al completar 4 dígitos se envía solo: un botón extra sobra.
  useEffect(() => {
    if (pin.length === 4) formRef.current?.requestSubmit();
  }, [pin]);

  // Tras un PIN incorrecto se limpia para reintentar sin borrar a mano.
  useEffect(() => {
    if (estado.error) setPin("");
  }, [estado.error]);

  function teclear(t: string) {
    if (enviando) return;
    if (t === "←") setPin((p) => p.slice(0, -1));
    else if (t !== "" && pin.length < 4) setPin((p) => p + t);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-lienzo px-6">
      <div className="w-full max-w-xs">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Acceso al mostrador
        </h1>
        <p className="mt-1 text-sm text-tinta-media">
          Teclea el PIN de 4 dígitos.
        </p>

        {/* Indicador de progreso */}
        <div className="mt-8 flex justify-center gap-4" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={[
                "h-3.5 w-3.5 rounded-full border-2 transition-colors",
                i < pin.length
                  ? "border-acento bg-acento"
                  : "border-borde-fuerte bg-transparent",
              ].join(" ")}
            />
          ))}
        </div>

        <p
          role="status"
          aria-live="polite"
          className="mt-4 min-h-5 text-center text-sm font-medium text-alerta"
        >
          {estado.error}
        </p>

        <form ref={formRef} action={accion} className="mt-4">
          <input type="hidden" name="pin" value={pin} />
          <label className="sr-only" htmlFor="pin-visible">
            PIN
          </label>

          <div className="grid grid-cols-3 gap-3">
            {TECLAS.map((t, i) =>
              t === "" ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => teclear(t)}
                  disabled={enviando}
                  aria-label={t === "←" ? "Borrar" : t}
                  className="cifras h-16 rounded-caja border border-borde bg-superficie text-xl font-medium
                             text-tinta transition-colors active:bg-elevado
                             disabled:opacity-40 md:h-20 md:text-2xl"
                >
                  {t}
                </button>
              ),
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-tinta-suave">
          {enviando ? "Verificando…" : "\u00a0"}
        </p>
      </div>
    </div>
  );
}
