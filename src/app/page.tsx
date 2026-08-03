import {
  obtenerCatalogo,
  obtenerEstablecimientos,
  UMBRAL_BUSCADOR,
} from "@/features/catalogo/queries";
import { negocioRecordado } from "@/features/pedidos/cookies";
import { WizardPedido } from "@/features/pedidos/components/wizard";

// El catálogo y la lista de negocios cambian poco, pero un pedido con datos
// viejos es peor que uno lento. En Next 16 nada se cachea si no lo pides.
export default async function PantallaCliente() {
  const [catalogo, establecimientos, recordadoId] = await Promise.all([
    obtenerCatalogo(),
    obtenerEstablecimientos(),
    negocioRecordado(),
  ]);

  const recordado = establecimientos.find((e) => e.id === recordadoId) ?? null;

  return (
    <WizardPedido
      catalogo={catalogo}
      establecimientos={establecimientos}
      recordado={recordado}
      mostrarBuscador={establecimientos.length > UMBRAL_BUSCADOR}
    />
  );
}
