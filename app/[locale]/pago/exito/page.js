import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('pagoTitle') };
}

export default async function PagoExitoPage({ searchParams }) {
  const params = await searchParams;
  const pieceId = params?.piece;
  const t = await getTranslations('misc');

  return (
    <>
      <Nav />

      <header className="auth-header auth-header-center">
        <Splat width="180px" height="155px" top="-50px" right="-40px" color="yellow" rotate={-12} radius="r1" />
        <Splat width="100px" height="88px" bottom="-30px" left="-25px" color="red" rotate={14} radius="r3" />
        <div className="wrap">
          <p className="auth-header-eyebrow">{t('pagoEyebrow')}</p>
          <h1 className="auth-header-title">{t('pagoTitlePre')} <em>{t('pagoTitleEm')}</em></h1>
          <p className="auth-header-sub">
            {t('pagoSub')}<a href="mailto:mancha.gallery@gmail.com" className="auth-header-mail">mancha.gallery@gmail.com</a>
          </p>
          {pieceId && (
            <Link href={`/obras/${pieceId}/certificado`} className="auth-header-btn">
              {t('pagoCert')}
            </Link>
          )}
        </div>
      </header>

      <Footer />
    </>
  );
}
