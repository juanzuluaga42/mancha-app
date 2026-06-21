import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SOLO para usar en rutas server-to-server sin sesión de usuario (como el
// webhook de Stripe). Esta clave salta todas las reglas de seguridad (RLS),
// así que nunca debe llegar al navegador ni a ningún archivo público.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
