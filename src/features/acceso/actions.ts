"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { crearSesion, cerrarSesion } from "@/lib/auth/sesion";

export type EstadoAcceso = { error: string | null };

async function ipCliente(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconocida";
}

function pinCorrecto(intento: string): boolean {
  const real = process.env.OPERADOR_PIN ?? "";
  const a = Buffer.from(intento.padEnd(32, "\0"));
  const b = Buffer.from(real.padEnd(32, "\0"));
  return (
    real.length > 0 && timingSafeEqual(a, b) && intento.length === real.length
  );
}

export async function entrar(
  _previo: EstadoAcceso,
  formData: FormData,
): Promise<EstadoAcceso> {
  const pin = String(formData.get("pin") ?? "");

  if (!/^\d{4}$/.test(pin)) {
    return { error: "El PIN son 4 dígitos." };
  }

  const ip = await ipCliente();

  const { data: bloqueado } = await supabaseAdmin.rpc("esta_bloqueado", {
    p_ip: ip,
  });
  if (bloqueado) {
    return { error: "Demasiados intentos. Espera 15 minutos." };
  }

  if (!pinCorrecto(pin)) {
    await supabaseAdmin.rpc("registrar_intento_fallido", { p_ip: ip });
    return { error: "PIN incorrecto." };
  }

  await crearSesion();
  redirect("/operador/pedidos");
}

export async function salir(): Promise<void> {
  await cerrarSesion();
  redirect("/acceso");
}
