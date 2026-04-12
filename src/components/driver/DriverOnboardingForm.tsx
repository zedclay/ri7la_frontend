"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { filesToDataUrls } from "@/lib/fileDataUrls";
import {
  currentDriverDraftUserId,
  loadDriverOnboardingState,
  saveDriverOnboardingState,
  type DriverOnboardingState,
  type DriverVehicleDraft,
} from "@/lib/driverOnboardingStorage";
import {
  documentSlotToOnboardingStep,
  parseDriverOnboardingUrlParams,
} from "@/lib/driverVerificationNavigation";
import {
  hasRejectedDocumentSlots,
  loadDriverDocumentReview,
  markDocumentSlotPending,
  syncDriverVerificationFromApi,
  type DocumentReviewSlot,
} from "@/lib/driverDocumentReviewStorage";
import { getCurrentDemoUser, updateCurrentDemoUser } from "@/lib/demoSession";
import { isValidEmail } from "@/lib/emailValidation";

const STEPS = 6 as const;
const YEARS = Array.from({ length: new Date().getFullYear() - 1989 }, (_, i) => new Date().getFullYear() - i);
const SEAT_OPTIONS = [2, 3, 4, 5, 6, 7, 8] as const;

async function syncDriverDocumentsToServer(
  partial: Partial<Record<"identity" | "license" | "vehiclePhotos" | "otherDocs", string[]>>
) {
  if (!getAccessToken()) return;
  try {
    await apiPostJsonData("/api/drivers/me/verification/documents", partial);
  } catch {
    /* offline */
  }
}

const COLOR_PRESETS: { id: string; labelKey: "colorWhite" | "colorBlack" | "colorRed" | "colorBlue" | "colorGrey"; className: string }[] = [
  { id: "white", labelKey: "colorWhite", className: "bg-white ring-2 ring-outline-variant/40" },
  { id: "black", labelKey: "colorBlack", className: "bg-slate-900" },
  { id: "red", labelKey: "colorRed", className: "bg-red-600" },
  { id: "blue", labelKey: "colorBlue", className: "bg-blue-600" },
  { id: "grey", labelKey: "colorGrey", className: "bg-slate-400" },
];

