"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import {
  currentDriverDraftUserId,
  loadDriverOnboardingState,
  type DriverOnboardingState,
  type DriverVehicleDraft,
} from "@/lib/driverOnboardingStorage";
import { getCurrentDemoUser } from "@/lib/demoSession";
import { isDriverIdentityAndLicenseUploaded } from "@/lib/verificationGates";

type RemoteMe = {
  fullName: string;
  email: string | null;
  phoneE164: string | null;
  createdAt?: string;
};

function plateDisplay(v: DriverVehicleDraft): string {
  return [v.plateSequence, v.plateModelCode, v.plateWilayaCode].map((s) => s.trim()).filter(Boolean).join(" ");
}

function hasVehicleCore(v: DriverVehicleDraft): boolean {
  return v.vehicleLine.trim().length >= 2;
}

export function DriverSettingsClient() {
  const t = useTranslations("driverSettings");
  const tOnb = useTranslations("driverOnboarding");
  const demo = getCurrentDemoUser();
  const [remote, setRemote] = useState<RemoteMe | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [onboarding, setOnboarding] = useState<DriverOnboardingState | null>(null);

  const reloadLocal = useCallback(() => {
    const uid = currentDriverDraftUserId();
    if (uid) setOnboarding(loadDriverOnboardingState(uid));
    else setOnboarding(null);
  }, []);

  useEffect(() => {
    reloadLocal();
  }, [reloadLocal]);

  useEffect(() => {
    function onFocus() {
      reloadLocal();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reloadLocal]);

  useEffect(() => {
    if (!getAccessToken()) return;
    let cancelled = false;
    setLoadError(false);
    void apiGetJsonData<RemoteMe>("/api/users/me")
      .then((u) => {
        if (cancelled || !u) return;
        setRemote(u);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = useMemo(() => {
    const fromApi = remote?.fullName?.trim();
    const fromOnb = onboarding?.profileFullName?.trim();
    const fromDemo = demo?.fullName?.trim();
    return fromApi || fromOnb || fromDemo || "";
  }, [remote?.fullName, onboarding?.profileFullName, demo?.fullName]);

  const displayEmail = useMemo(() => {
    return remote?.email?.trim() || onboarding?.profileEmail?.trim() || demo?.email?.trim() || "";
  }, [remote?.email, onboarding?.profileEmail, demo?.email]);

  const displayPhone = useMemo(() => {
    return remote?.phoneE164?.trim() || demo?.phone || "";
  }, [remote?.phoneE164, demo?.phone]);

  const vehicle = onboarding?.vehicle;
  const plate = vehicle ? plateDisplay(vehicle) : "";

  const colorLabel = useMemo(() => {
    if (!vehicle) return "";
    if (vehicle.colorPreset === "other") return vehicle.colorCustom.trim() || tOnb("colorOther");
    const map: Record<string, "colorWhite" | "colorBlack" | "colorRed" | "colorBlue" | "colorGrey"> = {
      white: "colorWhite",
      black: "colorBlack",
      red: "colorRed",
      blue: "colorBlue",
      grey: "colorGrey",
    };
    const key = map[vehicle.colorPreset];
    return key ? tOnb(key) : vehicle.colorCustom.trim() || "—";
  }, [vehicle, tOnb]);

  const avatar = useMemo(() => {
    if (displayName.trim()) {
      const parts = displayName.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0]!.slice(0, 1) + parts[1]!.slice(0, 1)).toUpperCase();
      return displayName.slice(0, 2).toUpperCase();
    }
    const p = displayPhone.replace(/\D/g, "");
    if (p.length >= 2) return p.slice(-2);
    return "DR";
  }, [displayName, displayPhone]);

  const verifIdentity = (onboarding?.identityDocumentFileNames?.length ?? 0) > 0 ? "ok" : "pending";
  const verifLicense = (onboarding?.licenseDocumentFileNames?.length ?? 0) > 0 ? "ok" : "pending";
  const verifDocs =
    (onboarding?.documentFileNames?.length ?? 0) > 0 || (onboarding?.documentsNote?.trim() ?? "").length > 0
      ? "ok"
      : "pending";

  const driverAccountActivated = isDriverIdentityAndLicenseUploaded();
  const vehicleOk = vehicle && hasVehicleCore(vehicle) && plate.length > 0;

  const demoVehicleLine = useMemo(
    () => [demo?.carMake, demo?.carModel].filter(Boolean).join(" ").trim(),
    [demo?.carMake, demo?.carModel],
  );
  const demoPlate = demo?.plateNumber?.trim() ?? "";
  const hasDemoVehicle = Boolean((demoVehicleLine.length > 0 || demoPlate.length > 0) && demo);

  function pill(status: "ok" | "pending") {
    if (status === "ok") {
      return (
        <span className="rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-extrabold text-on-primary-fixed-variant">
          {t("verifiedPill")}
        </span>
      );
    }
    return (
      <span className="rounded-full bg-surface-container-high px-3 py-1 text-[10px] font-extrabold text-on-surface-variant">
        {t("pendingPill")}
      </span>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("title")}</h1>
        <p className="mt-1 text-on-surface-variant">{t("subtitle")}</p>
      </div>

      {loadError && !demo ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-on-surface">{t("loadErrorHint")}</div>
      ) : null}

      {remote && !loadError ? (
        <div className="rounded-2xl border border-primary/20 bg-primary-container/10 px-4 py-3 text-sm font-medium text-on-surface">
          <div className="flex items-start gap-2">
            <MaterialIcon name="cloud_done" className="!text-xl shrink-0 text-primary" />
            <span>{t("syncedFromAccount")}</span>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">{t("personalSection")}</div>
            <Link href="/driver/onboarding" className="text-xs font-bold text-primary underline underline-offset-4">
              {t("editCta")}
            </Link>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-6 md:flex-row md:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xl font-extrabold text-on-primary-fixed-variant">
              {avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-extrabold text-on-surface">{displayName || t("unnamed")}</div>
              <div className="mt-1 text-sm text-on-surface-variant">{displayEmail || t("notProvided")}</div>
              <div className="mt-1 text-sm text-on-surface-variant">{displayPhone || t("notProvided")}</div>
            </div>
            <div
              className={`rounded-full px-4 py-2 text-[10px] font-extrabold ${
                driverAccountActivated ? "bg-primary-fixed/40 text-on-primary-fixed-variant" : "bg-amber-500/20 text-amber-900 dark:text-amber-100"
              }`}
            >
              {driverAccountActivated ? t("accountVerified") : t("accountPending")}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-sm font-extrabold text-on-surface">{t("verificationSection")}</div>
            <p className="mb-3 text-xs text-on-surface-variant">{t("verificationHint")}</p>
            <div className="space-y-3">
              {(
                [
                  { icon: "badge" as const, label: t("identityLabel"), sub: t("identitySub"), status: verifIdentity },
                  { icon: "credit_card" as const, label: t("licenseLabel"), sub: t("licenseSub"), status: verifLicense },
                  { icon: "shield" as const, label: t("docsLabel"), sub: t("docsSub"), status: verifDocs },
                ] as const
              ).map((d) => (
                <div key={d.label} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/70">
                      <MaterialIcon name={d.icon} className="!text-2xl text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-on-surface">{d.label}</div>
                      <div className="text-xs text-on-surface-variant">{d.sub}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pill(d.status)}
                    <Link
                      href="/driver/onboarding"
                      className="rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95"
                    >
                      {t("updateCta")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-extrabold text-on-surface">{t("vehicleSection")}</div>
              <Link href="/driver/onboarding" className="text-xs font-bold text-primary underline underline-offset-4">
                {t("editCta")}
              </Link>
            </div>
            {vehicleOk ? (
              <>
                <div className="h-28 rounded-2xl bg-surface-container-low" aria-hidden />
                <div className="mt-4 text-sm font-extrabold text-on-surface">{vehicle!.vehicleLine.trim()}</div>
                <div className="text-xs text-on-surface-variant">
                  {colorLabel} · {vehicle!.year}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface-container-low px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("plateLabel")}</div>
                    <div className="mt-1 text-sm font-extrabold text-on-surface">{plate || t("notProvided")}</div>
                  </div>
                  <div className="rounded-xl bg-surface-container-low px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("seatsLabel")}</div>
                    <div className="mt-1 text-sm font-extrabold text-on-surface">
                      {vehicle!.passengerSeats} {t("seatsUnit")}
                    </div>
                  </div>
                </div>
              </>
            ) : hasDemoVehicle ? (
              <>
                <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
                  {t("demoVehicleNote")}
                </div>
                <div className="mt-4 text-sm font-extrabold text-on-surface">{demoVehicleLine || t("demoVehicleFallback")}</div>
                {demoPlate ? (
                  <div className="mt-2 text-xs text-on-surface-variant">
                    {t("plateLabel")}: {demoPlate}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-2xl bg-surface-container-low px-4 py-6 text-center text-sm text-on-surface-variant">
                <p>{t("vehicleEmpty")}</p>
                <Link href="/driver/onboarding" className="mt-3 inline-block text-sm font-extrabold text-primary underline underline-offset-4">
                  {t("onboardingCta")}
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="text-sm font-extrabold">{t("supportTitle")}</div>
            <div className="mt-1 text-xs text-white/80">{t("supportBody")}</div>
            <Link
              href="/driver/onboarding"
              className="mt-4 inline-flex rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95"
            >
              {t("supportCta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
