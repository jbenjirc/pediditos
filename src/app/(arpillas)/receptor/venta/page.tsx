import Link from "next/link";
import { exigirSesion } from "@/features/arpillas/sesion";
import {
  obtenerInventarioUbicacion,
  obtenerClientes,
} from "@/features/arpillas/consultas";
import { FormularioVenta } from "@/features/arpillas/componentes/FormularioVenta";

export default async function VentaPage() {
  const sesion = await exigirSesion("receptor");
  const ubicacionId = sesion.ubicacionId!;

  const [inventario, clientes] = await Promise.all([
    obtenerInventarioUbicacion(ubicacionId),
    obtenerClientes(),
  ]);

  const stockDisponible = inventario?.existencia ?? 0;
  const ubicacionNombre = sesion.ubicacionNombre ?? "Esta sucursal";

  return (
    <div className="space-y-6">
      {/* Navegación Superior */}
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Link href="/receptor" className="hover:text-neutral-900">
          ← Volver a Recepción
        </Link>
        <span>/</span>
        <span className="font-medium text-neutral-900">Nueva Venta</span>
      </div>

      <FormularioVenta
        clientes={clientes}
        stockDisponible={stockDisponible}
        ubicacionNombre={ubicacionNombre}
      />
    </div>
  );
}
