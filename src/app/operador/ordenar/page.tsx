import {
  obtenerCatalogo,
  obtenerEstablecimientos,
} from "@/features/catalogo/queries";
import { FormularioOrdenar } from "@/features/pedidos/components/formulario-ordenar";

export default async function PantallaOrdenar() {
  const [catalogo, establecimientos] = await Promise.all([
    obtenerCatalogo(),
    obtenerEstablecimientos(),
  ]);

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Ordenar
        </h1>
        <p className="mt-0.5 text-[15px] text-tinta-media">
          Captura de pedidos por teléfono o mostrador.
        </p>
      </header>

      <FormularioOrdenar
        catalogo={catalogo}
        establecimientos={establecimientos}
      />
    </>
  );
}
