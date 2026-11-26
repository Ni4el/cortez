import languagesJson from "@/i18n/languages.json";
import messagesJson from "@/i18n/messages.json";

export type Language = { code: string; name: string; locale: string; defaultCurrency: string };
export type Currency = { code: string; name: string; format_locale: string; symbol_position: string; max_fraction_digits: number };
export const languages: Language[] = languagesJson;
const dictionaries: Record<string, Record<string, string>> = messagesJson;

export function getLanguage(code?: string): Language {
  return languages.find((language) => language.code === code) ?? languages[0];
}

export function getMessages(code: string): Record<string, string> {
  return { ...dictionaries.pl, ...dictionaries[code] };
}

export function translate(messages: Record<string, string>, key: string): string {
  return messages[key] ?? key;
}
