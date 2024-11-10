'use client'
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { setUserLocale } from '@/services/locale';
import { Locale } from '@/i18n/config';
import { routing } from '@/i18n/routing';
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

	function changeLocale(value: string) {   
		const newLocale = value as Locale;
		setUserLocale(newLocale);
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