import Link from "next/link";

export default function EnviosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/control" className="hover:text-neutral-900">
              ← Control
            </Link>
            <span>/</span>
            <span>Envíos</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
            Gestión de Envíos
          </h1>
          <p className="text-sm text-neutral-500">
            Registra nuevos traslados de arpillas y monitorea su recepción.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-12 text-center backdrop-blur-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-xl text-neutral-600">
          🚚
        </div>
        <h3 className="mt-4 text-base font-semibold text-neutral-900">
          Historial y Creación de Envíos
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
          Aquí se listarán los envíos por folio, origen, destino y estatus (Borrador, Enviado, Recibido, Cancelado).
        </p>
      </div>
    </div>
  );
}
