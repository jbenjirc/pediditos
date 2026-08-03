import { redirect } from "next/navigation";
import { haySesion } from "@/lib/auth/sesion";
import { NavOperador } from "@/components/nav-operador";

/**
 * Server Layout Guard.
 * En Next.js 16 la autenticación NO va en proxy.ts: se verifica aquí, en el
 * servidor, antes de renderizar cualquier hijo. Nada de esta rama llega al
 * navegador sin sesión válida.
 */
export default async function OperadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await haySesion())) {
    redirect("/acceso");
  }

  return (
    <div className="min-h-dvh bg-lienzo">
      <NavOperador />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
