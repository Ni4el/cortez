"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { languages, translate, type Currency, type Language } from "@/lib/i18n";
import { getDefaultCurrency } from "@/lib/locale-values";

type LocaleContextValue = {
  language: Language;
  currency: string;
  currencies: Currency[];
  defaults: Record<string, string>;
  t: (key: string) => string;
  selectLanguage: (code: string) => void;
  selectCurrency: (code: string) => void;
};
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children, language, currency, currencies, defaults, messages }: {
  children: ReactNode; language: Language; currency: string; currencies: Currency[]; defaults: Record<string, string>; messages: Record<string, string>;
}) {
  const router = useRouter();
  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
  function selectLanguage(code: string) {
    const selected = languages.find((item) => item.code === code);
    if (!selected) return;
    if (selected.code === language.code) return;
    const fallback = getDefaultCurrency(selected, currencies, defaults);
    setCookie("language", selected.code);
    if (fallback) setCookie("currency", fallback);
    router.refresh();
  }
  function selectCurrency(code: string) {
    if (!currencies.some((item) => item.code === code)) return;
    setCookie("currency", code);
    router.refresh();
  }
  return <LocaleContext.Provider value={{ language, currency, currencies, defaults, t: (key) => translate(messages, key), selectLanguage, selectCurrency }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("LocaleProvider is required");
  return context;
}
