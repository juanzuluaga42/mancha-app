import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

// Idioma por defecto en la PRIMERA visita. El sitio abre en inglés aunque el
// navegador esté en otro idioma; la elección del usuario manda a partir de ahí.
const FIRST_VISIT_LOCALE = 'en';

export async function middleware(request) {
  // 0) Primera visita (sin cookie NEXT_LOCALE): forzamos inglés inyectando la
  //    cookie en el request para que next-intl lo trate como idioma elegido
  //    (redirige "/" → "/en"). Si ya hay preferencia guardada —next-intl la
  //    escribe al cambiar de idioma desde las banderas— se respeta y NO se toca.
  const firstVisit = !request.cookies.has('NEXT_LOCALE');
  if (firstVisit) {
    request.cookies.set('NEXT_LOCALE', FIRST_VISIT_LOCALE);
  }

  // 1) next-intl: detección de idioma, cookie NEXT_LOCALE y prefijo /en.
  const response = handleI18n(request);

  // Persistimos la preferencia inicial para que la próxima visita siga en inglés
  // (hasta que el usuario elija otro idioma).
  if (firstVisit) {
    response.cookies.set('NEXT_LOCALE', FIRST_VISIT_LOCALE, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

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
