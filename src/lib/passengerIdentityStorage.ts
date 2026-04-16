import { getAccessToken } from "@/lib/auth";
import { getJwtSubject } from "@/lib/driverOnboardingStorage";

export type PassengerIdentityState = {
  identityDocumentFileNames: string[];
};

const KEY = (userId: string) => `saafir_passenger_identity_v1_${userId}`;

export function currentUserIdForStorage(): string | null {
  return getJwtSubject(getAccessToken());
}

export function defaultPassengerIdentityState(): PassengerIdentityState {
  return { identityDocumentFileNames: [] };
}

export function loadPassengerIdentity(userId: string): PassengerIdentityState {
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return defaultPassengerIdentityState();
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== "object") return defaultPassengerIdentityState();
    const o = j as Record<string, unknown>;
    const names = Array.isArray(o.identityDocumentFileNames)
      ? o.identityDocumentFileNames.filter((x): x is string => typeof x === "string")
      : [];
    return { identityDocumentFileNames: names };
  } catch {
    return defaultPassengerIdentityState();
  }
}

export function savePassengerIdentity(userId: string, state: PassengerIdentityState) {
  try {
    localStorage.setItem(KEY(userId), JSON.stringify({ identityDocumentFileNames: [...state.identityDocumentFileNames] }));
  } catch {
    /* noop */
  }
}

/** At least one identity document file selected (local names only). */
export function isPassengerIdentityComplete(): boolean {
  const uid = currentUserIdForStorage();
  if (!uid) return false;
  return loadPassengerIdentity(uid).identityDocumentFileNames.length > 0;
}
