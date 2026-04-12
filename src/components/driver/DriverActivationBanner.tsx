"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { syncDriverVerificationFromApi } from "@/lib/driverDocumentReviewStorage";
import { getDriverDocsCtaHref } from "@/lib/driverDocsNavigation";
import { currentDriverDraftUserId } from "@/lib/driverOnboardingStorage";
import { isDriverIdentityAndLicenseUploaded } from "@/lib/verificationGates";

export function DriverActivationBanner() {
  const t = useTranslations("driverProfile");
  const pathname = usePathname();
  const [ok, setOk] = useState(true);
  const [docsHref, setDocsHref] = useState<string>("/driver/onboarding");

  useEffect(() => {
    async function refresh() {
      const uid = currentDriverDraftUserId();
      if (uid) await syncDriverVerificationFromApi(uid);
      setOk(isDriverIdentityAndLicenseUploaded());
      setDocsHref(getDriverDocsCtaHref());
    }
    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("ri7la_auth", refresh);
    window.addEventListener("ri7la_driver_review", refresh);
    window.addEventListener("ri7la_driver_onboarding", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ri7la_auth", refresh);
      window.removeEventListener("ri7la_driver_review", refresh);
      window.removeEventListener("ri7la_driver_onboarding", refresh);
    };
  }, []);

  if (pathname?.includes("/driver/onboarding")) return null;
  if (ok) return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-on-surface">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-2">
          <MaterialIcon name="gpp_maybe" className="!text-xl shrink-0 text-amber-800 dark:text-amber-200" />
          <div>
            <div className="font-extrabold">{t("accountNotActivatedTitle")}</div>
            <p className="mt-1 text-on-surface-variant">{t("accountNotActivatedShort")}</p>
          </div>
        </div>
        <Link
          href={docsHref}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary"
        >
          {docsHref === "/driver/vehicle" ? t("accountNotActivatedCtaVehicle") : t("accountNotActivatedCta")}
        </Link>
      </div>
    </div>
  );
}
