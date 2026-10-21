import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerVentaPorFolio } from "@/features/arpillas/consultas";
import { formatearFechaHora } from "@/features/arpillas/fechas";
import { AccionesTicket } from "@/features/arpillas/componentes/AccionesTicket";

interface Props {
  params: Promise<{ folio: string }>;
}

export default async function TicketPage({ params }: Props) {
  const { folio } = await params;
  const venta = await obtenerVentaPorFolio(folio);

  if (!venta) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Navegación Superior */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 print:hidden">
        <Link href="/receptor" className="hover:text-neutral-900">
          ← Volver a Recepción
        </Link>
        <span>/</span>
        <span className="font-medium text-neutral-900">Ticket {venta.folio}</span>
      </div>

      {/* Tarjeta Tipo Ticket de Venta */}
      <div className="mx-auto max-w-sm overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-md print:border-none print:shadow-none">
        {/* Cabecera del Ticket */}
        <div className="border-b border-dashed border-neutral-300 pb-5 text-center">
          <div className="inline-block rounded-lg bg-neutral-900 px-3 py-1 text-xs font-black tracking-widest text-white uppercase">
            Arpillas
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-neutral-900">
            {venta.folio}
          </h1>
          <p className="mt-1 text-xs text-neutral-500">
            {formatearFechaHora(venta.fecha_venta)}
          </p>

          {venta.cancelada && (
            <div className="mt-3 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-700">
              VENTA CANCELADA
            </div>
          )}
        </div>

        {/* Datos de la Venta */}
        <div className="space-y-3 py-5 text-xs text-neutral-700 border-b border-dashed border-neutral-300">
          <div className="flex justify-between">
            <span className="text-neutral-400">Sucursal de Despacho:</span>
            <span className="font-bold text-neutral-900">{venta.ubicacion_nombre}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-400">Cliente:</span>
            <span className="font-bold text-neutral-900">{venta.cliente_nombre}</span>
          </div>

          {venta.cliente_ciudad && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Ciudad:</span>
              <span className="text-neutral-600">{venta.cliente_ciudad}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2">
            <span className="text-neutral-400">Cantidad:</span>
            <span className="text-base font-black text-neutral-900">
              {venta.cantidad_arpillas} arpillas
            </span>
          </div>

          {venta.precio_unitario !== null && (
            <div className="flex justify-between">
              <span className="text-neutral-400">Precio unitario:</span>
              <span className="font-semibold text-neutral-800">
                ${venta.precio_unitario.toFixed(2)}
              </span>
            </div>
          )}

          {venta.total !== null && (
            <div className="mt-2 flex justify-between items-baseline border-t border-neutral-100 pt-2 text-sm font-black text-neutral-900">
              <span>TOTAL:</span>
              <span className="text-lg text-emerald-700">
                ${venta.total.toFixed(2)}
              </span>
            </div>
          )}

          {venta.notas && (
            <div className="mt-3 rounded-xl bg-neutral-50 p-2.5 text-xs text-neutral-600 italic">
              &quot;{venta.notas}&quot;
            </div>
          )}

          {venta.cancelada && venta.motivo_cancelacion && (
            <div className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700">
              Motivo cancelación: {venta.motivo_cancelacion}
            </div>
          )}
        </div>

        {/* Código de Verificación Decorativo */}
        <div className="pt-4 text-center">
          <div className="mx-auto flex h-8 items-center justify-center gap-1 text-neutral-300">
            <span className="w-1 h-5 bg-neutral-300" />
            <span className="w-2 h-7 bg-neutral-400" />
            <span className="w-0.5 h-6 bg-neutral-300" />
            <span className="w-1.5 h-7 bg-neutral-400" />
            <span className="w-0.5 h-5 bg-neutral-300" />
            <span className="w-2 h-7 bg-neutral-400" />
            <span className="w-1 h-6 bg-neutral-300" />
            <span className="w-0.5 h-7 bg-neutral-400" />
          </div>
          <p className="mt-1 text-[10px] text-neutral-400 uppercase tracking-widest">
            Comprobante Oficial · Pediditos
          </p>
        </div>

        {/* Acciones del Ticket (Imprimir / Compartir / Cancelar) */}
        <div className="mt-6">
          <AccionesTicket
            ventaId={venta.id ?? ""}
            folio={venta.folio}
            clienteNombre={venta.cliente_nombre}
            total={venta.total}
            cancelada={venta.cancelada ?? false}
          />
        </div>
      </div>
    </div>
  );
}
