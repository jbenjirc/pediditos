import "server-only";

import { supabaseAdmin as cliente } from "@/lib/supabase/admin";

/**
 * Único punto donde el módulo de arpillas toca el cliente de Supabase del
 * proyecto. No se crea un cliente nuevo: se reutiliza el que ya está en
 * producción, porque es la misma base.
 *
 * lib/supabase/admin.ts exporta el cliente YA INSTANCIADO. Aquí se envuelve
 * en una función para que los consumidores escriban supabaseAdmin().from(...)
 * de forma uniforme. Si algún día ese archivo pasa a exportar una factory,
 * se cambia esta línea y nada más.
 */
export const supabaseAdmin = () => cliente;
