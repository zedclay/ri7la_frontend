"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { fetchUserMeClientCached, type UserMeClientPayload } from "@/lib/userMeClientCache";
import {
  currentDriverDraftUserId,
  loadDriverOnboardingState,
  type DriverOnboardingState,
  type DriverVehicleDraft,
} from "@/lib/driverOnboardingStorage";
import { syncDriverVerificationFromApi } from "@/lib/driverDocumentReviewStorage";
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

export function DriverProfileClient() {
  const t = useTranslations("driverProfile");
  const tOnb = useTranslations("driverOnboarding");
  const demo = getCurrentDemoUser();
  const [remote, setRemote] = useState<RemoteMe | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [onboarding, setOnboarding] = useState<DriverOnboardingState | null>(null);
  const [mePayload, setMePayload] = useState<UserMeClientPayload | null>(null);

  const reloadLocal = useCallback(() => {
    const uid = currentDriverDraftUserId();
    if (uid) {
      void syncDriverVerificationFromApi(uid).finally(() => {
        setOnboarding(loadDriverOnboardingState(uid));
      });
    } else setOnboarding(null);
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
    void fetchUserMeClientCached().then((m) => {
      if (!cancelled && m) setMePayload(m);
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

  const firstName = displayName.split(/\s+/)[0] || "";

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
    [demo?.carMake, demo?.carModel]
  );
  const demoPlate = demo?.plateNumber?.trim() ?? "";
  const hasDemoVehicle = Boolean((demoVehicleLine.length > 0 || demoPlate.length > 0) && demo);

  const memberSince = useMemo(() => {
    const raw = remote?.createdAt;
    if (!raw) return null;
    try {
      return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(new Date(raw));
    } catch {
      return null;
    }
  }, [remote?.createdAt]);

  function statusPill(status: "ok" | "pending") {
    if (status === "ok") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/25 px-2.5 py-0.5 text-xs font-bold text-primary">
          <MaterialIcon name="check_circle" className="!text-sm" filled />
          {t("statusOk")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-0.5 text-xs font-bold text-on-surface-variant">
        <MaterialIcon name="schedule" className="!text-sm" />
        {t("statusPending")}
      </span>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("kicker")}</p>
          <h1 className="mt-1 font-headline text-3xl font-extrabold text-on-surface">
            {firstName ? t("greeting", { name: firstName }) : t("title")}
          </h1>
          <p className="mt-1 max-w-xl text-on-surface-variant">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/driver/trips/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
          >
            <MaterialIcon name="add_road" className="!text-xl" />
            {t("actionNewTrip")}
          </Link>
          <Link
            href="/driver/onboarding"
            className="inline-flex items-center gap-2 rounded-full border-2 border-outline-variant/30 bg-surface-container-low px-5 py-2.5 text-sm font-extrabold text-on-surface active:scale-95"
          >
            <MaterialIcon name="edit_note" className="!text-xl" />
            {t("actionEditDossier")}
          </Link>
        </div>
      </div>

      {mePayload?.driverVerification?.fullyVerified ? (
        <div className="rounded-2xl border border-primary/25 bg-primary-container/15 px-4 py-3 text-sm text-on-surface">
          <div className="flex items-center gap-2 font-extrabold text-primary">
            <MaterialIcon name="verified" className="!text-xl" filled />
            {t("verificationServerApproved")}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">{t("verificationServerApprovedBody")}</p>
        </div>
      ) : mePayload?.driverVerification && !mePayload.driverVerification.fullyVerified ? (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-on-surface">
          <div className="font-extrabold">{t("verificationServerPending")}</div>
          <p className="mt-1 text-xs text-on-surface-variant">{t("verificationServerPendingBody")}</p>
        </div>
      ) : null}

      {driverAccountActivated ? (
        <div className="rounded-2xl border border-primary/25 bg-primary-container/15 px-4 py-3 text-sm font-semibold text-on-surface">
          <div className="flex items-start gap-2">
            <MaterialIcon name="verified" className="!text-xl shrink-0 text-primary" filled />
            <span>{t("accountActivatedBanner")}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-4 text-sm text-on-surface">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2">
              <MaterialIcon name="gpp_maybe" className="!text-xl shrink-0 text-amber-800 dark:text-amber-200" />
              <div>
                <div className="font-extrabold">{t("accountNotActivatedTitle")}</div>
                <p className="mt-1 text-on-surface-variant">{t("accountNotActivatedBody")}</p>
              </div>
            </div>
            <Link
              href="/driver/onboarding"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary"
            >
              {t("accountNotActivatedCta")}
            </Link>
          </div>
        </div>
      )}

      {remote && !loadError ? (
        <div className="rounded-2xl border border-primary/20 bg-primary-container/10 px-4 py-3 text-sm font-medium text-on-surface">
          <div className="flex items-start gap-2">
            <MaterialIcon name="cloud_done" className="!text-xl shrink-0 text-primary" />
            <span>{t("syncedFromAccount")}</span>
          </div>
        </div>
      ) : null}

      {loadError && !demo ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-on-surface">
          {t("loadErrorHint")}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-container/50">
              <MaterialIcon name="mark_chat_unread" className="!text-2xl text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("statRequests")}</div>
              <div className="text-2xl font-extrabold tabular-nums text-on-surface">—</div>
            </div>
          </div>
          <Link href="/driver/requests" className="mt-3 inline-flex text-xs font-bold text-primary underline underline-offset-4">
            {t("statSeeAll")}
          </Link>
        </div>
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tertiary-fixed/40">
              <MaterialIcon name="directions_car" className="!text-2xl text-tertiary" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("statTrips")}</div>
              <div className="text-2xl font-extrabold tabular-nums text-on-surface">—</div>
            </div>
          </div>
          <Link href="/driver/trips" className="mt-3 inline-flex text-xs font-bold text-primary underline underline-offset-4">
            {t("statSeeAll")}
          </Link>
        </div>
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container/30">
              <MaterialIcon name="payments" className="!text-2xl text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{t("statEarnings")}</div>
              <div className="text-2xl font-extrabold tabular-nums text-on-surface">—</div>
            </div>
          </div>
          <Link href="/driver/earnings" className="mt-3 inline-flex text-xs font-bold text-primary underline underline-offset-4">
            {t("statSeeAll")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-3xl font-extrabold text-white shadow-lg">
              {avatar}
            </div>
            <div className="mt-4 text-center">
              <div className="text-xl font-extrabold text-on-surface">{displayName || t("unnamed")}</div>
              <div className="mt-1 inline-flex rounded-full bg-primary-container/20 px-3 py-1 text-xs font-extrabold text-primary">
                {t("roleDriver")}
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t border-outline-variant/15 pt-6 text-sm">
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("fieldPhone")}</dt>
                <dd className="mt-0.5 font-semibold text-on-surface">{displayPhone || t("notProvided")}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("fieldEmail")}</dt>
                <dd className="mt-0.5 break-all font-semibold text-on-surface">{displayEmail || t("notProvided")}</dd>
              </div>
              {memberSince ? (
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("fieldMemberSince")}</dt>
                  <dd className="mt-0.5 font-semibold capitalize text-on-surface">{memberSince}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant">{t("prefsTitle")}</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant">{t("prefEmail")}</span>
                <span className="font-bold text-on-surface">
                  {!onboarding ? t("notProvided") : onboarding.prefEmail !== false ? t("prefYes") : t("prefNo")}
                </span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-on-surface-variant">{t("prefSms")}</span>
                <span className="font-bold text-on-surface">
                  {!onboarding ? t("notProvided") : onboarding.prefSms !== false ? t("prefYes") : t("prefNo")}
                </span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          {!vehicleOk && !hasDemoVehicle ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <MaterialIcon name="warning" className="!text-3xl text-amber-700 dark:text-amber-300" />
                  <div>
                    <div className="font-headline text-lg font-extrabold text-on-surface">{t("vehicleIncompleteTitle")}</div>
                    <p className="mt-1 text-sm text-on-surface-variant">{t("vehicleIncompleteBody")}</p>
                  </div>
                </div>
                <Link
                  href="/driver/onboarding"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-md"
                >
                  {t("vehicleIncompleteCta")}
                </Link>
              </div>
            </div>
          ) : null}

          {!vehicleOk && hasDemoVehicle ? (
            <div className="rounded-2xl border border-secondary-container/40 bg-secondary-container/15 p-4 text-sm">
              <div className="flex items-start gap-2">
                <MaterialIcon name="info" className="!text-xl text-primary" />
                <div>
                  <div className="font-extrabold text-on-surface">{t("demoVehicleBanner")}</div>
                  <p className="mt-1 text-on-surface-variant">{t("demoVehicleBody")}</p>
                </div>
              </div>
            </div>
          ) : null}

          <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-headline text-lg font-extrabold text-on-surface">{t("vehicleSection")}</h2>
              {statusPill(vehicleOk || hasDemoVehicle ? "ok" : "pending")}
            </div>
            {vehicle && vehicleOk ? (
              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface-container-low p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("vehicleLineLabel")}</dt>
                  <dd className="mt-1 text-base font-extrabold text-on-surface">{vehicle.vehicleLine}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("yearLabel")}</dt>
                  <dd className="mt-1 text-base font-extrabold tabular-nums text-on-surface">{vehicle.year}</dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("seatsLabel")}</dt>
                  <dd className="mt-1 text-base font-extrabold text-on-surface">
                    {vehicle.passengerSeats} {t("seatsUnit")}
                  </dd>
                </div>
                <div className="rounded-xl bg-surface-container-low p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("colorLabel")}</dt>
                  <dd className="mt-1 text-base font-extrabold text-on-surface">{colorLabel}</dd>
                </div>
                <div className="sm:col-span-2">
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("plateLabel")}</dt>
                    <dd className="mt-1 font-mono text-lg font-extrabold tracking-wide text-on-surface">{plate || "—"}</dd>
                  </div>
                </div>
              </dl>
            ) : hasDemoVehicle ? (
              <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {demoVehicleLine ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("vehicleLineLabel")}</dt>
                    <dd className="mt-1 text-base font-extrabold text-on-surface">{demoVehicleLine}</dd>
                  </div>
                ) : null}
                {demo?.carColor ? (
                  <div className="rounded-xl bg-surface-container-low p-4">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("colorLabel")}</dt>
                    <dd className="mt-1 text-base font-extrabold text-on-surface">{demo.carColor}</dd>
                  </div>
                ) : null}
                {demoPlate ? (
                  <div className="sm:col-span-2">
                    <div className="rounded-xl bg-surface-container-low p-4">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{tOnb("plateLabel")}</dt>
                      <dd className="mt-1 font-mono text-lg font-extrabold tracking-wide text-on-surface">{demoPlate}</dd>
                    </div>
                  </div>
                ) : null}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-on-surface-variant">{t("vehicleEmpty")}</p>
            )}

            {(onboarding?.vehiclePhotoFileNames?.length ?? 0) > 0 ? (
              <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container-low/50 p-4">
                <div className="text-xs font-extrabold text-on-surface">{t("photosAttached")}</div>
                <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto text-xs text-on-surface-variant">
                  {onboarding!.vehiclePhotoFileNames.map((n) => (
                    <li key={n} className="truncate">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
            <h2 className="font-headline text-lg font-extrabold text-on-surface">{t("verificationSection")}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{t("verificationHint")}</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-on-surface">{t("verifIdentity")}</span>
                  {statusPill(verifIdentity === "ok" ? "ok" : "pending")}
                </div>
                <p className="text-[11px] leading-snug text-on-surface-variant">{t("verifIdentityHint")}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-on-surface">{t("verifLicense")}</span>
                  {statusPill(verifLicense === "ok" ? "ok" : "pending")}
                </div>
                <p className="text-[11px] leading-snug text-on-surface-variant">{t("verifLicenseHint")}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-on-surface">{t("verifDocs")}</span>
                  {statusPill(verifDocs === "ok" ? "ok" : "pending")}
                </div>
                <p className="text-[11px] leading-snug text-on-surface-variant">{t("verifDocsHint")}</p>
              </div>
            </div>
          </section>

          {(onboarding?.documentFileNames?.length ?? 0) > 0 || (onboarding?.documentsNote?.trim() ?? "").length > 0 ? (
            <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm">
              <h2 className="font-headline text-lg font-extrabold text-on-surface">{t("documentsSection")}</h2>
              {(onboarding?.documentFileNames?.length ?? 0) > 0 ? (
                <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto text-sm text-on-surface-variant">
                  {onboarding!.documentFileNames.map((n) => (
                    <li key={n} className="flex items-center gap-2 truncate">
                      <MaterialIcon name="description" className="!text-lg shrink-0" />
                      <span className="truncate">{n}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {onboarding?.documentsNote?.trim() ? (
                <p className="mt-3 rounded-xl bg-surface-container-low p-3 text-sm text-on-surface">{onboarding.documentsNote}</p>
              ) : null}
            </section>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/driver/settings"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-on-surface"
            >
              <MaterialIcon name="settings" className="!text-xl" />
              {t("actionSettings")}
            </Link>
            <Link
              href="/driver/support"
              className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-on-surface"
            >
              <MaterialIcon name="support_agent" className="!text-xl" />
              {t("actionSupport")}
            </Link>
            <Link href="/driver" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-primary underline underline-offset-4">
              <MaterialIcon name="dashboard" className="!text-xl" />
              {t("actionDashboard")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
