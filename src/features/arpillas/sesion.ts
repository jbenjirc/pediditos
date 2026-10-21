import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Sesión propia del módulo de arpillas.
 *
 * Cookie distinta a la de lib/auth/sesion.ts a propósito: cerrar sesión aquí
 * no tumba al operador de pedidos, y una fuga en cualquiera de las dos no
 * compromete a la otra.
 *
 * No hay usuarios individuales: el PIN identifica un rol y, en el caso del
 * receptor, una ubicación. Eso es todo lo que la sesión necesita cargar.
 */

const COOKIE = "arp_sesion";
const DURACION_HORAS = 12;
const RUTA_ACCESO = "/arpillas";

export type RolApp = "control" | "receptor";

export type Sesion = {
  rol: RolApp;
  /** Solo el receptor la trae. El control ve todas las ubicaciones. */
  ubicacionId: string | null;
  ubicacionNombre: string | null;
  /** Epoch en milisegundos. */
  exp: number;
};

function secreto(): string {
  const valor = process.env.ARP_SESSION_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error("ARP_SESSION_SECRET ausente o de menos de 32 caracteres");
  }
  return valor;
}

// ---------------------------------------------------------------------------
// PIN de ubicación
// ---------------------------------------------------------------------------

/**
 * HMAC del PIN de una ubicación, para comparar contra arp_ubicaciones.pin_hmac.
 *
 * El prefijo "pin:" separa este uso del secreto de la firma de la cookie: sin
 * él, un token de sesión y un PIN compartirían espacio de hashes. Si cambias
 * el prefijo, todos los PINes sembrados dejan de funcionar.
 */
export function hmacPin(pin: string): string {
  return createHmac("sha256", secreto()).update(`pin:${pin}`).digest("hex");
}

/** Comparación en tiempo constante de dos cadenas de largo arbitrario. */
export function comparaSeguro(a: string, b: string): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const bufA = Buffer.from(a.padEnd(64, "\0"));
  const bufB = Buffer.from(b.padEnd(64, "\0"));
  return timingSafeEqual(bufA, bufB) && a.length === b.length;
}

// ---------------------------------------------------------------------------
// Cookie firmada
// ---------------------------------------------------------------------------

function firmar(payload: string): string {
  return createHmac("sha256", secreto()).update(payload).digest("base64url");
}

/** Formato del token: <payload en base64url>.<firma HMAC-SHA256> */
export function serializar(sesion: Sesion): string {
  const payload = Buffer.from(JSON.stringify(sesion)).toString("base64url");
  return `${payload}.${firmar(payload)}`;
}

export function verificar(token: string): Sesion | null {
  const [payload, firma] = token.split(".");
  if (!payload || !firma) return null;

  const recibida = Buffer.from(firma);
  const esperada = Buffer.from(firmar(payload));
  if (recibida.length !== esperada.length) return null;
  if (!timingSafeEqual(recibida, esperada)) return null;

  try {
    const sesion = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Sesion;
    if (typeof sesion.exp !== "number" || sesion.exp < Date.now()) return null;
    if (sesion.rol !== "control" && sesion.rol !== "receptor") return null;
    // Un receptor sin ubicación no puede operar: sesión inválida.
    if (sesion.rol === "receptor" && !sesion.ubicacionId) return null;
    return sesion;
  } catch {
    return null;
  }
}

export async function crearSesion(datos: Omit<Sesion, "exp">): Promise<void> {
  const sesion: Sesion = {
    ...datos,
    exp: Date.now() + DURACION_HORAS * 60 * 60 * 1000,
  };
  const store = await cookies();
  store.set(COOKIE, serializar(sesion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACION_HORAS * 60 * 60,
  });
}

export async function leerSesion(): Promise<Sesion | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? verificar(token) : null;
}

export async function cerrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/**
 * Guard de servidor. No se usa middleware porque la firma va con node:crypto
 * y el middleware corre en runtime Edge.
 */
export async function exigirSesion(rol: RolApp): Promise<Sesion> {
  const sesion = await leerSesion();
  if (!sesion) redirect(RUTA_ACCESO);
  if (sesion.rol !== rol) {
    redirect(sesion.rol === "control" ? "/control" : "/receptor");
  }
  return sesion;
}
