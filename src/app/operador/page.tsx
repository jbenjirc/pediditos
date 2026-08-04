import { redirect } from "next/navigation";

/**
 * /operador no es una pantalla, es un contenedor. El operador que teclea la
 * URL a secas espera el tablero, que es donde vive el 90% de su trabajo.
 */
export default function OperadorIndex() {
  redirect("/operador/pedidos");
}
