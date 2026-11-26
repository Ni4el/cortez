const currencyOrder = ["PLN", "GBP", "EUR", "USD"];

export function sortCurrencies<T extends { code: string }>(currencies: T[]): T[] {
  return [...currencies].sort((a, b) => {
    const aIndex = currencyOrder.indexOf(a.code);
    const bIndex = currencyOrder.indexOf(b.code);
    return (aIndex < 0 ? currencyOrder.length : aIndex) - (bIndex < 0 ? currencyOrder.length : bIndex)
      || a.code.localeCompare(b.code);
  });
}

export function getDefaultCurrency(language: { code: string; defaultCurrency: string }, currencies: { code: string }[], defaults: Record<string, string>): string | undefined {
  const preferred = defaults[language.code] ?? language.defaultCurrency;
  return currencies.find((item) => item.code === preferred)?.code ?? currencies[0]?.code;
}

export function getSelectedCurrency(requested: string | undefined, language: { code: string; defaultCurrency: string }, currencies: { code: string }[], defaults: Record<string, string>): string | undefined {
  return currencies.find((item) => item.code === requested)?.code ?? getDefaultCurrency(language, currencies, defaults);
}
