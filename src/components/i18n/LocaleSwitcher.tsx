"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Props = {
  variant?: "header" | "footer";
  className?: string;
};

export function LocaleSwitcher({ variant = "header", className = "" }: Props) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  const base =
    variant === "header"
      ? "flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-high"
      : "flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-surface-container-high p-2";

  return (
    <div className={className} role="group" aria-label={t("label")}>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={pathname}
          locale="fr"
          className={`${base} ${locale === "fr" ? "ring-2 ring-primary-container/40" : ""}`}
          aria-current={locale === "fr" ? "true" : undefined}
        >
          <MaterialIcon name="language" className="!text-sm" />
          <span className="text-xs font-bold">{t("fr")}</span>
        </Link>
        <Link
          href={pathname}
          locale="ar"
          className={`${base} ${locale === "ar" ? "ring-2 ring-primary-container/40" : ""}`}
          aria-current={locale === "ar" ? "true" : undefined}
        >
          <MaterialIcon name="translate" className="!text-sm" />
          <span className="text-xs font-bold">{t("ar")}</span>
        </Link>
      </div>
    </div>
  );
}
