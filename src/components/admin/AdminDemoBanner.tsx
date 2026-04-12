"use client";

import { useTranslations } from "next-intl";

/**
 * Shown on /admin routes: operations UI is preview-only until wired to secure admin APIs.
 */
export function AdminDemoBanner() {
  const t = useTranslations("admin");

  return (
    <div
      role="status"
      className="border-b border-amber-700/30 bg-amber-500/15 px-6 py-3 text-center text-sm font-semibold text-amber-950 dark:text-amber-100"
    >
      {t("demoBanner")}
    </div>
  );
}
