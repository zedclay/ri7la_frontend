"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getCurrentDemoUser, setDemoSession, updateCurrentDemoUser } from "@/lib/demoSession";
import { useTranslations } from "next-intl";

export default function BecomeDriverPage() {
  const router = useRouter();
  const t = useTranslations("becomeDriver");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl bg-primary-container p-10 text-white shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-widest">
          <MaterialIcon name="verified_user" className="!text-lg" />
          {t("kicker")}
        </div>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight">{t("title")}</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          {t("subtitle")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-white px-7 py-3 text-sm font-extrabold text-primary-container active:scale-95"
            onClick={() => {
              const me = getCurrentDemoUser();
              if (me) {
                updateCurrentDemoUser({ role: "driver", driverOnboardingCompleted: false });
                setDemoSession({ role: "driver", phone: me.phone, identifier: me.phone });
              } else {
                setDemoSession({ role: "driver" });
              }
              router.push("/driver/onboarding");
            }}
          >
            {t("ctaPrimary")}
          </button>
          <Link
            href="/help"
            className="rounded-full bg-white/10 px-7 py-3 text-sm font-extrabold text-white active:scale-95"
          >
            {t("ctaSecondary")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { icon: "badge", title: t("card1Title"), desc: t("card1Body") },
          { icon: "directions_car", title: t("card2Title"), desc: t("card2Body") },
          { icon: "route", title: t("card3Title"), desc: t("card3Body") },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low">
              <MaterialIcon name={c.icon} className="!text-2xl text-primary" />
            </div>
            <div className="text-sm font-extrabold text-on-surface">{c.title}</div>
            <p className="mt-1 text-sm text-on-surface-variant">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
