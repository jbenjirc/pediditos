/**
 * Las funciones RPC lanzan códigos secos (CONFLICTO_VERSION, etc.) para no
 * meter texto de interfaz en la base. La traducción vive aquí.
 */
export function mensajeDeError(error: { message?: string } | null): string {
  const bruto = error?.message ?? "";

  if (bruto.includes("CONFLICTO_VERSION")) {
    return "Alguien más modificó este envío. Recarga y vuelve a intentar.";
  }
  if (bruto.includes("INVENTARIO_INSUFICIENTE")) {
    const [, disponible] = bruto.split(":");
    return `No hay suficientes arpillas. Disponibles: ${disponible ?? 0}.`;
  }
  if (bruto.includes("ESTADO_INVALIDO")) {
    return "Este envío ya no está pendiente de recepción.";
  }
  if (bruto.includes("ENVIO_NO_EXISTE")) return "El envío ya no existe.";
  if (bruto.includes("UBICACION_NO_EXISTE")) return "La ubicación no existe.";
  if (bruto.includes("VENTA_YA_CANCELADA"))
    return "La venta ya estaba cancelada.";
  if (bruto.includes("CANTIDAD_INVALIDA")) return "La cantidad no es válida.";
  if (bruto.includes("MOTIVO_REQUERIDO"))
    return "Escribe el motivo del ajuste.";

  // Índice único de idempotencia: el movimiento ya se había registrado.
  if (bruto.includes("arp_movimientos_referencia_uk")) {
    return "Esta operación ya se había registrado.";
  }

  return "No se pudo completar la operación. Intenta de nuevo.";
}
