"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { salir } from "@/features/acceso/actions";

const SECCIONES = [
  { href: "/operador/ordenar", etiqueta: "Ordenar" },
  { href: "/operador/pedidos", etiqueta: "Pedidos" },
  { href: "/operador/inventario", etiqueta: "Inventario" },
  { href: "/operador/archivo", etiqueta: "Archivo" },
] as const;

export function NavOperador() {
  const ruta = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-superficie/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 md:px-8">
        <span className="font-display text-lg font-semibold tracking-tight">
          Pedidos
        </span>

        <nav aria-label="Secciones" className="flex-1">
          <ul className="flex gap-1">
            {SECCIONES.map(({ href, etiqueta }) => {
              const activo = ruta.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={activo ? "page" : undefined}
                    className={[
                      "block border-b-2 px-4 py-4 text-[15px] font-medium transition-colors",
                      activo
                        ? "border-acento text-acento"
                        : "border-transparent text-tinta-media hover:text-tinta",
                    ].join(" ")}
                  >
                    {etiqueta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <form action={salir}>
          <button
            type="submit"
            className="rounded-caja px-3 py-2 text-sm text-tinta-suave hover:text-alerta"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
