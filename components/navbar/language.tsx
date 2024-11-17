'use client'
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Locale } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { GlobeIcon } from '@radix-ui/react-icons';

const LanguageSwitcher: React.FC = () => {
	const t = useTranslations();
	const locale = useLocale();
	const router = useRouter();

	function changeLocale(value: string) {   
		const newLocale = value as Locale;
		document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
		router.refresh();
	}

	return (
		<>
			<Select onValueChange={changeLocale}>
				<SelectTrigger isArrow={false}>
						{t(`localeISO.${locale}`)}
						<GlobeIcon />
				</SelectTrigger>
				<SelectContent>
					{routing.locales.map((lng) => (
						<SelectItem key={lng} value={lng} onClick={() => changeLocale(lng)}>
							{t(`locale.${lng}`)} 
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
};

export default LanguageSwitcher;