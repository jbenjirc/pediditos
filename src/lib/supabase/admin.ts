import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/tipos";

/**
 * Cliente con service_role. Salta RLS por completo.
 *
 * REGLA: este módulo jamás debe importarse desde un Client Component.
 * El import de "server-only" hace que el build falle si alguien lo intenta,
 * en vez de filtrar la llave al navegador en silencio.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.",
  );
}

export const supabaseAdmin = createClient<Database>(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
