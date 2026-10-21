import Link from "next/link";

export default function VentaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/receptor" className="hover:text-neutral-900">
          ← Volver
        </Link>
        <span>/</span>
        <span>Nueva Venta</span>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          Registrar Venta de Arpillas
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Descuenta automáticamente el stock de esta ubicación.
        </p>

        <div className="mt-6 rounded-xl border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
          Formulario de venta en preparación...
        </div>
      </div>
    </div>
  );
}
