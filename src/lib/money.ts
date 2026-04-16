export function formatDzd(amount: number, locale: string) {
  const resolvedLocale = locale === "ar" ? "ar-DZ" : "fr-DZ";
  return new Intl.NumberFormat(resolvedLocale, { maximumFractionDigits: 0 }).format(amount);
}
