"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/features/arpillas/db";
import {
  crearSesion,
  cerrarSesion,
  comparaSeguro,
  hmacPin,
} from "@/features/arpillas/sesion";

export type EstadoAcceso = { error: string | null };

async function ipCliente(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
}

/**
 * Dos caminos de entrada:
 *
 *   OPERADOR_ARP           -> rol control, sin ubicación (las ve todas)
 *   arp_ubicaciones.pin_hmac -> rol receptor, amarrado a esa ubicación
 *
 * Se reutiliza el rate limiting por IP que ya existe en el proyecto, así que
 * el módulo hereda la protección contra fuerza bruta sin duplicar nada.
 */
export async function iniciarSesion(
  _previo: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  const pin = String(formData.get("pin") ?? "");

  if (!/^\d{4}$/.test(pin)) {
    return { error: "El PIN son 4 dígitos." };
  }

  const db = supabaseAdmin();
  const ip = await ipCliente();

  const { data: bloqueado } = await db.rpc("esta_bloqueado", { p_ip: ip });
  if (bloqueado) {
    return { error: "Demasiados intentos. Espera 15 minutos." };
  }

  // --- 1. ¿Es el PIN del operador de control? ------------------------------
  if (comparaSeguro(pin, process.env.OPERADOR_ARP ?? "")) {
    await crearSesion({
      rol: "control",
      ubicacionId: null,
      ubicacionNombre: null,
    });
    redirect("/control");
  }

  // --- 2. ¿Coincide con el PIN de alguna ubicación? ------------------------
  // Se busca por HMAC, no por PIN: la base nunca ve el número.
  const { data: ubicacion } = await db
    .from("arp_ubicaciones")
    .select("id, nombre")
    .eq("pin_hmac", hmacPin(pin))
    .eq("activo", true)
    .maybeSingle();

  if (ubicacion) {
    await crearSesion({
      rol: "receptor",
      ubicacionId: ubicacion.id,
      ubicacionNombre: ubicacion.nombre,
    });
    redirect("/receptor");
  }

  // --- 3. Ninguno de los dos ------------------------------------------------
  await db.rpc("registrar_intento_fallido", { p_ip: ip });
  return { error: "PIN incorrecto." };
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/arpillas");
}
