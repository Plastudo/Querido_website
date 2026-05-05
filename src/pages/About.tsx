import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <main className="flex flex-col items-center justify-center flex-1 py-20 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('about.title')}</h1>
      <p className="text-gray-600 text-lg">{t('about.description')}</p>
    </main>
  );
}
