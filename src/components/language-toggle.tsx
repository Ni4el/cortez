"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { languages } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, currency, currencies, t, selectLanguage, selectCurrency } = useLocale();
  const [open, setOpen] = useState(false);
  return (
    <div className={`language-picker${open ? " is-open" : ""}`} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      <button type="button" className="language-current" aria-label={t("languageCurrency")} aria-expanded={open} aria-controls="language-options" onClick={() => setOpen((value) => !value)}>{language.code.toUpperCase()}</button>
      <div className="language-options" id="language-options">
        <div className="language-column" role="group" aria-label={t("language")}>
          <span>{t("language")}</span>
          {languages.map((item) => <button type="button" key={item.code} aria-pressed={language.code === item.code} onClick={() => { selectLanguage(item.code); setOpen(false); }}>{item.code.toUpperCase()} <small>{item.name}</small></button>)}
        </div>
        <div className="language-column" role="group" aria-label={t("currency")}>
          <span>{t("currency")}</span>
          {currencies.map((item) => <button type="button" key={item.code} aria-pressed={currency === item.code} onClick={() => { selectCurrency(item.code); setOpen(false); }}>{item.code}</button>)}
        </div>
      </div>
    </div>
  );
}
