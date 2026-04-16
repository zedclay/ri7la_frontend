import { getAccessToken } from "@/lib/auth";

export type DriverVehicleDraft = {
  vehicleLine: string;
  year: number;
  passengerSeats: number;
  /** Preset id: white | black | red | blue | grey | other */
  colorPreset: string;
  colorCustom: string;
  plateSequence: string;
  plateModelCode: string;
  plateWilayaCode: string;
};

export type DriverOnboardingState = {
  /** True after the driver finishes the wizard or skips “documents later” — hides full onboarding on next visits. */
  wizardCompletedOnce?: boolean;
  /** 1 = Profil … 6 = Préférences */
  step: number;
  profileFullName: string;
  profileEmail: string;
  nationalIdNumber: string;
  licenseNumber: string;
  licenseExpiry: string;
  documentsNote: string;
  prefEmail: boolean;
  prefSms: boolean;
  /** Local file names only (browser cannot persist File blobs in localStorage). */
  vehiclePhotoFileNames: string[];
  documentFileNames: string[];
  /** Required for driver account activation (accepting requests). */
  identityDocumentFileNames: string[];
  licenseDocumentFileNames: string[];
  vehicle: DriverVehicleDraft;
};

const KEY_LEGACY_VEHICLE = (userId: string) => `saafir_driver_vehicle_draft_${userId}`;
const KEY_V2 = (userId: string) => `saafir_driver_onboarding_v2_${userId}`;

/** Read `sub` from JWT payload (storage key only; not a security check). */
export function getJwtSubject(accessToken: string | null | undefined): string | null {
  if (!accessToken) return null;
  const parts = accessToken.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = JSON.parse(atob(b64 + pad)) as { sub?: unknown };
    return typeof json.sub === "string" ? json.sub : null;
  } catch {
    return null;
  }
}

export function currentDriverDraftUserId(): string | null {
  return getJwtSubject(getAccessToken());
}

function defaultVehicleDraft(): DriverVehicleDraft {
  return {
    vehicleLine: "",
    year: new Date().getFullYear(),
    passengerSeats: 4,
    colorPreset: "white",
    colorCustom: "",
    plateSequence: "",
    plateModelCode: "",
    plateWilayaCode: "",
  };
}

export function defaultDriverOnboardingState(): DriverOnboardingState {
  return {
    wizardCompletedOnce: false,
    step: 1,
    profileFullName: "",
    profileEmail: "",
    nationalIdNumber: "",
    licenseNumber: "",
    licenseExpiry: "",
    documentsNote: "",
    prefEmail: true,
    prefSms: true,
    vehiclePhotoFileNames: [],
    documentFileNames: [],
    identityDocumentFileNames: [],
    licenseDocumentFileNames: [],
    vehicle: defaultVehicleDraft(),
  };
}

function clampStep(n: number): number {
  if (n < 1) return 1;
  if (n > 6) return 6;
  return n;
}

function parseVehiclePartial(j: unknown): Partial<DriverVehicleDraft> | null {
  if (!j || typeof j !== "object") return null;
  const o = j as Record<string, unknown>;
  const out: Partial<DriverVehicleDraft> = {};
  if (typeof o.vehicleLine === "string") out.vehicleLine = o.vehicleLine;
  if (typeof o.year === "number" && Number.isFinite(o.year)) out.year = o.year;
  if (typeof o.passengerSeats === "number" && Number.isFinite(o.passengerSeats)) out.passengerSeats = o.passengerSeats;
  if (typeof o.colorPreset === "string") out.colorPreset = o.colorPreset;
  if (typeof o.colorCustom === "string") out.colorCustom = o.colorCustom;
  if (typeof o.plateSequence === "string") out.plateSequence = o.plateSequence;
  if (typeof o.plateModelCode === "string") out.plateModelCode = o.plateModelCode;
  if (typeof o.plateWilayaCode === "string") out.plateWilayaCode = o.plateWilayaCode;
  return Object.keys(out).length ? out : null;
}

function mergeVehicle(base: DriverVehicleDraft, partial: Partial<DriverVehicleDraft> | null): DriverVehicleDraft {
  if (!partial) return base;
  return { ...base, ...partial };
}

