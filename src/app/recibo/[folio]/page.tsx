import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { etiquetaDia, horaLegible } from "@/lib/fechas";
import { BotonImprimir } from "./boton-imprimir";

/**
 * Una sola página sirve dos propósitos: el "PDF" del cliente (Compartir →
 * Guardar como PDF en el celular) y el botón Imprimir del operador.
 * Un solo artefacto, un solo formato, cero librerías de PDF.
 */
export default async function Recibo({
  params,
}: {
  params: Promise<{ folio: string }>;
}) {
  const { folio } = await params;

  const { data } = await supabaseAdmin
    .from("pedidos")
    .select(
      "folio, establecimiento_nombre, hora_apertura, fecha_entrega, req_etiquetado, notas, total_botellas, pedido_items(producto_nombre, producto_presentacion, categoria, cantidad)",
    )
    .eq("folio", decodeURIComponent(folio))
    .is("eliminado_en", null)
    .maybeSingle();

  if (!data) notFound();

  const items = data.pedido_items ?? [];
  const aguas = items.filter((i) => i.categoria === "agua");
  const pulpas = items.filter((i) => i.categoria === "pulpa");

  return (
    <div className="mx-auto max-w-md bg-superficie p-8 print:max-w-none print:p-0">
      <header className="border-b-2 border-tinta pb-4">
        <p className="text-sm uppercase tracking-wide text-tinta-suave">
          Comprobante de pedido
        </p>
        <p className="cifras mt-1 text-3xl font-bold">{data.folio}</p>
      </header>

      <section className="py-4">
        <p className="font-display text-xl font-semibold">
          {data.establecimiento_nombre}
        </p>
        <p className="mt-1 text-[15px] text-tinta-media">
          Entrega: {etiquetaDia(data.fecha_entrega)}
          <br />
          Abre a las {horaLegible(String(data.hora_apertura).slice(0, 5))}
        </p>
      </section>

      {[
        { titulo: "Bebidas", filas: aguas },
        { titulo: "Pulpas", filas: pulpas },
      ]
        .filter((g) => g.filas.length > 0)
        .map((g) => (
          <section key={g.titulo} className="border-t border-borde py-3">
            <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-tinta-suave">
              {g.titulo}
            </h2>
            <table className="w-full text-[15px]">
              <tbody>
                {g.filas.map((i, n) => (
                  <tr key={n}>
                    <td className="py-1">
                      {i.producto_nombre}
                      {i.producto_presentacion && (
                        <span className="text-tinta-suave">
                          {" "}
                          · {i.producto_presentacion}
                        </span>
                      )}
                    </td>
                    <td className="cifras py-1 text-right font-medium">
                      {i.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

      <section className="flex items-baseline justify-between border-t-2 border-tinta py-4">
        <span className="font-display text-lg font-semibold">
          Total de botellas
        </span>
        <span className="cifras text-2xl font-bold">{data.total_botellas}</span>
      </section>

      <section className="space-y-1 border-t border-borde pt-3 text-[15px]">
        <p>
          <span className="text-tinta-media">Etiquetado:</span>{" "}
          <span className="font-medium">
            {data.req_etiquetado ? "Sí" : "No"}
          </span>
        </p>
        {data.notas && (
          <p>
            <span className="text-tinta-media">Notas:</span> {data.notas}
          </p>
        )}
      </section>

      <BotonImprimir />
    </div>
  );
}
