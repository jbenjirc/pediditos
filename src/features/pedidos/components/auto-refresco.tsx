"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const INTERVALO_MS = 60_000;

/**
 * El tablero se renderiza en el servidor, así que un pedido nuevo no aparece
 * hasta volver a consultar. `router.refresh()` vuelve a pedir los Server
 * Components sin recargar la página: no pierde el scroll ni el estado local
 * de las cards, cosa que sí haría un location.reload().
 *
 * Se pausa cuando la pestaña está oculta y refresca al volver, para no estar
 * consultando la base con la tablet dormida.
 */
export function AutoRefresco() {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [ultima, setUltima] = useState(() => Date.now());
  const [ahora, setAhora] = useState(() => Date.now());

  function refrescar() {
    iniciar(() => {
      router.refresh();
      setUltima(Date.now());
    });
  }

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") refrescar();
    }, INTERVALO_MS);

    const alVolver = () => {
      if (document.visibilityState === "visible") refrescar();
    };
    document.addEventListener("visibilitychange", alVolver);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", alVolver);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tic para que el "hace X" avance solo.
  useEffect(() => {
    const t = setInterval(() => setAhora(Date.now()), 10_000);
    return () => clearInterval(t);
  }, []);

  const segundos = Math.floor((ahora - ultima) / 1000);
  const texto =
    segundos < 15
      ? "recién actualizado"
      : segundos < 60
        ? `hace ${segundos} s`
        : `hace ${Math.floor(segundos / 60)} min`;

  return (
    <div className="flex items-center gap-3">
      <span
        className="text-sm text-tinta-suave"
        aria-live="polite"
        aria-atomic="true"
      >
        {pendiente ? "Actualizando…" : texto}
      </span>
      <button
        type="button"
        onClick={refrescar}
        disabled={pendiente}
        className="rounded-caja border border-borde bg-superficie px-4 py-2.5 text-[15px]
                   text-tinta-media hover:text-tinta disabled:opacity-50"
      >
        Actualizar
      </button>
    </div>
  );
}
