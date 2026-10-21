import Link from "next/link";

export default function ReceptorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Recepción y Ventas
          </h1>
          <p className="text-sm text-neutral-500">
            Envíos en camino y registro de ventas locales.
          </p>
        </div>
        <Link
          href="/receptor/venta"
          className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          + Nueva Venta
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">
          Envíos por Recibir
        </h2>
        <div className="mt-4 rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
          No hay envíos pendientes de confirmación en este momento.
        </div>
      </div>
    </div>
  );
}