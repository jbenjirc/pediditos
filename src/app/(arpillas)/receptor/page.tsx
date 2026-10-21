import Link from "next/link";
import { exigirSesion } from "@/features/arpillas/sesion";
import {
  obtenerEnviosPendientesReceptor,
  obtenerVentas,
  obtenerEnvios,
} from "@/features/arpillas/consultas";
import { TarjetaEnvio } from "@/features/arpillas/componentes/TarjetaEnvio";
import { formatearFechaHora } from "@/features/arpillas/fechas";

export default async function ReceptorPage() {
  const sesion = await exigirSesion("receptor");
  const ubicacionId = sesion.ubicacionId!;

  const [enviosPendientes, ventasRecientes, ultimosRecibidos] =
    await Promise.all([
      obtenerEnviosPendientesReceptor(ubicacionId),
      obtenerVentas({ ubicacionId, limite: 6 }),
      obtenerEnvios({
        destinoId: ubicacionId,
        estado: "recibido",
        limite: 3,
      }),
    ]);

  return (
    <div className="space-y-6">
      {/* Botón Principal de Nueva Venta */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl">
            Recepción y Ventas
          </h1>
          <p className="text-xs text-neutral-500">
            Sucursal: <strong className="text-neutral-800">{sesion.ubicacionNombre}</strong>
          </p>
        </div>
        <Link
          href="/receptor/venta"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-6 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
        >
          <span>+</span>
          <span>Registrar Venta</span>
        </Link>
      </div>

      {/* Sección 1: Envíos en Tránsito hacia esta Sucursal */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Envíos en Camino ({enviosPendientes.length})
          </h2>
          {enviosPendientes.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              Requiere Confirmación
            </span>
          )}
        </div>

        {enviosPendientes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-6 text-center shadow-sm">
            <span className="text-2xl">🚚</span>
            <p className="mt-2 text-sm font-semibold text-neutral-800">
              No hay envíos en camino
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Cuando la bodega central despache arpillas hacia esta sucursal, aparecerán aquí para su confirmación.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {enviosPendientes.map((envio) => (
              <TarjetaEnvio key={envio.id} envio={envio} modo="receptor" />
            ))}
          </div>
        )}
      </section>

      {/* Sección 2: Ventas Recientes en Mostrador */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Ventas Recientes
          </h2>
          <Link
            href="/receptor/venta"
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
          >
            Nueva Venta →
          </Link>
        </div>

        {ventasRecientes.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center text-xs text-neutral-500 shadow-sm">
            Aún no has registrado ventas hoy en esta sucursal.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            {ventasRecientes.map((venta) => (
              <Link
                key={venta.id}
                href={`/receptor/ticket/${venta.folio}`}
                className="flex items-center justify-between p-4 transition hover:bg-neutral-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-neutral-900">
                      {venta.folio}
                    </span>
                    <span className="text-xs text-neutral-500">
                      · {venta.cliente_nombre}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-400">
                    {formatearFechaHora(venta.fecha_venta)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-neutral-900">
                    {venta.cantidad_arpillas} arp.
                  </div>
                  {venta.total !== null && (
                    <div className="text-xs font-semibold text-emerald-600">
                      ${venta.total}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Sección 3: Historial Reciente de Recepciones */}
      {ultimosRecibidos.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
            Últimas Cargas Recibidas
          </h2>
          <div className="space-y-3">
            {ultimosRecibidos.map((envio) => (
              <TarjetaEnvio key={envio.id} envio={envio} modo="receptor" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}