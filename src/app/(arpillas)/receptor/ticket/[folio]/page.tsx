import Link from "next/link";

interface Props {
  params: Promise<{ folio: string }>;
}

export default async function TicketPage({ params }: Props) {
  const { folio } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/receptor" className="hover:text-neutral-900">
          ← Volver a Receptor
        </Link>
        <span>/</span>
        <span>Ticket</span>
      </div>

      <div className="mx-auto max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-neutral-400">
            Comprobante de Venta
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
            {folio}
          </h1>
        </div>

        <div className="mt-6 border-t border-dashed border-neutral-200 pt-6 text-center text-sm text-neutral-500">
          Detalle del ticket listo para imprimir o compartir.
        </div>
      </div>
    </div>
  );
}
