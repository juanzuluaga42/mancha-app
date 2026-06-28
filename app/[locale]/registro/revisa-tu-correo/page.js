import { getTranslations } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export const metadata = { title: 'MANCHA — Revisa tu correo' };

export default async function RevisaTuCorreoPage() {
  const t = await getTranslations('misc');
  return (
    <>
      <Nav />

      <header className="auth-header">
        <Splat width="140px" height="124px" top="-40px" right="-30px" color="yellow" rotate={-8} radius="r2" />
        <Splat width="80px" height="72px" bottom="-24px" left="-20px" color="lilac" rotate={15} radius="r4" />
        <div className="wrap">
          <p className="auth-header-eyebrow">{t('revisaEyebrow')}</p>
          <h1 className="auth-header-title">{t('revisaTitle')}</h1>
          <p className="auth-header-sub">{t('revisaSub')}</p>
        </div>
      </header>

      <Footer />
    </>
  );
}
