"use client";

import { useLanguage as useProviderLanguage } from "@/components/LanguageProvider";

export function useLanguage() {
  const { language, setLanguage, t } = useProviderLanguage();

  return {
    language,
    text: t,
    changeLanguage: setLanguage,
  };
}