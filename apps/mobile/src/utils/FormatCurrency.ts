import i18next from "i18next";

const localeMap: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

export function formatCurrency(value: number, decimals = 2): string {
  const locale = localeMap[i18next.language] ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrencyCompact(value: number): string {
  const locale = localeMap[i18next.language] ?? "en-US";
  if (value >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return formatCurrency(value, value < 100 ? 2 : 0);
}
