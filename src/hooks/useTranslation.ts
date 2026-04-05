'use client';

import { useFinance } from '@/context/FinanceContext';
import { translations, TranslationKey, Language } from '@/lib/translations';

export const useTranslation = () => {
  const { state } = useFinance();
  const lang: Language = (state.userProfile?.language as Language) || 'en';

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key];
  };

  return { t, currentLang: lang };
};
