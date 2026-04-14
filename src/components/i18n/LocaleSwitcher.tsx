"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { useEffect, useRef, useState } from "react";

type Props = {
  variant?: "header" | "footer";
  className?: string;
};

export function LocaleSwitcher({ variant = "header", className = "" }: Props) {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const el = wrapperRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (variant === "footer") {
    const base = "flex w-fit cursor-pointer items-center gap-2 rounded-lg bg-surface-container-high p-2";
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

  const currentLabel = locale === "ar" ? "AR" : "FR";
  const currentFlag = locale === "ar" ? "🇩🇿" : "🇫🇷";

  return (
    <div className={`relative inline-flex ${className}`.trim()} ref={wrapperRef}>
      <button
        type="button"
        className="flex h-10 min-w-[92px] items-center justify-between gap-2 rounded-full bg-surface-container-low/70 px-3 text-sm font-extrabold text-on-surface transition-colors hover:bg-surface-container-high"
        aria-label={t("label")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <span className="text-base leading-none">{currentFlag}</span>
          <span className="leading-none">{currentLabel}</span>
        </span>
        <MaterialIcon
          name="expand_more"
          className={`!text-lg text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className="absolute end-0 top-full z-[70] mt-2 w-[160px] overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.25)]"
        >
          <Link
            href={pathname}
            locale="fr"
            role="menuitem"
            className={`flex items-center justify-between px-4 py-3 text-sm font-extrabold transition-colors hover:bg-surface-container-low ${
              locale === "fr" ? "bg-surface-container-low text-primary-container" : "text-on-surface"
            }`}
            onClick={() => setOpen(false)}
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">🇫🇷</span>
              <span>FR</span>
            </span>
            {locale === "fr" && <MaterialIcon name="check" className="!text-lg text-primary-container" />}
          </Link>
          <Link
            href={pathname}
            locale="ar"
            role="menuitem"
            className={`flex items-center justify-between px-4 py-3 text-sm font-extrabold transition-colors hover:bg-surface-container-low ${
              locale === "ar" ? "bg-surface-container-low text-primary-container" : "text-on-surface"
            }`}
            onClick={() => setOpen(false)}
          >
            <span className="flex items-center gap-2">
              <span className="text-base leading-none">🇩🇿</span>
              <span>AR</span>
            </span>
            {locale === "ar" && <MaterialIcon name="check" className="!text-lg text-primary-container" />}
          </Link>
        </div>
      )}
    </div>
  );
}
