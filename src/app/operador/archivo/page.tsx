import { Suspense } from "react";
import { obtenerEstablecimientos } from "@/features/catalogo/queries";
import { leerFiltros } from "@/features/archivo/filtros";
import {
  listarArchivo,
  obtenerResumenProduccion,
} from "@/features/archivo/queries";
import { FiltrosArchivoPanel } from "@/features/archivo/components/filtros-archivo";
import { PanelProduccion } from "@/features/archivo/components/resumen-produccion";
import { TablaArchivo } from "@/features/archivo/components/tabla-archivo";
import { etiquetaDia, fechaLocal } from "@/lib/fechas";

export default async function PantallaArchivo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filtros = leerFiltros(sp);
  const hoy = fechaLocal();
  const buscandoFolio = filtros.folio.length >= 2;

  const [establecimientos, lista, resumen] = await Promise.all([
    obtenerEstablecimientos(),
    listarArchivo(filtros),
    // Con búsqueda por folio el resumen de producción no significa nada:
    // es un pedido, no un periodo.
    buscandoFolio ? null : obtenerResumenProduccion(filtros),
  ]);

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Archivo
        </h1>
        <p className="mt-0.5 text-[15px] text-tinta-media">
          {buscandoFolio
            ? `Buscando "${filtros.folio}" en todo el histórico`
            : filtros.desde === filtros.hasta
              ? etiquetaDia(filtros.desde)
              : `Del ${etiquetaDia(filtros.desde)} al ${etiquetaDia(filtros.hasta)}`}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Suspense>
          <FiltrosArchivoPanel
            filtros={filtros}
            establecimientos={establecimientos}
            hoy={hoy}
          />
        </Suspense>

        <div className="min-w-0">
          {resumen && <PanelProduccion resumen={resumen} />}
          <TablaArchivo
            filas={lista.filas}
            total={lista.total}
            filtros={filtros}
          />
        </div>
      </div>
    </>
  );
}
