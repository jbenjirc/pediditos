import { Suspense } from "react";
import { ESTADOS } from "@/features/pedidos/estados";
import {
  buscarPorFolio,
  obtenerPedidosDelDia,
} from "@/features/pedidos/queries";
import { ColumnaPedidos } from "@/features/pedidos/components/columna-pedidos";
import { FiltrosTablero } from "@/features/pedidos/components/filtros-tablero";
import { etiquetaDia, fechaLocal } from "@/lib/fechas";

export default async function PantallaPedidos({
  searchParams,
}: {
  searchParams: Promise<{ folio?: string; etiquetado?: string }>;
}) {
  const { folio = "", etiquetado } = await searchParams;
  const soloEtiquetado = etiquetado === "1";
  const buscando = folio.trim().length >= 2;
  const hoy = fechaLocal();

  let pedidos = buscando
    ? await buscarPorFolio(folio)
    : await obtenerPedidosDelDia(hoy);

  if (soloEtiquetado) {
    pedidos = pedidos.filter((p) => p.req_etiquetado);
  }

  const pendientes = pedidos.filter(
    (p) => ESTADOS[p.estado].columna === "pendientes",
  );
  const completados = pedidos.filter(
    (p) => ESTADOS[p.estado].columna === "completados",
  );

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {buscando ? `Resultados para "${folio}"` : "Pedidos de hoy"}
        </h1>
        <p className="mt-0.5 text-[15px] text-tinta-media">
          {buscando
            ? "La búsqueda por folio incluye pedidos de cualquier día."
            : etiquetaDia(hoy)}
        </p>
      </header>

      <Suspense>
        <FiltrosTablero folioInicial={folio} soloEtiquetado={soloEtiquetado} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <ColumnaPedidos
          titulo="Pendientes"
          pedidos={pendientes}
          vacio={
            soloEtiquetado
              ? "Ningún pendiente necesita etiquetado."
              : "Todo al día. No hay pedidos por preparar."
          }
        />
        <ColumnaPedidos
          titulo="Completados"
          pedidos={completados}
          vacio="Aún no sale nada a reparto."
        />
      </div>
    </>
  );
}