function normalizeOnboardingState(raw: unknown): DriverOnboardingState {
  const d = defaultDriverOnboardingState();
  if (!raw || typeof raw !== "object") return d;
  const o = raw as Record<string, unknown>;
  if (typeof o.wizardCompletedOnce === "boolean") d.wizardCompletedOnce = o.wizardCompletedOnce;
  if (typeof o.step === "number" && Number.isFinite(o.step)) d.step = clampStep(o.step);
  if (typeof o.profileFullName === "string") d.profileFullName = o.profileFullName;
  if (typeof o.profileEmail === "string") d.profileEmail = o.profileEmail;
  if (typeof o.nationalIdNumber === "string") d.nationalIdNumber = o.nationalIdNumber;
  if (typeof o.licenseNumber === "string") d.licenseNumber = o.licenseNumber;
  if (typeof o.licenseExpiry === "string") d.licenseExpiry = o.licenseExpiry;
  if (typeof o.documentsNote === "string") d.documentsNote = o.documentsNote;
  if (typeof o.prefEmail === "boolean") d.prefEmail = o.prefEmail;
  if (typeof o.prefSms === "boolean") d.prefSms = o.prefSms;
  if (Array.isArray(o.vehiclePhotoFileNames)) {
    d.vehiclePhotoFileNames = o.vehiclePhotoFileNames.filter((x): x is string => typeof x === "string");
  }
  if (Array.isArray(o.documentFileNames)) {
    d.documentFileNames = o.documentFileNames.filter((x): x is string => typeof x === "string");
  }
  if (Array.isArray(o.identityDocumentFileNames)) {
    d.identityDocumentFileNames = o.identityDocumentFileNames.filter((x): x is string => typeof x === "string");
  }
  if (Array.isArray(o.licenseDocumentFileNames)) {
    d.licenseDocumentFileNames = o.licenseDocumentFileNames.filter((x): x is string => typeof x === "string");
  }
  const v = parseVehiclePartial(o.vehicle);
  d.vehicle = mergeVehicle(d.vehicle, v);
  return d;
}

/** Full wizard state (steps 1–6). Migrates legacy vehicle-only draft as step 4. */
export function loadDriverOnboardingState(userId: string): DriverOnboardingState {
  try {
    const raw = localStorage.getItem(KEY_V2(userId));
    if (raw) {
      try {
        return normalizeOnboardingState(JSON.parse(raw) as unknown);
      } catch {
        return defaultDriverOnboardingState();
      }
    }
  } catch {
    /* storage unavailable */
  }
  const legacy = loadDriverVehicleDraft(userId);
  if (legacy) {
    return { ...defaultDriverOnboardingState(), step: 4, vehicle: legacy };
  }
  return defaultDriverOnboardingState();
}

export function saveDriverOnboardingState(userId: string, state: DriverOnboardingState) {
  const safe: DriverOnboardingState = {
    ...state,
    wizardCompletedOnce: state.wizardCompletedOnce === true,
    step: clampStep(state.step),
    vehiclePhotoFileNames: [...state.vehiclePhotoFileNames],
    documentFileNames: [...state.documentFileNames],
    identityDocumentFileNames: [...state.identityDocumentFileNames],
    licenseDocumentFileNames: [...state.licenseDocumentFileNames],
    vehicle: { ...state.vehicle },
  };
  try {
    localStorage.setItem(KEY_V2(userId), JSON.stringify(safe));
    localStorage.setItem(KEY_LEGACY_VEHICLE(userId), JSON.stringify(safe.vehicle));
  } catch {
    return;
  }
}

export function loadDriverVehicleDraft(userId: string): DriverVehicleDraft | null {
  try {
    const raw = localStorage.getItem(KEY_LEGACY_VEHICLE(userId));
    if (!raw) return null;
    const j = JSON.parse(raw) as Partial<DriverVehicleDraft>;
    if (typeof j.vehicleLine !== "string") return null;
    return {
      vehicleLine: j.vehicleLine,
      year: typeof j.year === "number" ? j.year : new Date().getFullYear(),
      passengerSeats: typeof j.passengerSeats === "number" ? j.passengerSeats : 4,
      colorPreset: typeof j.colorPreset === "string" ? j.colorPreset : "white",
      colorCustom: typeof j.colorCustom === "string" ? j.colorCustom : "",
      plateSequence: typeof j.plateSequence === "string" ? j.plateSequence : "",
      plateModelCode: typeof j.plateModelCode === "string" ? j.plateModelCode : "",
      plateWilayaCode: typeof j.plateWilayaCode === "string" ? j.plateWilayaCode : "",
    };
  } catch {
    return null;
  }
}

export function saveDriverVehicleDraft(userId: string, draft: DriverVehicleDraft) {
  try {
    localStorage.setItem(KEY_LEGACY_VEHICLE(userId), JSON.stringify(draft));
  } catch {
    return;
  }
}
