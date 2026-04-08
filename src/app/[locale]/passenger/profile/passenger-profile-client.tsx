"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { getCurrentDemoUser, updateCurrentDemoUser } from "@/lib/demoSession";

type RemoteMe = {
  fullName: string;
  email: string | null;
  phoneE164: string | null;
};

export function PassengerProfileClient() {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/passenger/bookings";

  const me = getCurrentDemoUser();
  const [remote, setRemote] = useState<RemoteMe | null>(null);
  const [fullName, setFullName] = useState(() => me?.fullName ?? "");
  const [email, setEmail] = useState(() => me?.email ?? "");

  useEffect(() => {
    if (!getAccessToken()) return;
    let cancelled = false;
    void apiGetJsonData<RemoteMe>("/api/users/me")
      .then((u) => {
        if (cancelled || !u) return;
        setRemote(u);
        setFullName((prev) => (prev.trim() ? prev : u.fullName));
        setEmail((prev) => (prev.trim() ? prev : u.email ?? ""));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const displayPhone = remote?.phoneE164 ?? me?.phone ?? "";
  const profileCompleteFromApi =
    !!remote?.fullName?.trim() && !!remote?.email?.trim() && !!remote?.phoneE164;
  const showCompleteBanner = !profileCompleteFromApi && !me?.profileCompleted;

  const avatar = useMemo(() => {
    const phone = displayPhone;
    if (phone) return phone.replace(/\D/g, "").slice(-2).toUpperCase() || "P";
    return "P";
  }, [displayPhone]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("passengerProfileTitle")}</h1>
        <p className="mt-1 text-on-surface-variant">{t("passengerProfileSubtitle")}</p>
      </div>

      {profileCompleteFromApi ? (
        <div className="rounded-2xl border border-primary/20 bg-primary-container/10 p-6 text-on-surface">
          <div className="flex items-start gap-3">
            <MaterialIcon name="check_circle" className="!text-2xl text-primary" />
            <p className="text-sm font-medium">{t("passengerProfileSynced")}</p>
          </div>
        </div>
      ) : null}

      {showCompleteBanner ? (
        <div className="rounded-2xl bg-secondary-container/40 p-6 text-on-secondary-fixed-variant">
          <div className="flex items-start gap-3">
            <MaterialIcon name="info" className="!text-2xl text-primary" />
            <div>
              <div className="text-sm font-extrabold">{t("passengerProfileBannerTitle")}</div>
              <div className="mt-1 text-sm">{t("passengerProfileBannerBody")}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-fixed text-2xl font-extrabold text-on-primary-fixed-variant">
            {avatar}
          </div>
          <div className="mt-4 text-center">
            <div className="text-xl font-extrabold text-on-surface">
              {fullName.trim() || remote?.fullName || me?.fullName || "—"}
            </div>
            <div className="text-sm text-on-surface-variant">{displayPhone}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-extrabold text-on-surface">{t("passengerProfileSection")}</div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!fullName.trim()) return;
              if (!remote) {
                updateCurrentDemoUser({
                  fullName: fullName.trim() || undefined,
                  email: email.trim() || undefined,
                  verified: true,
                  profileCompleted: true,
                });
              }
              router.push(next);
            }}
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">{t("signupFullName")}</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={t("signupFullNamePlaceholder")}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">{t("signupEmailLabel")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={t("signupEmailPlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={!fullName.trim()}
              className="w-full rounded-full bg-primary py-4 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 disabled:opacity-60 active:scale-95"
            >
              {profileCompleteFromApi ? t("passengerProfileContinue") : t("passengerProfileSave")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
