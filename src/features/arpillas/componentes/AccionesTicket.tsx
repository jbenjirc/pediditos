"use client";

import { useState } from "react";
import { cancelarVentaAccion } from "../acciones/ventas";

interface AccionesTicketProps {
  ventaId: string;
  folio: string;
  clienteNombre: string;
  total: number | null;
  cancelada: boolean;
}

export function AccionesTicket({
  ventaId,
  folio,
  clienteNombre,
  total,
  cancelada,
}: AccionesTicketProps) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imprimir = () => {
    window.print();
  };

  const compartir = async () => {
    const texto = `Comprobante de Venta - Arpillas\nFolio: ${folio}\nCliente: ${clienteNombre}\nTotal: $${
      total ?? "0.00"
    }\n¡Gracias por su compra!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket ${folio}`,
          text: texto,
        });
      } catch {
        // Compartir cancelado por el usuario
      }
    } else {
      await navigator.clipboard.writeText(texto);
      alert("Detalle del ticket copiado al portapapeles para compartir.");
    }
  };

  const cancelar = async () => {
    const motivo = prompt(
      "Escribe el motivo de la cancelación de esta venta (el inventario será devuelto a la sucursal):",
    );
    if (!motivo) return;

    setCargando(true);
    setError(null);
    const res = await cancelarVentaAccion({ ventaId, motivo });
    setCargando(false);
    if (!res.exito) {
      setError(res.error ?? "No se pudo cancelar la venta");
    }
  };

  return (
    <div className="space-y-3 print:hidden">
      {error && (
        <p className="text-center text-xs font-bold text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={imprimir}
          className="flex-1 rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
        >
          🖨️ Imprimir
        </button>
        <button
          type="button"
          onClick={compartir}
          className="flex-1 rounded-xl border border-neutral-300 bg-white py-3 text-xs font-bold text-neutral-800 shadow-sm transition hover:bg-neutral-50 active:scale-95"
        >
          📲 Compartir / WhatsApp
        </button>
      </div>

      {!cancelada && (
        <button
          type="button"
          disabled={cargando}
          onClick={cancelar}
          className="w-full rounded-xl border border-red-200 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 active:scale-95 disabled:opacity-50"
        >
          {cargando ? "Cancelando..." : "Cancelar Venta y Revertir Stock"}
        </button>
      )}
    </div>
  );
}
