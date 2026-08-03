// src/features/pedidos/cookies.ts

import "server-only";
import { cookies } from "next/headers";
import { COOKIE_NEGOCIO } from "@/features/pedidos/tipos";

export async function negocioRecordado(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NEGOCIO)?.value ?? null;
}
