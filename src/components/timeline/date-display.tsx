import { format } from 'date-fns';
import { pt, enUS } from 'date-fns/locale';

export default function DateDisplay({ date, localeCode }: { date: Date, localeCode: 'pt' | 'en' }) {
  const locale = localeCode === 'pt' ? pt : enUS;
  return <>{format(date, 'yyyy-MM-dd HH:mm', { locale })}</>;
}