function splitMakeModel(line: string): { carMake: string; carModel: string } {
  const t = line.trim();
  if (!t) return { carMake: "", carModel: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { carMake: t, carModel: "" };
  return { carMake: t.slice(0, i).trim(), carModel: t.slice(i + 1).trim() };
}

type FieldErrors = Partial<Record<"vehicleLine" | "year" | "seats" | "color" | "plate", string>>;

type RemoteMe = {
  fullName: string;
  email: string | null;
  phoneE164: string | null;
};

export function DriverOnboardingForm() {
  const t = useTranslations("driverOnboarding");
  const router = useRouter();
  const searchParams = useSearchParams();
  /** Must match server first paint — read storage only in useEffect (client-only). */
  const [userId, setUserId] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const [profileFullName, setProfileFullName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [remotePhone, setRemotePhone] = useState("");
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [documentsNote, setDocumentsNote] = useState("");
  const [vehiclePhotoFileNames, setVehiclePhotoFileNames] = useState<string[]>([]);
  const [documentFileNames, setDocumentFileNames] = useState<string[]>([]);
  const [identityDocumentFileNames, setIdentityDocumentFileNames] = useState<string[]>([]);
  const [licenseDocumentFileNames, setLicenseDocumentFileNames] = useState<string[]>([]);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSms, setPrefSms] = useState(true);

  const [vehicleLine, setVehicleLine] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [passengerSeats, setPassengerSeats] = useState<number>(4);
  const [colorPreset, setColorPreset] = useState<string>("white");
  const [colorCustom, setColorCustom] = useState("");
  const [plateSequence, setPlateSequence] = useState("");
  const [plateModelCode, setPlateModelCode] = useState("");
  const [plateWilayaCode, setPlateWilayaCode] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [profileError, setProfileError] = useState<string | null>(null);
  const [step2FileError, setStep2FileError] = useState<string | null>(null);
  const [step3FileError, setStep3FileError] = useState<string | null>(null);
  const [step4VehicleFileError, setStep4VehicleFileError] = useState<string | null>(null);
  const [step5OtherDocsFileError, setStep5OtherDocsFileError] = useState<string | null>(null);
  const [activationError, setActivationError] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState(false);
  const [wizardCompletedOnce, setWizardCompletedOnce] = useState(false);
  const [reviewTick, setReviewTick] = useState(0);
  const hydratedUserIdRef = useRef<string | null>(null);

  const stepLabels = useMemo(
    () => [t("stepPersonal"), t("stepId"), t("stepLicense"), t("stepVehicle"), t("stepDocs"), t("stepPrefs")] as const,
    [t]
  );

  useEffect(() => {
    function syncUserId() {
      setUserId(currentDriverDraftUserId());
    }
    syncUserId();
    window.addEventListener("ri7la_auth", syncUserId);
    return () => window.removeEventListener("ri7la_auth", syncUserId);
  }, []);

  useEffect(() => {
    function onReview() {
      setReviewTick((x) => x + 1);
    }
    window.addEventListener("ri7la_driver_review", onReview);
    return () => window.removeEventListener("ri7la_driver_review", onReview);
  }, []);

  /** Sync verification before redirect / step logic so sessionStorage has server review state. */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      await syncDriverVerificationFromApi(userId);
      if (cancelled) return;
      setReviewTick((x) => x + 1);

      const { step: urlStep, slot } = parseDriverOnboardingUrlParams(searchParams);
      const hasDeepLink = urlStep != null || slot != null;
      if (hasDeepLink) return;

      const s = loadDriverOnboardingState(userId);
      if (s.wizardCompletedOnce && !hasRejectedDocumentSlots(userId)) {
        router.replace("/driver/profile");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, router, searchParams]);

  /** Deep links (?step= / ?slot=), rejected slots (after API sync), or saved progress set the wizard step. */
  useEffect(() => {
    if (!userId) return;
    const { step: urlStep, slot } = parseDriverOnboardingUrlParams(searchParams);
    if (slot) {
      setStep(documentSlotToOnboardingStep(slot));
      return;
    }
    if (urlStep != null) {
      setStep(urlStep);
      return;
    }

    const s = loadDriverOnboardingState(userId);
    const review = loadDriverDocumentReview(userId);
    if (s.wizardCompletedOnce && review && hasRejectedDocumentSlots(userId)) {
      if (review.identity === "rejected") setStep(2);
      else if (review.license === "rejected") setStep(3);
      else if (review.vehiclePhotos === "rejected") setStep(4);
      else if (review.otherDocs === "rejected") setStep(5);
      return;
    }
    setStep(s.step);
  }, [userId, reviewTick, searchParams]);

  const applyVehicle = useCallback((d: DriverVehicleDraft) => {
    setVehicleLine(d.vehicleLine);
    setYear(d.year);
    setPassengerSeats(d.passengerSeats);
    setColorPreset(d.colorPreset || "white");
    setColorCustom(d.colorCustom || "");
    setPlateSequence(d.plateSequence);
    setPlateModelCode(d.plateModelCode);
    setPlateWilayaCode(d.plateWilayaCode);
  }, []);

  const hydrateFromDemoVehicle = useCallback(() => {
    const demo = getCurrentDemoUser();
    if (demo?.carMake || demo?.carModel) {
      setVehicleLine([demo.carMake, demo.carModel].filter(Boolean).join(" ").trim());
    }
    if (demo?.carColor) {
      setColorPreset("other");
      setColorCustom(demo.carColor);
    }
    if (demo?.plateNumber) {
      const parts = demo.plateNumber.trim().split(/\s+/);
      if (parts[0]) setPlateSequence(parts[0]);
      if (parts[1]) setPlateModelCode(parts[1]);
      if (parts[2]) setPlateWilayaCode(parts[2]);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      hydratedUserIdRef.current = null;
      return;
    }
    if (hydratedUserIdRef.current === userId) return;
    hydratedUserIdRef.current = userId;

    const s = loadDriverOnboardingState(userId);
    setWizardCompletedOnce(s.wizardCompletedOnce === true);
    setProfileFullName(s.profileFullName);
    setProfileEmail(s.profileEmail);
    setNationalIdNumber(s.nationalIdNumber);
    setLicenseNumber(s.licenseNumber);
    setLicenseExpiry(s.licenseExpiry);
    setDocumentsNote(s.documentsNote);
    setVehiclePhotoFileNames(s.vehiclePhotoFileNames ?? []);
    setDocumentFileNames(s.documentFileNames ?? []);
    setIdentityDocumentFileNames(s.identityDocumentFileNames ?? []);
    setLicenseDocumentFileNames(s.licenseDocumentFileNames ?? []);
    setPrefEmail(s.prefEmail);
    setPrefSms(s.prefSms);
    applyVehicle(s.vehicle);
    if (!s.vehicle.vehicleLine.trim()) hydrateFromDemoVehicle();

    if (!getAccessToken()) return;
    let cancelled = false;
    void apiGetJsonData<RemoteMe>("/api/users/me")
      .then((u) => {
        if (cancelled || !u) return;
        setProfileFullName((prev) => (prev.trim() ? prev : u.fullName));
        setProfileEmail((prev) => (prev.trim() ? prev : u.email ?? ""));
        setRemotePhone(u.phoneE164 ?? "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally once per userId; applyVehicle/hydrateFromDemoVehicle are stable
  }, [userId]);

  const resolvedColor = useMemo(() => {
    if (colorPreset === "other") return colorCustom.trim();
    const p = COLOR_PRESETS.find((c) => c.id === colorPreset);
    return p ? t(p.labelKey) : colorCustom.trim();
  }, [colorPreset, colorCustom, t]);

  const docReview = useMemo(() => (userId ? loadDriverDocumentReview(userId) : null), [userId, reviewTick]);

  const touchRejectedSlot = useCallback(
    (slot: DocumentReviewSlot) => {
      if (!userId) return;
      const r = loadDriverDocumentReview(userId);
      if (r?.[slot] === "rejected") markDocumentSlotPending(userId, slot);
    },
    [userId],
  );

  function buildVehicleDraft(): DriverVehicleDraft {
    return {
      vehicleLine: vehicleLine.trim(),
      year,
      passengerSeats,
      colorPreset,
      colorCustom,
      plateSequence: plateSequence.trim(),
      plateModelCode: plateModelCode.trim(),
      plateWilayaCode: plateWilayaCode.trim(),
    };
  }

  function buildFullState(overrides?: Partial<DriverOnboardingState>): DriverOnboardingState {
    return {
      wizardCompletedOnce,
      step,
      profileFullName,
      profileEmail,
      nationalIdNumber,
      licenseNumber,
      licenseExpiry,
      documentsNote,
      prefEmail,
      prefSms,
      vehiclePhotoFileNames,
      documentFileNames,
      identityDocumentFileNames,
      licenseDocumentFileNames,
      vehicle: buildVehicleDraft(),
      ...overrides,
    };
  }

  function persist(overrides?: Partial<DriverOnboardingState>) {
    if (!userId) return;
    saveDriverOnboardingState(userId, buildFullState(overrides));
  }

  function validateProfileStep(): boolean {
    if (profileFullName.trim().length < 2 || !isValidEmail(profileEmail)) {
      setProfileError(t("errProfile"));
      return false;
    }
    setProfileError(null);
    return true;
  }

  function validateActivationDocuments(): boolean {
    if (identityDocumentFileNames.length === 0) {
      setActivationError(t("errIdentityUploadRequired"));
      return false;
    }
    if (licenseDocumentFileNames.length === 0) {
      setActivationError(t("errLicenseUploadRequired"));
      return false;
    }
    setActivationError(null);
    return true;
  }

  function validateVehicleForFinish(): boolean {
    const next: FieldErrors = {};
    if (vehicleLine.trim().length < 3) next.vehicleLine = t("errVehicleLine");
    if (!YEARS.includes(year)) next.year = t("errYear");
    if (!SEAT_OPTIONS.includes(passengerSeats as (typeof SEAT_OPTIONS)[number])) next.seats = t("errSeats");
    if (resolvedColor.trim().length < 2) next.color = t("errColor");

    const seq = plateSequence.replace(/\s/g, "");
    const mc = plateModelCode.replace(/\s/g, "");
    const w = plateWilayaCode.replace(/\s/g, "");
    if (seq.length < 4 || seq.length > 6) next.plate = t("errPlateSeq");
    else if (mc.length < 2 || mc.length > 3) next.plate = t("errPlateModel");
    else if (w.length < 1 || w.length > 2) next.plate = t("errPlateWilaya");

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function persistToDemoVehicleOnly() {
    const draft = buildVehicleDraft();
    const { carMake, carModel } = splitMakeModel(draft.vehicleLine);
    const plateFull = [draft.plateSequence, draft.plateModelCode, draft.plateWilayaCode].filter(Boolean).join(" ").trim();
    updateCurrentDemoUser({
      carMake: carMake || undefined,
      carModel: carModel || undefined,
      carColor: resolvedColor.trim() || undefined,
      plateNumber: plateFull || undefined,
    });
  }

  function handleSkipDocumentsLater() {
    if (!validateProfileStep()) return;
    if (!userId) return;
    setWizardCompletedOnce(true);
    saveDriverOnboardingState(userId, {
      ...buildFullState({ wizardCompletedOnce: true, step: 1 }),
    });
    updateCurrentDemoUser({
      profileCompleted: true,
      fullName: profileFullName.trim() || undefined,
      email: profileEmail.trim() || undefined,
    });
    try {
      window.dispatchEvent(new Event("ri7la_driver_onboarding"));
    } catch {
      /* noop */
    }
    router.push("/driver/profile");
  }

  function handleSaveProgress() {
    persist();
    persistToDemoVehicleOnly();
    updateCurrentDemoUser({
      fullName: profileFullName.trim() || undefined,
      email: profileEmail.trim() || undefined,
    });
    setSavedHint(true);
    window.setTimeout(() => setSavedHint(false), 4000);
  }

  function handleNext() {
    if (step === 1 && !validateProfileStep()) return;
    if (step === 2 && identityDocumentFileNames.length === 0) {
      setStep2FileError(t("errIdentityUploadRequired"));
      return;
    }
    setStep2FileError(null);
    if (step === 3 && licenseDocumentFileNames.length === 0) {
      setStep3FileError(t("errLicenseUploadRequired"));
      return;
    }
    setStep3FileError(null);
    if (step >= STEPS) return;
    const nextStep = step + 1;
    persist({ step: nextStep });
    setStep(nextStep);
  }

  function handleBack() {
    if (step <= 1) return;
    const prevStep = step - 1;
    persist({ step: prevStep });
    setStep(prevStep);
  }

  function onFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS) {
      handleNext();
      return;
    }
    if (!validateActivationDocuments()) return;
    if (!validateVehicleForFinish()) return;
    const draft = buildVehicleDraft();
    const { carMake, carModel } = splitMakeModel(draft.vehicleLine);
    const plateFull = `${plateSequence.trim()} ${plateModelCode.trim()} ${plateWilayaCode.trim()}`.trim();
    setWizardCompletedOnce(true);
    persist({ step: STEPS, wizardCompletedOnce: true });
    updateCurrentDemoUser({
      driverOnboardingCompleted: true,
      profileCompleted: true,
      verified: true,
      fullName: profileFullName.trim() || undefined,
      email: profileEmail.trim() || undefined,
      carMake: carMake || undefined,
      carModel: carModel || undefined,
      carColor: resolvedColor.trim(),
      plateNumber: plateFull,
    });
    try {
      window.dispatchEvent(new Event("ri7la_driver_onboarding"));
    } catch {
      /* noop */
    }
    router.push("/driver/profile");
  }

  const screenTitleKey = `screenTitle${step}` as const;
  const screenSubtitleKey = `screenSubtitle${step}` as const;

  return (
    <form className="mx-auto max-w-6xl space-y-8" onSubmit={onFormSubmit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {t("stepOfTotal", { current: step, total: STEPS })}
          </div>
          <h1 className="mt-2 font-headline text-3xl font-extrabold text-on-surface">{t(screenTitleKey)}</h1>
          <p className="mt-1 text-on-surface-variant">{t(screenSubtitleKey)}</p>
          {!userId ? (
            <p className="mt-2 text-sm font-semibold text-amber-800 dark:text-amber-200">{t("warnNoSession")}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-extrabold text-on-surface active:scale-95"
            onClick={handleSaveProgress}
          >
            {t("saveProgress")}
          </button>
          {step === 1 ? (
            <button
              type="button"
              className="rounded-full border-2 border-outline-variant/30 bg-surface-container-lowest px-6 py-3 text-sm font-extrabold text-on-surface active:scale-95"
              onClick={handleSkipDocumentsLater}
            >
              {t("skipDocumentsLater")}
            </button>
          ) : null}
          {step < STEPS ? (
            <button
              type="button"
              className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
              onClick={handleNext}
            >
              {t("next")}
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
            >
              {t("finish")}
            </button>
          )}
        </div>
      </div>

      {savedHint ? (
        <div className="rounded-xl bg-primary-container/20 px-4 py-3 text-sm font-semibold text-on-surface" role="status">
          {t("savedHint")}
        </div>
      ) : null}

      {docReview && userId && (hasRejectedDocumentSlots(userId) || (docReview.adminComment?.trim() ?? "").length > 0) ? (
        <div
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-4 text-sm text-on-surface"
          role="status"
        >
          <div className="flex items-start gap-2">
            <MaterialIcon name="admin_panel_settings" className="!text-xl shrink-0 text-amber-800 dark:text-amber-200" />
            <div>
              <div className="font-extrabold">{t("adminReviewBannerTitle")}</div>
              {docReview.adminComment?.trim() ? (
                <p className="mt-2 whitespace-pre-wrap text-on-surface-variant">{docReview.adminComment.trim()}</p>
              ) : null}
              <p className="mt-2 text-xs text-on-surface-variant">{t("adminReviewBannerHint")}</p>
            </div>
          </div>
        </div>
      ) : null}

      {activationError && step === STEPS ? (
        <div className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container" role="alert">
          {activationError}
        </div>
      ) : null}

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={
                    done
                      ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary"
                      : active
                        ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary"
                        : "flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant"
                  }
                >
                  {done ? <MaterialIcon name="check" className="!text-xl" /> : <span className="text-sm font-extrabold">{n}</span>}
                </div>
                <div className="max-w-[5.5rem] text-[10px] font-extrabold uppercase leading-tight tracking-widest text-on-surface-variant md:max-w-none">
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {step === 1 ? (
          <div className="mx-auto max-w-xl space-y-5">
            {profileError ? (
              <p className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container" role="alert">
                {profileError}
              </p>
            ) : null}
            <div>
              <label htmlFor="onb-fullname" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("profileFullNameLabel")}
              </label>
              <input
                id="onb-fullname"
                autoComplete="name"
                value={profileFullName}
                onChange={(e) => setProfileFullName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="onb-email" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("profileEmailLabel")}
              </label>
              <input
                id="onb-email"
                type="email"
                autoComplete="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("profilePhoneLabel")}</div>
              <p className="mt-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                {remotePhone || "—"}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">{t("profilePhoneHint")}</p>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mx-auto max-w-xl space-y-5">
            <p className="text-sm font-medium text-on-surface">{t("identityUploadIntro")}</p>
            <div className="rounded-2xl border border-dashed border-primary/35 bg-surface-container-low/50 p-5">
              <div className="flex items-start gap-3">
                <MaterialIcon name="badge" className="!text-2xl shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-on-surface">{t("identityUploadLabel")}</div>
                  <p className="mt-1 text-xs text-on-surface-variant">{t("identityUploadHint")}</p>
                  <label className="mt-3 flex cursor-pointer flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      multiple
                      className="sr-only"
                      onChange={async (e) => {
                        const list = e.target.files;
                        if (!list?.length) {
                          setIdentityDocumentFileNames([]);
                          return;
                        }
                        setIdentityDocumentFileNames(Array.from(list).map((f) => f.name));
                        touchRejectedSlot("identity");
                        setStep2FileError(null);
                        try {
                          const urls = await filesToDataUrls(list);
                          await syncDriverDocumentsToServer({ identity: urls });
                        } catch (err) {
                          setStep2FileError(err instanceof Error ? err.message : "Upload failed");
                        }
                      }}
                    />
                    <span className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md active:scale-95">
                      {t("chooseFiles")}
                    </span>
                  </label>
                  {identityDocumentFileNames.length > 0 ? (
                    <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto text-xs text-on-surface-variant">
                      {identityDocumentFileNames.map((name) => (
                        <li key={name} className="truncate font-medium">
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
            {step2FileError ? (
              <p className="text-sm font-semibold text-error" role="alert">
                {step2FileError}
              </p>
            ) : null}
            <div>
              <label htmlFor="onb-id" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("idNumberLabel")}
              </label>
              <input
                id="onb-id"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value)}
                placeholder={t("idNumberPlaceholder")}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mx-auto max-w-xl space-y-5">
            <p className="text-sm font-medium text-on-surface">{t("licenseUploadIntro")}</p>
            <div className="rounded-2xl border border-dashed border-primary/35 bg-surface-container-low/50 p-5">
              <div className="flex items-start gap-3">
                <MaterialIcon name="card_membership" className="!text-2xl shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-on-surface">{t("licenseUploadLabel")}</div>
                  <p className="mt-1 text-xs text-on-surface-variant">{t("licenseUploadHint")}</p>
                  <label className="mt-3 flex cursor-pointer flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      multiple
                      className="sr-only"
                      onChange={async (e) => {
                        const list = e.target.files;
                        if (!list?.length) {
                          setLicenseDocumentFileNames([]);
                          return;
                        }
                        setLicenseDocumentFileNames(Array.from(list).map((f) => f.name));
                        touchRejectedSlot("license");
                        setStep3FileError(null);
                        try {
                          const urls = await filesToDataUrls(list);
                          await syncDriverDocumentsToServer({ license: urls });
                        } catch (err) {
                          setStep3FileError(err instanceof Error ? err.message : "Upload failed");
                        }
                      }}
                    />
                    <span className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md active:scale-95">
                      {t("chooseFiles")}
                    </span>
                  </label>
                  {licenseDocumentFileNames.length > 0 ? (
                    <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto text-xs text-on-surface-variant">
                      {licenseDocumentFileNames.map((name) => (
                        <li key={name} className="truncate font-medium">
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
            {step3FileError ? (
              <p className="text-sm font-semibold text-error" role="alert">
                {step3FileError}
              </p>
            ) : null}
            <div>
              <label htmlFor="onb-license" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("licenseNumberLabel")}
              </label>
              <input
                id="onb-license"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder={t("licenseNumberPlaceholder")}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="onb-license-exp" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("licenseExpiryLabel")}
              </label>
              <input
                id="onb-license-exp"
                type="date"
                value={licenseExpiry}
                onChange={(e) => setLicenseExpiry(e.target.value)}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <label htmlFor="driver-vehicle-line" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {t("vehicleLineLabel")}
                </label>
                <input
                  id="driver-vehicle-line"
                  name="vehicleLine"
                  autoComplete="off"
                  value={vehicleLine}
                  onChange={(e) => setVehicleLine(e.target.value)}
                  placeholder={t("vehicleLinePlaceholder")}
                  aria-invalid={!!errors.vehicleLine}
                  aria-describedby={errors.vehicleLine ? "err-vehicle" : "hint-vehicle"}
                  className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p id="hint-vehicle" className="mt-1 text-xs text-on-surface-variant">
                  {t("vehicleLineHint")}
                </p>
                {errors.vehicleLine ? (
                  <p id="err-vehicle" className="mt-1 text-xs font-semibold text-error" role="alert">
                    {errors.vehicleLine}
                  </p>
                ) : null}
              </div>

              <div className="max-w-xs">
                <label htmlFor="driver-year" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {t("yearLabel")}
                </label>
                <div className="relative mt-2">
                  <select
                    id="driver-year"
                    name="year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full appearance-none rounded-xl border border-transparent bg-surface-container-low px-4 py-3 pe-10 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <MaterialIcon
                    name="expand_more"
                    className="pointer-events-none absolute end-3 top-1/2 !text-xl -translate-y-1/2 text-outline"
                  />
                </div>
                {errors.year ? <p className="mt-1 text-xs font-semibold text-error">{errors.year}</p> : null}
              </div>

              <fieldset>
                <legend className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("seatsLabel")}</legend>
                <p className="mt-1 text-xs text-on-surface-variant">{t("seatsLegendHint")}</p>
                <div
                  className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3"
                  role="group"
                  aria-label={t("seatsLabel")}
                >
                  {SEAT_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPassengerSeats(n)}
                      aria-pressed={passengerSeats === n}
                      className={`flex min-h-[52px] flex-col items-center justify-center rounded-2xl border-2 px-2 py-2 text-center transition-all active:scale-[0.98] ${
                        passengerSeats === n
                          ? "border-primary bg-primary-container/15 shadow-md ring-2 ring-primary/25"
                          : "border-outline-variant/35 bg-surface-container-low hover:border-outline-variant"
                      }`}
                    >
                      <span className="text-lg font-extrabold tabular-nums leading-none text-on-surface">{n}</span>
                      <span className="mt-1 text-[10px] font-semibold leading-tight text-on-surface-variant">{t("seatsShort")}</span>
                    </button>
                  ))}
                </div>
                {errors.seats ? <p className="mt-1 text-xs font-semibold text-error">{errors.seats}</p> : null}
              </fieldset>

              <fieldset>
                <legend className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("colorLabel")}</legend>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setColorPreset(c.id);
                        setColorCustom("");
                      }}
                      title={t(c.labelKey)}
                      aria-label={t(c.labelKey)}
                      aria-pressed={colorPreset === c.id}
                      className={`h-10 w-10 shrink-0 rounded-full ring-2 transition-transform active:scale-95 ${c.className} ${
                        colorPreset === c.id ? "ring-primary ring-offset-2" : "ring-outline-variant/30"
                      }`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setColorPreset("other")}
                    aria-pressed={colorPreset === "other"}
                    className={`rounded-full border-2 border-dashed px-3 py-2 text-xs font-bold ${
                      colorPreset === "other" ? "border-primary text-primary" : "border-outline-variant text-on-surface-variant"
                    }`}
                  >
                    {t("colorOther")}
                  </button>
                </div>
                {colorPreset === "other" ? (
                  <input
                    id="driver-color-custom"
                    value={colorCustom}
                    onChange={(e) => setColorCustom(e.target.value)}
                    placeholder={t("colorCustomPlaceholder")}
                    className="mt-3 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                ) : null}
                {errors.color ? <p className="mt-1 text-xs font-semibold text-error">{errors.color}</p> : null}
              </fieldset>

              <fieldset>
                <legend className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("plateLabel")}</legend>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label htmlFor="plate-seq" className="mb-1 block text-xs font-semibold text-on-surface-variant">
                      {t("plateSeq")}
                    </label>
                    <input
                      id="plate-seq"
                      inputMode="numeric"
                      autoComplete="off"
                      value={plateSequence}
                      onChange={(e) => setPlateSequence(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="12345"
                      className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-center text-sm font-extrabold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="plate-model" className="mb-1 block text-xs font-semibold text-on-surface-variant">
                      {t("plateModel")}
                    </label>
                    <input
                      id="plate-model"
                      inputMode="numeric"
                      autoComplete="off"
                      value={plateModelCode}
                      onChange={(e) => setPlateModelCode(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      placeholder="120"
                      className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-center text-sm font-extrabold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="plate-wilaya" className="mb-1 block text-xs font-semibold text-on-surface-variant">
                      {t("plateWilaya")}
                    </label>
                    <input
                      id="plate-wilaya"
                      inputMode="numeric"
                      autoComplete="off"
                      value={plateWilayaCode}
                      onChange={(e) => setPlateWilayaCode(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="16"
                      className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-center text-sm font-extrabold text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">{t("plateHint")}</p>
                {errors.plate ? (
                  <p className="mt-1 text-xs font-semibold text-error" role="alert">
                    {errors.plate}
                  </p>
                ) : null}
              </fieldset>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-primary/30 bg-surface-container-low/50 p-6">
                <div className="flex items-start gap-3">
                  <MaterialIcon name="add_a_photo" className="!text-2xl shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-extrabold text-on-surface">{t("vehiclePhotosLabel")}</div>
                    <p className="mt-1 text-xs text-on-surface-variant">{t("vehiclePhotosHint")}</p>
                    <label className="mt-4 flex cursor-pointer flex-col gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={async (e) => {
                          const list = e.target.files;
                          if (!list?.length) {
                            setVehiclePhotoFileNames([]);
                            return;
                          }
                          setVehiclePhotoFileNames(Array.from(list).map((f) => f.name));
                          touchRejectedSlot("vehiclePhotos");
                          setStep4VehicleFileError(null);
                          try {
                            const urls = await filesToDataUrls(list);
                            await syncDriverDocumentsToServer({ vehiclePhotos: urls });
                          } catch (err) {
                            setStep4VehicleFileError(err instanceof Error ? err.message : "Upload failed");
                          }
                        }}
                      />
                      <span className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md active:scale-95">
                        {t("chooseFiles")}
                      </span>
                    </label>
                    {vehiclePhotoFileNames.length > 0 ? (
                      <p className="mt-3 text-xs font-medium text-on-surface">
                        {t("filesSelectedCount", { count: vehiclePhotoFileNames.length })}
                      </p>
                    ) : null}
                    {vehiclePhotoFileNames.length > 0 ? (
                      <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-on-surface-variant">
                        {vehiclePhotoFileNames.map((name) => (
                          <li key={name} className="truncate font-medium">
                            {name}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {step4VehicleFileError ? (
                      <p className="mt-2 text-sm font-semibold text-error" role="alert">
                        {step4VehicleFileError}
                      </p>
                    ) : null}
                    <p className="mt-3 text-[11px] text-on-surface-variant">{t("photoLaterBody")}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-tertiary-fixed/50 p-6">
                  <div className="flex items-start gap-3">
                    <MaterialIcon name="verified_user" className="!text-2xl text-tertiary" />
                    <div>
                      <div className="text-sm font-extrabold text-on-tertiary-fixed">{t("trustTitle")}</div>
                      <div className="mt-1 text-xs text-on-tertiary-fixed-variant">{t("trustBody")}</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-primary-container p-6 text-white">
                  <div className="text-sm font-extrabold">{t("helpTitle")}</div>
                  <div className="mt-1 text-xs text-white/80">{t("helpBody")}</div>
                  <Link href="/driver/support" className="mt-3 inline-flex text-xs font-extrabold underline underline-offset-4">
                    {t("helpLink")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mx-auto max-w-xl space-y-5">
            <div className="rounded-2xl border border-dashed border-primary/30 bg-surface-container-low/50 p-6">
              <div className="flex items-start gap-3">
                <MaterialIcon name="upload_file" className="!text-2xl shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-on-surface">{t("documentsUploadLabel")}</div>
                  <p className="mt-1 text-xs text-on-surface-variant">{t("documentsUploadHint")}</p>
                  <label className="mt-4 flex cursor-pointer flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      multiple
                      className="sr-only"
                      onChange={async (e) => {
                        const list = e.target.files;
                        if (!list?.length) {
                          setDocumentFileNames([]);
                          return;
                        }
                        setDocumentFileNames(Array.from(list).map((f) => f.name));
                        touchRejectedSlot("otherDocs");
                        setStep5OtherDocsFileError(null);
                        try {
                          const urls = await filesToDataUrls(list);
                          await syncDriverDocumentsToServer({ otherDocs: urls });
                        } catch (err) {
                          setStep5OtherDocsFileError(err instanceof Error ? err.message : "Upload failed");
                        }
                      }}
                    />
                    <span className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md active:scale-95">
                      {t("chooseFiles")}
                    </span>
                  </label>
                  {documentFileNames.length > 0 ? (
                    <p className="mt-3 text-xs font-medium text-on-surface">
                      {t("filesSelectedCount", { count: documentFileNames.length })}
                    </p>
                  ) : null}
                  {documentFileNames.length > 0 ? (
                    <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-on-surface-variant">
                      {documentFileNames.map((name) => (
                        <li key={name} className="truncate font-medium">
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {step5OtherDocsFileError ? (
                    <p className="mt-2 text-sm font-semibold text-error" role="alert">
                      {step5OtherDocsFileError}
                    </p>
                  ) : null}
                  <p className="mt-3 text-[11px] text-on-surface-variant">{t("docsLaterBody")}</p>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="onb-docs-note" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("documentsNoteLabel")}
              </label>
              <textarea
                id="onb-docs-note"
                rows={3}
                value={documentsNote}
                onChange={(e) => setDocumentsNote(e.target.value)}
                placeholder={t("documentsNotePlaceholder")}
                className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-3 rounded-2xl border border-outline-variant/20 bg-surface-container-low/40 p-5 text-sm">
              <div>
                <span className="font-extrabold text-on-surface">{t("reviewProfile")}:</span>{" "}
                <span className="text-on-surface-variant">{profileFullName.trim() || "—"}</span>
              </div>
              <div>
                <span className="font-extrabold text-on-surface">{t("reviewEmail")}:</span>{" "}
                <span className="text-on-surface-variant">{profileEmail.trim() || "—"}</span>
              </div>
              <div>
                <span className="font-extrabold text-on-surface">{t("reviewPhone")}:</span>{" "}
                <span className="text-on-surface-variant">{remotePhone || "—"}</span>
              </div>
              <div>
                <span className="font-extrabold text-on-surface">{t("reviewVehicle")}:</span>{" "}
                <span className="text-on-surface-variant">{vehicleLine.trim() || "—"}</span>
              </div>
              <div>
                <span className="font-extrabold text-on-surface">{t("reviewPlate")}:</span>{" "}
                <span className="text-on-surface-variant">
                  {[plateSequence, plateModelCode, plateWilayaCode].filter(Boolean).join(" ") || "—"}
                </span>
              </div>
            </div>
            <fieldset className="space-y-3">
              <legend className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("prefsSectionLabel")}</legend>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                <input type="checkbox" checked={prefEmail} onChange={(e) => setPrefEmail(e.target.checked)} className="size-4 accent-primary" />
                <span className="text-sm font-semibold text-on-surface">{t("prefEmailLabel")}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                <input type="checkbox" checked={prefSms} onChange={(e) => setPrefSms(e.target.checked)} className="size-4 accent-primary" />
                <span className="text-sm font-semibold text-on-surface">{t("prefSmsLabel")}</span>
              </label>
            </fieldset>
            {Object.keys(errors).length > 0 ? (
              <p className="text-xs font-semibold text-error">{t("reviewVehicleErrorsHint")}</p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/15 pt-8">
          <button
            type="button"
            disabled={step <= 1}
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 px-5 py-2.5 text-sm font-bold text-on-surface disabled:opacity-40"
          >
            <MaterialIcon name="arrow_back" className="!text-lg rtl:rotate-180" />
            {t("back")}
          </button>
          <div className="flex flex-wrap gap-3">
            {step < STEPS ? (
              <button
                type="button"
                className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
                onClick={handleNext}
              >
                {t("next")}
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
              >
                {t("finish")}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/driver" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4">
            <MaterialIcon name="arrow_back" className="!text-lg rtl:rotate-180" />
            {t("backDashboard")}
          </Link>
        </div>
      </div>
    </form>
  );
}
