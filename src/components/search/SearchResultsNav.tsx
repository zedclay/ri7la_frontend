"use client";

import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function SearchResultsNav() {
  const t = useTranslations("common");

  const links = [
    { href: "/search", label: t("navFindRide") },
    { href: "/driver/trips/new", label: t("offerTrip") },
    { href: "/search?mode=bus", label: t("busSchedules") },
    { href: "/search?mode=train", label: t("trainSchedules") },
    { href: "/help", label: t("travelGuide") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-low font-headline tracking-tight shadow-[0_12px_32px_-4px_rgba(0,83,91,0.08)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link
          href="/"
          className="text-2xl font-extrabold tracking-tighter text-primary-container"
        >
          Ri7la
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label={t("searchArea")}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-medium text-on-surface-variant transition-colors hover:text-primary-container"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher variant="header" />
          <Link
            href="/auth/login"
            className="scale-95 rounded-full bg-gradient-primary px-6 py-2 text-sm font-bold text-white shadow-lg transition-transform active:scale-90"
          >
            {t("signIn")}
          </Link>
        </div>
      </div>
    </header>
  );
}
