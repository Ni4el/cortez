import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getDefaultCurrency, getSelectedCurrency, sortCurrencies } from "../src/lib/locale-values.ts";

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));

test("wybór języka przywraca walutę domyślną, a ręczny wybór pozostaje dostępny", () => {
  const currencies = [{ code: "PLN" }, { code: "EUR" }, { code: "USD" }];
  const english = { code: "en", defaultCurrency: "USD" };
  const defaults = { en: "EUR" };
  assert.equal(getDefaultCurrency(english, currencies, defaults), "EUR");
  assert.equal(getSelectedCurrency("PLN", english, currencies, defaults), "PLN");
  assert.equal(getSelectedCurrency("XXX", english, currencies, defaults), "EUR");
  assert.equal(getDefaultCurrency(english, currencies, {}), "USD");
  assert.equal(getDefaultCurrency(english, currencies, { en: "XXX" }), "PLN");
});

test("kolejność języków, walut i ich ustawienia domyślne", () => {
  const languages = readJson("../src/i18n/languages.json");
  assert.deepEqual(languages.map(({ code, defaultCurrency }) => [code, defaultCurrency]), [
    ["pl", "PLN"], ["en", "GBP"], ["de", "EUR"], ["fr", "USD"],
  ]);
  const currencies = ["USD", "CHF", "EUR", "PLN", "GBP", "CAD"].map((code) => ({ code }));
  assert.deepEqual(sortCurrencies(currencies).map(({ code }) => code), ["PLN", "GBP", "EUR", "USD", "CAD", "CHF"]);
  assert.equal(currencies[0].code, "USD");
  for (const language of languages) assert.equal(getDefaultCurrency(language, currencies, {}), language.defaultCurrency);
});

test("skonfigurowane języki mają komplet tekstów i biografię", () => {
  const languages = readJson("../src/i18n/languages.json");
  const messages = readJson("../src/i18n/messages.json");
  const biographies = readJson("../src/i18n/biography.json");
  for (const language of languages) {
    assert.ok(messages[language.code], language.code);
    assert.ok(biographies[language.code]?.length, language.code);
    for (const key of Object.keys(messages.pl)) assert.ok(messages[language.code][key], `${language.code}: ${key}`);
  }
});
