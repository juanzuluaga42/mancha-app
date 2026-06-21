import { createAdminClient } from '@/utils/supabase/admin';
import { articles } from '@/lib/news';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mancha-app.vercel.app';

export default async function sitemap() {
  const staticRoutes = [
    '', '/obras', '/temporadas', '/sobre-mancha', '/postular',
    '/notas', '/tips', '/legal', '/login', '/registro',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.6,
  }));

  let dynamicRoutes = [];
  try {
    const supabase = createAdminClient();

    const [{ data: pieces }, { data: artists }, { data: seasons }] = await Promise.all([
      supabase.from('pieces').select('id, created_at'),
      supabase.from('artists').select('id, created_at').eq('status', 'approved'),
      supabase.from('seasons').select('id, created_at'),
    ]);

    dynamicRoutes = [
      ...(pieces ?? []).map((p) => ({ url: `${SITE_URL}/obras/${p.id}`, lastModified: p.created_at, priority: 0.7 })),
      ...(artists ?? []).map((a) => ({ url: `${SITE_URL}/artistas/${a.id}`, lastModified: a.created_at, priority: 0.7 })),
      ...(seasons ?? []).map((s) => ({ url: `${SITE_URL}/temporadas/${s.id}`, lastModified: s.created_at, priority: 0.5 })),
      ...articles.map((n) => ({ url: `${SITE_URL}/notas/${n.slug}`, priority: 0.4 })),
    ];
  } catch {
    // Si Supabase no responde durante el build, devolvemos solo las rutas estáticas.
  }

  return [...staticRoutes, ...dynamicRoutes];
}
