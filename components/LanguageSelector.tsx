"use client";

import { LANGUAGES } from "@/lib/i18n";
import { useLanguage } from "@/hooks/useLanguage";

export default function LanguageSelector({ light = false }: { light?: boolean }) {
  const { language, changeLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex overflow-hidden rounded-lg border text-xs font-semibold ${
        light ? "border-white/60" : "border-slate-400"
      }`}
    >
      {LANGUAGES.map(({ code, label }) => {
        const active = language === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => changeLanguage(code)}
            aria-pressed={active}
            className={`px-3 py-1.5 transition ${
              active
                ? "bg-[#0b2a5b] text-white"
                : light
                ? "bg-transparent text-white hover:bg-white/10"
                : "bg-white text-slate-900 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}