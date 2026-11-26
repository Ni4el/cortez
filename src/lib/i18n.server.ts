import { cache } from "react";
import { cookies } from "next/headers";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { getLanguage, getMessages, languages, type Currency } from "@/lib/i18n";
import { getSelectedCurrency, sortCurrencies } from "@/lib/locale-values";

export const getRequestPreferences = cache(async () => {
  const cookieStore = await cookies();
  const language = getLanguage(cookieStore.get("language")?.value);
  let currencies: Currency[] = [
    { code: "PLN", name: "Złoty polski", format_locale: "pl-PL", symbol_position: "locale", max_fraction_digits: 0 },
    { code: "GBP", name: "Funt brytyjski", format_locale: "en-GB", symbol_position: "locale", max_fraction_digits: 2 },
    { code: "EUR", name: "Euro", format_locale: "pl-PL", symbol_position: "locale", max_fraction_digits: 2 },
    { code: "USD", name: "US dollar", format_locale: "pl-PL", symbol_position: "after_no_space", max_fraction_digits: 2 },
  ];
  const defaults: Record<string, string> = Object.fromEntries(languages.map((item) => [item.code, item.defaultCurrency]));
  try {
    const supabase = createPublicSupabaseClient();
    const [currencyResult, defaultResult] = await Promise.all([
      supabase.from("currencies").select("*").order("code"),
      supabase.from("language_currencies").select("language_code,currency_code"),
    ]);
    if (!currencyResult.error && currencyResult.data?.length) currencies = sortCurrencies(currencyResult.data);
    if (!defaultResult.error) for (const item of defaultResult.data ?? []) defaults[item.language_code] = item.currency_code;
  } catch {
    // Static pages remain available when Supabase is not configured.
  }
  const requested = cookieStore.get("currency")?.value;
  const currency = getSelectedCurrency(requested, language, currencies, defaults) ?? "PLN";
  return { language, currency, currencies, defaults, messages: getMessages(language.code) };
});

export async function getLocalizedMetadata(key: string) {
  const { messages } = await getRequestPreferences();
  return { title: messages[key], robots: { index: false, follow: false } };
}
