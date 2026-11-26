"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { languages, type Currency } from "@/lib/i18n";
import { sortCurrencies } from "@/lib/locale-values";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

type Translation = { title: string; description: string };

export function AdminTranslations({ kind, id }: { kind: "artwork" | "exhibition"; id: string }) {
  const supabase = createSupabaseBrowserClient();
  const [values, setValues] = useState<Record<string, Translation>>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [message, setMessage] = useState("");
  const table = kind === "artwork" ? "artwork_translations" : "exhibition_translations";
  const owner = kind === "artwork" ? "artwork_id" : "exhibition_id";

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) return;
      const { data, error } = await supabase.from(table).select("*").eq(owner, id);
      if (!active) return;
      if (error) { setMessage(error.message); setLoadFailed(true); }
      else setValues(Object.fromEntries(((data ?? []) as { language_code: string; title: string | null; description: string | null }[]).map((row) => [row.language_code, { title: row.title ?? "", description: row.description ?? "" }])));
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [supabase, table, owner, id]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setMessage("");
    try {
      for (const language of languages) {
        const value = values[language.code];
        const title = value?.title.trim() || null;
        const description = value?.description.trim() || null;
        const result = title || description
          ? kind === "artwork"
            ? await supabase.from("artwork_translations").upsert({ artwork_id: id, language_code: language.code, title, description }, { onConflict: "artwork_id,language_code" })
            : await supabase.from("exhibition_translations").upsert({ exhibition_id: id, language_code: language.code, title, description }, { onConflict: "exhibition_id,language_code" })
          : await supabase.from(table).delete().eq(owner, id).eq("language_code", language.code);
        if (result.error) throw result.error;
      }
      setMessage("Tłumaczenia zapisano.");
    } catch (error) { setMessage(error instanceof Error ? error.message : String((error as { message?: string }).message ?? error)); }
    finally { setBusy(false); }
  }

  return <form className="admin-form admin-inline-form" onSubmit={save}>
    <h2>Tłumaczenia: {kind === "artwork" ? "dzieło" : "wystawa"}</h2>
    <p className="admin-help">Tytuł i opis w głównym formularzu są tekstem źródłowym. Uzupełnione tłumaczenie, także polskie, zastępuje go na stronie. Puste pola wyświetlają tekst źródłowy.</p>
    {languages.map((language) => <fieldset className="admin-form" key={language.code}>
      <legend>{language.name} ({language.code.toUpperCase()})</legend>
      <label className="admin-field">Tytuł<input value={values[language.code]?.title ?? ""} onChange={(event) => setValues({ ...values, [language.code]: { title: event.target.value, description: values[language.code]?.description ?? "" } })} /></label>
      <label className="admin-field">Opis<textarea rows={4} value={values[language.code]?.description ?? ""} onChange={(event) => setValues({ ...values, [language.code]: { title: values[language.code]?.title ?? "", description: event.target.value } })} /></label>
    </fieldset>)}
    {message && <p role="status">{message}</p>}
    <button className="button" disabled={busy || loading || loadFailed}>{busy ? "Zapisuję…" : "Zapisz tłumaczenia"}</button>
  </form>;
}

export function AdminCurrencySettings({ onChange }: { onChange: () => void }) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [defaults, setDefaults] = useState<Record<string, string>>({});
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [formatLocale, setFormatLocale] = useState("pl-PL");
  const [symbolPosition, setSymbolPosition] = useState("locale");
  const [maxFractionDigits, setMaxFractionDigits] = useState(2);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const [currencyResult, defaultResult] = await Promise.all([
      supabase.from("currencies").select("*").order("code"), supabase.from("language_currencies").select("*"),
    ]);
    if (currencyResult.error || defaultResult.error) { setMessage(currencyResult.error?.message ?? defaultResult.error?.message ?? "Błąd odczytu."); return; }
    setCurrencies(sortCurrencies((currencyResult.data ?? []) as Currency[]));
    setDefaults(Object.fromEntries(((defaultResult.data ?? []) as { language_code: string; currency_code: string }[]).map((row) => [row.language_code, row.currency_code])));
  }, [supabase]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function addCurrency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    const cleanCode = code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(cleanCode) || !name.trim()) { setMessage("Podaj trzyliterowy kod waluty i nazwę."); return; }
    let locale: string;
    try { locale = Intl.getCanonicalLocales(formatLocale.trim())[0]; if (!locale) throw new Error(); }
    catch { setMessage("Podaj prawidłowy kod formatu, np. pl-PL lub en-GB."); return; }
    setBusy(true);
    const result = await supabase.from("currencies").insert({ code: cleanCode, name: name.trim(), format_locale: locale, symbol_position: symbolPosition, max_fraction_digits: maxFractionDigits });
    if (result.error) setMessage(result.error.message);
    else { setCode(""); setName(""); setMessage("Walutę dodano."); await load(); onChange(); router.refresh(); }
    setBusy(false);
  }
  async function saveDefault(languageCode: string, currencyCode: string) {
    if (!supabase || !currencyCode) return;
    setBusy(true);
    const result = await supabase.from("language_currencies").upsert({ language_code: languageCode, currency_code: currencyCode }, { onConflict: "language_code" });
    if (result.error) setMessage(result.error.message);
    else { setDefaults((current) => ({ ...current, [languageCode]: currencyCode })); setMessage("Walutę domyślną zapisano."); onChange(); router.refresh(); }
    setBusy(false);
  }

  return <div className="admin-columns">
    <form className="admin-form admin-editor" onSubmit={addCurrency}>
      <h2>Waluty</h2>
      <p className="admin-help">Ceny w każdej walucie wpisuje się osobno przy dziele.</p>
      <div className="admin-list">{currencies.map((item) => <p key={item.code}>{item.code} — {item.name} ({item.format_locale}, {item.max_fraction_digits} miejsc po przecinku)</p>)}</div>
      <label className="admin-field">Kod waluty (ISO 4217)<input value={code} maxLength={3} onChange={(event) => setCode(event.target.value.toUpperCase())} required /></label>
      <label className="admin-field">Nazwa<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
      <label className="admin-field">Format lokalny<input value={formatLocale} onChange={(event) => setFormatLocale(event.target.value)} placeholder="pl-PL" required /></label>
      <label className="admin-field">Położenie symbolu<select value={symbolPosition} onChange={(event) => setSymbolPosition(event.target.value)}><option value="locale">Według formatu lokalnego</option><option value="after_no_space">Po kwocie, bez spacji</option></select></label>
      <label className="admin-field">Maksymalna liczba miejsc po przecinku<select value={maxFractionDigits} onChange={(event) => setMaxFractionDigits(Number(event.target.value))}><option value={0}>0</option><option value={1}>1</option><option value={2}>2</option></select></label>
      <button className="button" disabled={busy}>Dodaj walutę</button>
      {message && <p role="status">{message}</p>}
    </form>
    <div className="admin-form admin-editor">
      <h2>Domyślna waluta języka</h2>
      <p className="admin-help">Języki i teksty interfejsu są konfigurowane w plikach JSON projektu.</p>
      {languages.map((language) => <label className="admin-field" key={language.code}>{language.name} ({language.code.toUpperCase()})
        <select disabled={busy} value={defaults[language.code] ?? (currencies.some((currency) => currency.code === language.defaultCurrency) ? language.defaultCurrency : "")} onChange={(event) => void saveDefault(language.code, event.target.value)}>
          <option value="">Wybierz walutę</option>{currencies.map((item) => <option key={item.code} value={item.code}>{item.code} — {item.name}</option>)}
        </select>
      </label>)}
    </div>
  </div>;
}
