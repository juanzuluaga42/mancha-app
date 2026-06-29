import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Splat from './Splat';
import OcultarColeccionista from './OcultarColeccionista';
import { isPreLaunch, isConvocatoria } from '@/lib/fase';

export default async function Footer() {
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria();
  const t = await getTranslations('footer');

  return (
    <footer className="site-footer">
      <Splat width="180px" height="160px" bottom="-55px" right="-50px" color="yellow" rotate={-15} radius="r1" />
      <Splat width="110px" height="95px" top="-30px" left="-35px" color="lilac" rotate={16} radius="r2" />
      <Splat width="60px" height="55px" bottom="18%" right="-25px" color="red" rotate={-8} radius="r3" />
      <Splat width="55px" height="50px" top="10%" right="30%" color="red" rotate={12} radius="r4" />
      <Splat width="50px" height="46px" top="35%" left="40%" color="yellow" rotate={-10} radius="r2" />
      <Splat width="45px" height="42px" bottom="8%" left="20%" color="lilac" rotate={14} radius="r3" />
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand">MANCHA<span>.</span></Link>
            <p>{t('tagline')}</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h5>{t('colInstitution')}</h5>
              <Link href="/curadores">{t('council')}</Link>
              <OcultarColeccionista><Link href="/manifiesto">{t('manifesto')}</Link></OcultarColeccionista>
              {prelaunch ? (
                <>
                  <Link href="/registro">{t('createAccount')}</Link>
                </>
              ) : convocatoria ? (
                <>
                  <Link href="/postular">{t('apply')} →</Link>
                </>
              ) : (
                <>
                  <Link href="/seleccionados">{t('selected')}</Link>
                  <Link href="/obras">{t('catalogue')}</Link>
                  <Link href="/postular">{t('apply')}</Link>
                </>
              )}
              <Link href="/legal">{t('terms')}</Link>
            </div>
            <div className="footer-col">
              <h5>{t('colEditorial')}</h5>
              <Link href="/notas">{t('editorialLink')}</Link>
              <Link href="/indice">{t('indexLink')}</Link>
              <h5 style={{ marginTop: 24 }}>{t('colContact')}</h5>
              <a href="mailto:mancha.gallery@gmail.com">mancha.gallery@gmail.com</a>
              <a href="https://instagram.com/mancha.gallery" target="_blank" rel="noreferrer">Instagram → @mancha.gallery</a>
              <a href="https://wa.me/529981163542" target="_blank" rel="noreferrer">WhatsApp → +52 998 116 3542</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t('rights')}</span>
          {prelaunch || convocatoria
            ? <span>{t('seasonPre')}</span>
            : <span>{t('seasonActive')}</span>}
        </div>
      </div>
    </footer>
  );
}
