import assert from "node:assert/strict";
import { test } from "node:test";
import { formatPrice } from "../src/lib/catalog.ts";

const formats = {
  PLN: { format_locale: "pl-PL", symbol_position: "locale", max_fraction_digits: 0 },
  EUR: { format_locale: "pl-PL", symbol_position: "locale", max_fraction_digits: 2 },
  GBP: { format_locale: "en-GB", symbol_position: "locale", max_fraction_digits: 2 },
  USD: { format_locale: "pl-PL", symbol_position: "after_no_space", max_fraction_digits: 2 },
};

test("ceny mają format przypisany do waluty", () => {
  assert.equal(formatPrice(5370, "PLN", formats.PLN), "5\u00a0370\u00a0zł");
  assert.equal(formatPrice(5370, "EUR", formats.EUR), "5\u00a0370\u00a0€");
  assert.equal(formatPrice(5370, "GBP", formats.GBP), "£5,370");
  assert.equal(formatPrice(5370, "USD", formats.USD), "5\u00a0370$");
});

test("PLN nie wyświetla groszy, a inne waluty zachowują niecałe kwoty", () => {
  assert.equal(formatPrice(123.45, "PLN", formats.PLN), "123\u00a0zł");
  assert.equal(formatPrice(1250.5, "GBP", formats.GBP), "£1,250.50");
  assert.equal(formatPrice(1250.5, "USD", formats.USD), "1\u00a0250,50$");
  assert.equal(formatPrice(1250.5, "EUR", formats.EUR), "1\u00a0250,50\u00a0€");
});
