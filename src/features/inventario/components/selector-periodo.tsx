"use client";

import { useRouter } from "next/navigation";
import { primerDiaDelMes, restarDias } from "@/features/archivo/filtros";

export function SelectorPeriodo({
  desde,
  hasta,
  hoy,
}: {
  desde: string;
  hasta: string;
  hoy: string;
}) {
  const router = useRouter();

  function ir(d: string, h: string) {
    router.replace(`/operador/inventario?desde=${d}&hasta=${h}`);
  }

  const atajos = [
    { texto: "Hoy", d: hoy, h: hoy },
    { texto: "7 días", d: restarDias(hoy, 6), h: hoy },
    { texto: "30 días", d: restarDias(hoy, 29), h: hoy },
    { texto: "Este mes", d: primerDiaDelMes(hoy), h: hoy },
    { texto: "90 días", d: restarDias(hoy, 89), h: hoy },
  ];

  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3">
      <div className="flex flex-wrap gap-1.5">
        {atajos.map((a) => {
          const activo = desde === a.d && hasta === a.h;
          return (
            <button
              key={a.texto}
              type="button"
              onClick={() => ir(a.d, a.h)}
              className={`rounded-full border px-3.5 py-1.5 text-sm ${
                activo
                  ? "border-acento bg-acento/5 font-medium text-acento"
                  : "border-borde bg-superficie text-tinta-media"
              }`}
            >
              {a.texto}
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <input
          type="date"
          value={desde}
          max={hasta}
          onChange={(e) => ir(e.target.value, hasta)}
          aria-label="Desde"
          className="cifras rounded-caja border border-borde bg-superficie px-3 py-1.5 text-sm"
        />
        <span className="text-tinta-suave">→</span>
        <input
          type="date"
          value={hasta}
          min={desde}
          onChange={(e) => ir(desde, e.target.value)}
          aria-label="Hasta"
          className="cifras rounded-caja border border-borde bg-superficie px-3 py-1.5 text-sm"
        />
      </div>
    </div>
  );
}
