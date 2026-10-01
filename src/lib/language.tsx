import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { t as translate, type TranslationKey } from "./i18n";
import type { Language } from "./types";

const STORAGE_KEY = "ai-trust-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "kk" || stored === "ru") setLanguageState(stored);
    } catch {
      /* storage unavailable: keep the default language */
    }
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: language stays for this tab only */
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "ru" ? "kk" : "ru"),
      t: (key: TranslationKey) => translate(language, key),
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
