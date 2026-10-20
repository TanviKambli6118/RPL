// File: components/LanguageProvider.tsx
// Description: App-wide language state. Wrap the whole app once (in layout.tsx).
// The chosen language is saved in localStorage so it stays on every page.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANGUAGES,
  STORAGE_KEY,
  dictionaries,
  type Language,
  type TranslationKey,
} from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  speechLang: string; // for voice input: en-IN, hi-IN, mr-IN
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((item) => item.code === value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with English on the server and first render to avoid hydration mismatch
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable: language still changes for this session
    }
  }, []);

  const t = useCallback<LanguageContextValue["t"]>(
    (key, vars) => {
      const template =
        dictionaries[language][key] ?? dictionaries.en[key] ?? key;

      if (!vars) return template;

      return template.replace(/\{(\w+)\}/g, (_, name: string) =>
        name in vars ? String(vars[name]) : `{${name}}`
      );
    },
    [language]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      speechLang:
        LANGUAGES.find((item) => item.code === language)?.speechLang ?? "en-IN",
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return context;
}