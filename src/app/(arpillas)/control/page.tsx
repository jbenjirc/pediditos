import Link from "next/link";
import {
  obtenerResumenControl,
  obtenerInventarioActual,
  obtenerEnvios,
} from "@/features/arpillas/consultas";
import { PanelInventario } from "@/features/arpillas/componentes/PanelInventario";
import { TarjetaEnvio } from "@/features/arpillas/componentes/TarjetaEnvio";

export default async function ControlPage() {
  const [resumen, inventario, enviosRecientes] = await Promise.all([
    obtenerResumenControl(),
    obtenerInventarioActual(),
    obtenerEnvios({ limite: 6 }),
  ]);

  return (
    <div className="space-y-8">
      {/* Encabezado Principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl">
            Panel de Control
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Supervisión global de inventario de arpillas, envíos y ventas en sucursales.
          </p>
        </div>
        <Link
          href="/control/envios"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95 sm:self-center"
        >
          <span>Gestionar Envíos</span>
          <span>→</span>
        </Link>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Inventario Total
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                {resumen.totalInventario}
              </span>
              <span className="text-sm font-semibold text-neutral-500">
                arpillas
              </span>
            </div>
          </div>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
            Suma neta en todas las bodegas y puntos
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Envíos en Tránsito
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-sky-600 sm:text-4xl">
                {resumen.enviosEnTransito}
              </span>
              <span className="text-sm font-semibold text-neutral-500">
                pendientes
              </span>
            </div>
          </div>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
            En camino a sucursales por confirmar
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Ventas Registradas
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-emerald-600 sm:text-4xl">
                {resumen.ventasRegistradas}
              </span>
              <span className="text-sm font-semibold text-neutral-500">
                operaciones
              </span>
            </div>
          </div>
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
            Operaciones completadas en receptor
          </p>
        </div>
      </div>

      {/* Existencias por Ubicación */}
      <PanelInventario
        inventario={inventario}
        titulo="Existencias por Ubicación"
        subtitulo="Balance neto calculado a partir de movimientos de inventario."
      />

      {/* Envíos Recientes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">
              Envíos Recientes
            </h2>
            <p className="text-xs text-neutral-500">
              Últimos traslados registrados entre sucursales
            </p>
          </div>
          <Link
            href="/control/envios"
            className="text-xs font-bold text-neutral-700 hover:text-neutral-900 hover:underline"
          >
            Ver todos ({enviosRecientes.length}) →
          </Link>
        </div>

        {enviosRecientes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300/80 bg-white p-8 text-center shadow-xs">
            <span className="text-2xl">🚚</span>
            <p className="mt-2 text-sm font-semibold text-neutral-800">
              No hay envíos registrados todavía
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Registra el primer traslado de arpillas desde la sección de envíos.
            </p>
            <Link
              href="/control/envios"
              className="mt-4 inline-block rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-neutral-800"
            >
              + Nuevo Envío
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enviosRecientes.map((envio) => (
              <TarjetaEnvio key={envio.id} envio={envio} modo="control" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
