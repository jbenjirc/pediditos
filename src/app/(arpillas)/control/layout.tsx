import type { ReactNode } from "react";
import Link from "next/link";
import { exigirSesion } from "@/features/arpillas/sesion";
import { salir } from "../arpillas/actions";

export default async function ControlLayout({
  children,
}: {
  children: ReactNode;
}) {
  await exigirSesion("control");

  return (
    <div className="min-h-dvh bg-neutral-50/70 text-neutral-900 antialiased">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/control" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-sm font-black text-white shadow-sm">
                📦
              </span>
              <span className="text-base font-black tracking-tight text-neutral-900">
                Arpillas
              </span>
              <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Control
              </span>
            </Link>

            {/* Pestañas de Navegación */}
            <nav className="hidden items-center gap-1 sm:flex">
              <Link
                href="/control"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                Panel Resumen
              </Link>
              <Link
                href="/control/envios"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                Gestión de Envíos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <form action={salir}>
              <button
                type="submit"
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-95"
              >
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Contenido Principal con espaciado consistente */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
