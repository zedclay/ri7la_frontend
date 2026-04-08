"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/** Syncs <html lang dir> with the active locale (root layout cannot read [locale] on the server). */
export function LocaleHtmlAttributes() {
  const locale = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
