"use client";

import { useEffect, useState } from "react";

/**
 * Pantalla completa para la tablet del mostrador: gana el alto de la barra
 * del navegador, que es justo lo que falta para que quepa una columna más
 * de cards.
 *
 * OJO: Safari en iPad no soporta la Fullscreen API fuera de video. Ahí el
 * botón simplemente no se muestra, y la alternativa es "Compartir → Añadir a
 * pantalla de inicio", que abre la app sin barra de navegador.
 */
export function BotonPantallaCompleta() {
  const [soportado, setSoportado] = useState(false);
  const [activo, setActivo] = useState(false);

  useEffect(() => {
    setSoportado(typeof document !== "undefined" && document.fullscreenEnabled);

    const alCambiar = () => setActivo(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", alCambiar);
    return () => document.removeEventListener("fullscreenchange", alCambiar);
  }, []);

  if (!soportado) return null;

  async function alternar() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // El navegador puede negarlo si el gesto no viene de un toque directo.
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={activo}
      title={activo ? "Salir de pantalla completa" : "Pantalla completa"}
      className="rounded-caja border border-borde px-3 py-2 text-sm text-tinta-media
                 hover:text-tinta"
    >
      {activo ? "Reducir" : "Pantalla completa"}
    </button>
  );
}
