"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Los filtros viven en la URL, no en useState. Así el operador puede
 * recargar, compartir o abrir en otra tablet sin perder lo que estaba viendo,
 * y la lista se resuelve en el servidor en vez de cargar todo al navegador.
 */
export function FiltrosTablero({
  folioInicial,
  soloEtiquetado,
}: {
  folioInicial: string;
  soloEtiquetado: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [folio, setFolio] = useState(folioInicial);

  // Espera a que deje de teclear: sin esto se dispara una consulta por letra.
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams(params.toString());
      if (folio.trim()) p.set("folio", folio.trim());
      else p.delete("folio");
      router.replace(`/operador/pedidos?${p.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folio]);

  function alternarEtiquetado(activo: boolean) {
    const p = new URLSearchParams(params.toString());
    if (activo) p.set("etiquetado", "1");
    else p.delete("etiquetado");
    router.replace(`/operador/pedidos?${p.toString()}`);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-4">
      <div className="min-w-56 flex-1">
        <label htmlFor="folio" className="sr-only">
          Buscar por folio
        </label>
        <input
          id="folio"
          type="search"
          value={folio}
          onChange={(e) => setFolio(e.target.value)}
          placeholder="Buscar folio"
          className="cifras w-full rounded-caja border border-borde bg-superficie px-4 py-2.5 text-[16px]"
        />
      </div>

      <label className="flex cursor-pointer select-none items-center gap-2.5 text-[15px]">
        <input
          type="checkbox"
          checked={soloEtiquetado}
          onChange={(e) => alternarEtiquetado(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-acento)]"
        />
        Solo con etiquetado
      </label>
    </div>
  );
}
