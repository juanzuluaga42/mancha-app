import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import CuratorOnboarding from '@/components/CuratorOnboarding';
import { resolveCurator } from '@/lib/curatorAccess';

export const metadata = { title: 'MANCHA — Incorporación' };

export default async function BienvenidaPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  // El Founder no se incorpora; quien ya terminó, al portal.
  if (curator.role === 'founder' || curator.onboarding_completed_at) redirect('/curaduria');

  const t = await getTranslations('onboarding');

  return (
    <>
      <Nav />
      <div className="onb-page">
        <div className="wrap" style={{ maxWidth: 720 }}>
          {sp?.error === 'acuerdos' && <div className="cur-flash is-err">{t('errorAcuerdos')}</div>}
          <CuratorOnboarding />
        </div>
      </div>
    </>
  );
}
