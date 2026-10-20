import type { ReactNode } from "react";
import { exigirSesion } from "@/features/arpillas/sesion";
import { supabaseAdmin } from "@/features/arpillas/db";
import { salir } from "@/features/acceso/actions";

/**
 * El receptor siempre opera desde una ubicación, que viene firmada en la
 * cookie. Las páginas hijas la leen de ahí y nunca de la URL ni de un
 * formulario: así no se puede descontar stock de otro punto.
 */
export default async function ReceptorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sesion = await exigirSesion("receptor");

  const { data: inventario } = await supabaseAdmin()
    .from("arp_inventario_actual")
    .select("existencia")
    .eq("ubicacion_id", sesion.ubicacionId!)
    .maybeSingle();

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-base font-semibold">
            {sesion.ubicacionNombre ?? "Ubicación"}
          </span>
          <div className="flex shrink-0 items-baseline gap-3">
            <span className="text-sm text-neutral-500">
              {inventario?.existencia ?? 0} disponibles
            </span>
            <form action={salir}>
              <button type="submit" className="text-sm text-neutral-500">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-lg p-4 pb-24">{children}</main>
    </div>
  );
}
