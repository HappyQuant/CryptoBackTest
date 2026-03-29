import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language, translations, t } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }, []);

  const translate = useCallback((key: string) => {
    return t(language, key);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
