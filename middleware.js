import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

export async function middleware(request) {
  // 1) next-intl: detección de idioma, cookie NEXT_LOCALE y prefijo /en.
  const response = handleI18n(request);

  // 2) Supabase: refresca la sesión y escribe las cookies en la misma respuesta.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Importante: esto refresca el token si está vencido.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Corre en rutas localizables. Excluye api, auth (OAuth), assets y archivos de metadata.
  matcher: [
    '/((?!api|auth|_next|_vercel|opengraph-image|icon|sitemap|robots|.*\\..*).*)',
  ],
};
