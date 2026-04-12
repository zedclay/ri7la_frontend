"use client";

import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { filesToDataUrls } from "@/lib/fileDataUrls";
import { fetchUserMeClientCached, invalidateUserMeClientCache } from "@/lib/userMeClientCache";
import { getCurrentDemoUser, updateCurrentDemoUser } from "@/lib/demoSession";
import {
  currentUserIdForStorage,
  loadPassengerIdentity,
  savePassengerIdentity,
} from "@/lib/passengerIdentityStorage";

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
  const [identityFileNames, setIdentityFileNames] = useState<string[]>([]);
  const [identityVerified, setIdentityVerified] = useState<boolean | null>(null);
  const [identityStatus, setIdentityStatus] = useState<string | null>(null);

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
    void fetchUserMeClientCached().then((me) => {
      if (cancelled || !me?.passengerVerification) return;
      setIdentityVerified(me.passengerVerification.identityVerified);
      setIdentityStatus(me.passengerVerification.identity);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const uid = currentUserIdForStorage();
    if (uid) setIdentityFileNames(loadPassengerIdentity(uid).identityDocumentFileNames);
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

      {identityVerified === true ? (
        <div className="rounded-2xl border border-primary/25 bg-primary-container/15 p-5 text-on-surface">
          <div className="flex items-center gap-2 font-extrabold text-primary">
            <MaterialIcon name="verified" className="!text-2xl" />
            {t("passengerVerificationApproved")}
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">{t("passengerVerificationApprovedBody")}</p>
        </div>
      ) : identityStatus === "pending" || identityStatus === "rejected" || identityVerified === false ? (
        <div
          className={`rounded-2xl p-5 ${
            identityStatus === "rejected" ? "border border-error/30 bg-error-container/15" : "border border-amber-500/35 bg-amber-500/10"
          }`}
        >
          <div className="flex items-center gap-2 font-extrabold text-on-surface">
            <MaterialIcon name={identityStatus === "rejected" ? "cancel" : "schedule"} className="!text-2xl text-primary" />
            {identityStatus === "rejected" ? t("passengerVerificationRejected") : t("passengerVerificationPending")}
          </div>
          <p className="mt-1 text-sm text-on-surface-variant">
            {identityStatus === "rejected" ? t("passengerVerificationRejectedBody") : t("passengerVerificationPendingBody")}
          </p>
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

      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 text-sm font-extrabold text-on-surface">{t("passengerIdentitySection")}</div>
        <p className="mb-4 text-sm text-on-surface-variant">{t("passengerIdentitySectionBody")}</p>
        <div className="rounded-xl border border-dashed border-primary/30 bg-surface-container-low/50 p-5">
          <label className="flex cursor-pointer flex-col gap-2">
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              multiple
              className="sr-only"
              onChange={async (e) => {
                const list = e.target.files;
                const uid = currentUserIdForStorage();
                if (!uid) return;
                if (!list?.length) {
                  setIdentityFileNames([]);
                  savePassengerIdentity(uid, { identityDocumentFileNames: [] });
                  return;
                }
                const names = Array.from(list).map((f) => f.name);
                setIdentityFileNames(names);
                savePassengerIdentity(uid, { identityDocumentFileNames: names });
                if (getAccessToken()) {
                  try {
                    const urls = await filesToDataUrls(list);
                    await apiPostJsonData("/api/passengers/me/verification/documents", { identity: urls });
                    invalidateUserMeClientCache();
                    const me = await fetchUserMeClientCached();
                    if (me?.passengerVerification) {
                      setIdentityVerified(me.passengerVerification.identityVerified);
                      setIdentityStatus(me.passengerVerification.identity);
                    }
                  } catch {
                    /* ignore */
                  }
                }
              }}
            />
            <span className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary">
              {t("passengerIdentityUpload")}
            </span>
          </label>
          {identityFileNames.length > 0 ? (
            <ul className="mt-3 space-y-1 text-xs text-on-surface-variant">
              {identityFileNames.map((n) => (
                <li key={n} className="truncate font-medium">
                  {n}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-on-surface-variant">{t("passengerIdentityEmpty")}</p>
          )}
        </div>
      </div>

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
