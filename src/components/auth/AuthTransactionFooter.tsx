import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Variant = "signup" | "login";

export function AuthTransactionFooter({ variant }: { variant: Variant }) {
  const t = useTranslations("common");
  const year = new Date().getFullYear();
  const footerNote = t("verifyFooterNote", { year, rights: t("rights") });
  if (variant === "signup") {
    return (
      <footer className="w-full border-t border-slate-100 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/saafir-icon.svg" alt="" className="h-8 w-8" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-6 w-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-slate-400 transition-colors hover:text-primary-container"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-400 transition-colors hover:text-primary-container"
            >
              {t("termsLong")}
            </Link>
            <Link
              href="/help"
              className="text-xs text-slate-400 transition-colors hover:text-primary-container"
            >
              {t("helpContact")}
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            {footerNote}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-4 bg-surface-container-low px-8 py-6 md:flex-row">
      <p className="text-xs text-on-surface-variant">
        {footerNote}
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <Link
          href="/privacy"
          className="text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          {t("privacy")}
        </Link>
        <Link
          href="/terms"
          className="text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          {t("termsLong")}
        </Link>
        <Link
          href="/help"
          className="text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          {t("helpContact")}
        </Link>
      </div>
    </footer>
  );
}
