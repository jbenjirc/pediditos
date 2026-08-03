import { CardPedido } from "./card-pedido";
import type { PedidoTablero } from "@/features/pedidos/queries";

export function ColumnaPedidos({
  titulo,
  pedidos,
  vacio,
}: {
  titulo: string;
  pedidos: PedidoTablero[];
  vacio: string;
}) {
  const botellas = pedidos.reduce((a, p) => a + p.total_botellas, 0);

  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between border-b-2 border-tinta pb-2">
        <h2 className="font-display text-lg font-semibold">{titulo}</h2>
        <p className="text-sm text-tinta-media">
          <span className="cifras font-medium">{pedidos.length}</span> pedidos ·{" "}
          <span className="cifras font-medium">{botellas}</span> botellas
        </p>
      </header>

      {pedidos.length === 0 ? (
        <p className="rounded-caja border border-dashed border-borde px-4 py-10 text-center text-[15px] text-tinta-suave">
          {vacio}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((p) => (
            <CardPedido key={p.id} pedido={p} />
          ))}
        </div>
      )}
    </section>
  );
}
