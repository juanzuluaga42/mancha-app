import { redirect } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

export default async function TipsPage() {
  const locale = await getLocale();
  redirect({ href: '/notas', locale });
}
