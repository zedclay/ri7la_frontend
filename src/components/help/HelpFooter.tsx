import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function HelpFooter() {
  const t = await getTranslations("common");
  const links = [
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("termsLong") },
    { href: "/accessibility", label: t("accessibility") },
    { href: "/help", label: t("helpContact") },
    { href: "/careers", label: t("careers") },
  ];
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 font-body text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between space-y-4 px-8 py-12 md:flex-row md:space-y-0">
        <div className="flex flex-col items-center space-y-2 md:items-start">
          <span className="flex items-center gap-2">
            <img src="/saafir-icon.svg" alt="" className="h-8 w-8" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-6 w-auto" />
          </span>
          <p>{t("helpFooterNote", { year: new Date().getFullYear() })}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-primary-container"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
