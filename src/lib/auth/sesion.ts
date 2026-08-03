import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "sesion_operador";
const DIAS = 30;

function secreto(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "SESSION_SECRET ausente o demasiado corto (mínimo 16 caracteres).",
    );
  }
  return s;
}

function firmar(payload: string): string {
  return createHmac("sha256", secreto()).update(payload).digest("base64url");
}

/** Comparación en tiempo constante: no filtra información por latencia. */
function igualSeguro(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export async function crearSesion(): Promise<void> {
  const expira = Date.now() + DIAS * 24 * 60 * 60 * 1000;
  const payload = String(expira);
  const token = `${payload}.${firmar(payload)}`;

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });
}

export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Verifica la cookie firmada. Se llama en el layout guard Y al inicio de cada
 * Server Action que muta datos: defensa en profundidad, no un solo candado.
 */
export async function haySesion(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return false;

  const corte = token.lastIndexOf(".");
  if (corte < 1) return false;

  const payload = token.slice(0, corte);
  const firma = token.slice(corte + 1);

  if (!igualSeguro(firma, firmar(payload))) return false;

  const expira = Number(payload);
  return Number.isFinite(expira) && expira > Date.now();
}

/** Úsala al inicio de toda Server Action del operador. */
export async function exigirSesion(): Promise<void> {
  if (!(await haySesion())) {
    throw new Error("Sesión no válida. Vuelve a ingresar el PIN.");
  }
}
