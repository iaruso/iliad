'use client'
import Image from "next/image";
import { useTheme } from 'next-themes';
import {useTranslations} from 'next-intl';
import { Button } from "@/components/ui/button";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('HomePage');
  return (
    <>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <h1>{t('title')}</h1>
      <Button>Click me</Button>
      <button onClick={() => setTheme('light')}>Light Mode</button>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </>
  );
}
