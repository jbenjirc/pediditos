import Link from "next/link";
import { obtenerUbicaciones, obtenerEnvios } from "@/features/arpillas/consultas";
import { TarjetaEnvio } from "@/features/arpillas/componentes/TarjetaEnvio";
import { FormularioNuevoEnvio } from "@/features/arpillas/componentes/FormularioNuevoEnvio";

export default async function EnviosPage() {
  const [ubicaciones, envios] = await Promise.all([
    obtenerUbicaciones(),
    obtenerEnvios(),
  ]);

  const enviosEnCamino = envios.filter((e) => e.estado === "enviado");
  const enviosBorrador = envios.filter((e) => e.estado === "borrador");
  const enviosRecibidos = envios.filter((e) => e.estado === "recibido");

  return (
    <div className="space-y-8">
      {/* Encabezado y Breadcrumbs */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <Link href="/control" className="hover:text-neutral-900 transition">
              Control
            </Link>
            <span>/</span>
            <span className="text-neutral-800">Envíos</span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl">
            Gestión de Envíos
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Registra nuevos traslados de arpillas y monitorea su recepción en cada sucursal.
          </p>
        </div>
      </div>

      {/* Formulario de Nuevo Envío */}
      <FormularioNuevoEnvio ubicaciones={ubicaciones} />

      {/* Sección Historial de Envíos con Badges de Estado Integrados */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 border-b border-neutral-200/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900">
              Historial de Envíos
            </h2>
            <p className="text-xs text-neutral-500">
              Listado general de traslados y seguimiento de merma
            </p>
          </div>

          {/* Filtros / Resumen Rápido de Estados */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-xl border border-neutral-200 bg-white px-3 py-1 text-neutral-700 shadow-xs">
              Total: {envios.length}
            </span>
            <span className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
              En Tránsito: {enviosEnCamino.length}
            </span>
            <span className="rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-1 text-neutral-600">
              Borradores: {enviosBorrador.length}
            </span>
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              Recibidos: {enviosRecibidos.length}
            </span>
          </div>
        </div>

        {/* Grid de Envíos */}
        {envios.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300/80 bg-white p-10 text-center shadow-xs">
            <span className="text-3xl">🚚</span>
            <p className="mt-2 text-sm font-semibold text-neutral-800">
              No hay envíos registrados
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Haz clic arriba en &quot;Registrar Nuevo Envío&quot; para despachar o programar un traslado de arpillas.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {envios.map((envio) => (
              <TarjetaEnvio key={envio.id} envio={envio} modo="control" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
