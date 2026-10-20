import type { ReactNode } from "react";
import { exigirSesion } from "@/features/arpillas/sesion";
import { salir } from "../arpillas/actions";

/**
 * Guard de servidor. Se ejecuta antes que cualquier página bajo /control,
 * así que ninguna ruta hija repite la verificación.
 */
export default async function ControlLayout({
  children,
}: {
  children: ReactNode;
}) {
  await exigirSesion("control");

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
        <span className="text-lg font-semibold tracking-tight">Arpillas</span>
        <form action={salir}>
          <button type="submit" className="text-sm text-neutral-500">
            Salir
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-6">{children}</main>
    </div>
  );
}
