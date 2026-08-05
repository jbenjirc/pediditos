import { Suspense } from "react";
import { obtenerCatalogo } from "@/features/catalogo/queries";
import { restarDias } from "@/features/archivo/filtros";
import {
  listarGastos,
  listarProduccion,
  obtenerConceptos,
  obtenerResumenInventario,
} from "@/features/inventario/queries";
import { Agregar } from "@/features/inventario/components/agregar";
import { FiltrosYConteo } from "@/features/inventario/components/filtros-conteo";
import { TablaMovimientos } from "@/features/inventario/components/tabla-movimientos";
import { fechaLocal } from "@/lib/fechas";

export default async function PantallaInventario({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const sp = await searchParams;
  const hoy = fechaLocal();
  const esFecha = (v?: string) =>
    v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;

  const d = esFecha(sp.desde) ?? restarDias(hoy, 29);
  const h = esFecha(sp.hasta) ?? hoy;
  const desde = d <= h ? d : h;
  const hasta = d <= h ? h : d;

  const [catalogo, conceptos, resumen, gastos, produccion] = await Promise.all([
    obtenerCatalogo(),
    obtenerConceptos(),
    obtenerResumenInventario(desde, hasta),
    listarGastos(desde, hasta),
    listarProduccion(desde, hasta),
  ]);

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Inventario
        </h1>
        <p className="mt-0.5 text-[15px] text-tinta-media">
          Registro de producción y gastos.
        </p>
      </header>

      <Agregar catalogo={catalogo} conceptos={conceptos} hoy={hoy} />

      <Suspense>
        <FiltrosYConteo
          resumen={resumen}
          desde={desde}
          hasta={hasta}
          hoy={hoy}
        />
      </Suspense>

      <TablaMovimientos gastos={gastos} produccion={produccion} />
    </>
  );
}
