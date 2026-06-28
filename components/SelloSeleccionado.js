import { getTranslations } from 'next-intl/server';

export default async function SelloSeleccionado({ seasonName }) {
  const t = await getTranslations('misc');
  return (
    <div className="sello">
      <span className="sello-dot">●</span>
      <span className="sello-text">
        {t('selloSelected')}{seasonName ? ` · ${seasonName}` : ` ${t('selloBy')}`}
      </span>
    </div>
  );
}
