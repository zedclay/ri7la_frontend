import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function PublicFooter() {
  const t = await getTranslations("common");
  const tLoc = await getTranslations("LocaleSwitcher");

  return (
    <footer className="w-full border-t border-slate-200 bg-[#f8fafb] px-6 py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-slate-900">
            <img src="/saafir-icon.svg" alt="" className="h-9 w-9" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-7 w-auto" />
          </div>
          <p className="max-w-xs leading-relaxed text-slate-500">{t("footerBlurb")}</p>
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary-container transition-all hover:bg-primary-container hover:text-white"
              aria-label="Facebook"
            >
              <MaterialIcon name="public" className="!text-xl" />
            </a>
            <a
              href="https://instagram.com"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary-container transition-all hover:bg-primary-container hover:text-white"
              aria-label="Instagram"
            >
              <MaterialIcon name="photo_camera" className="!text-xl" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h6 className="font-bold text-on-surface">{t("footerCompany")}</h6>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>
              <Link href="/#comment-ca-marche" className="transition-colors hover:text-primary">
                {t("howItWorksAnchor")}
              </Link>
            </li>
            <li>
              <Link href="/safety" className="transition-colors hover:text-primary">
                {t("navSafety")}
              </Link>
            </li>
            <li>
              <Link href="/avis" className="transition-colors hover:text-primary">
                {t("customerReviews")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h6 className="font-bold text-on-surface">{t("support")}</h6>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>
              <Link href="/help" className="transition-colors hover:text-primary">
                {t("helpContact")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-primary">
                {t("termsLong")}
              </Link>
            </li>
            <li>
              <Link href="/refunds" className="transition-colors hover:text-primary">
                {t("refundPolicy")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h6 className="font-bold text-on-surface">{tLoc("label")}</h6>
          <LocaleSwitcher variant="footer" />
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} {t("footerLegal")}. {t("rights")}
        </p>
        <div className="flex gap-6 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-on-surface">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="hover:text-on-surface">
            {t("terms")}
          </Link>
          <Link href="/cookies" className="hover:text-on-surface">
            {t("cookies")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
