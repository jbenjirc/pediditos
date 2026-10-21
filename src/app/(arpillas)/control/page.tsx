import Link from "next/link";

export default function ControlPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Panel de Control · Arpillas
          </h1>
          <p className="text-sm text-neutral-500">
            Supervisión de inventario global, envíos y ventas entre sucursales.
          </p>
        </div>
        <Link
          href="/control/envios"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          Gestionar Envíos →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Inventario Total
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-900">
              --
            </span>
            <span className="text-sm text-neutral-500">arpillas</span>
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            Conectando con arp_inventario_actual...
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Envíos en Tránsito
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-900">
              --
            </span>
            <span className="text-sm text-neutral-500">pendientes</span>
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            Envíos en estado &quot;enviado&quot;
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Ventas del Día
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-neutral-900">
              --
            </span>
            <span className="text-sm text-neutral-500">registradas</span>
          </div>
          <p className="mt-3 text-xs text-neutral-400">
            Acumulado por ubicaciones
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-xl text-neutral-600">
          📦
        </div>
        <h3 className="mt-3 text-base font-semibold text-neutral-900">
          Módulo en Construcción
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">
          El panel principal de control está listo para vincularse con las consultas de stock en tiempo real y el flujo de envíos.
        </p>
      </div>
    </div>
  );
}
