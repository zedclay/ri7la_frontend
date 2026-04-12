/**
 * Driver document review: server-backed when available (`/api/drivers/me/verification`),
 * with localStorage fallback for offline / demo.
 */

import { apiGetJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";

export type DocumentReviewSlot = "identity" | "license" | "vehiclePhotos" | "otherDocs";

export type DocumentReviewStatus = "pending" | "approved" | "rejected";

export type DriverDocumentReview = {
  identity: DocumentReviewStatus;
  license: DocumentReviewStatus;
  vehiclePhotos: DocumentReviewStatus;
  otherDocs: DocumentReviewStatus;
  /** Shown to the driver when something is rejected */
  adminComment?: string;
  updatedAt?: string;
};

const KEY = (userId: string) => `ri7la_driver_doc_review_v1_${userId}`;
const API_CACHE_KEY = (userId: string) => `ri7la_driver_verification_api_v1_${userId}`;

const defaultReview = (): DriverDocumentReview => ({
  identity: "pending",
  license: "pending",
  vehiclePhotos: "pending",
  otherDocs: "pending",
});

function parseReview(raw: string): DriverDocumentReview | null {
  try {
    const j = JSON.parse(raw) as Partial<DriverDocumentReview>;
    if (typeof j !== "object" || !j) return null;
    const d = defaultReview();
    const slot: DocumentReviewSlot[] = ["identity", "license", "vehiclePhotos", "otherDocs"];
    for (const s of slot) {
      const v = j[s];
      if (v === "pending" || v === "approved" || v === "rejected") d[s] = v;
    }
    if (typeof j.adminComment === "string") d.adminComment = j.adminComment;
    if (typeof j.updatedAt === "string") d.updatedAt = j.updatedAt;
    return d;
  } catch {
    return null;
  }
}

function loadApiCache(userId: string): DriverDocumentReview | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(API_CACHE_KEY(userId));
    if (!raw) return null;
    return parseReview(raw);
  } catch {
    return null;
  }
}

/**
 * Pull verification status from the API (drivers only). Merges into sessionStorage; dispatch `ri7la_driver_review`.
 */
export async function syncDriverVerificationFromApi(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!getAccessToken()) {
    try {
      sessionStorage.removeItem(API_CACHE_KEY(userId));
    } catch {
      /* noop */
    }
    return;
  }
  try {
    const data = await apiGetJsonData<{
      userId: string;
      identity: DocumentReviewStatus;
      license: DocumentReviewStatus;
      vehiclePhotos: DocumentReviewStatus;
      otherDocs: DocumentReviewStatus;
      adminComment: string | null;
      updatedAt: string | null;
    }>("/api/drivers/me/verification");
    if (data.userId !== userId) return;
    const merged: DriverDocumentReview = {
      identity: data.identity,
      license: data.license,
      vehiclePhotos: data.vehiclePhotos,
      otherDocs: data.otherDocs,
      adminComment: data.adminComment ?? undefined,
      updatedAt: data.updatedAt ?? undefined,
    };
    sessionStorage.setItem(API_CACHE_KEY(userId), JSON.stringify(merged));
    try {
      window.dispatchEvent(new Event("ri7la_driver_review"));
    } catch {
      /* noop */
    }
  } catch {
    try {
      sessionStorage.removeItem(API_CACHE_KEY(userId));
    } catch {
      /* noop */
    }
  }
}

export function loadDriverDocumentReview(userId: string): DriverDocumentReview | null {
  const api = loadApiCache(userId);
  if (api) return api;
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return null;
    return parseReview(raw);
  } catch {
    return null;
  }
}

export function saveDriverDocumentReview(userId: string, review: DriverDocumentReview) {
  const payload: DriverDocumentReview = {
    ...review,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY(userId), JSON.stringify(payload));
    try {
      window.dispatchEvent(new Event("ri7la_driver_review"));
    } catch {
      /* noop */
    }
  } catch {
    return;
  }
}

export function hasRejectedDocumentSlots(userId: string): boolean {
  const r = loadDriverDocumentReview(userId);
  if (!r) return false;
  return (
    r.identity === "rejected" ||
    r.license === "rejected" ||
    r.vehiclePhotos === "rejected" ||
    r.otherDocs === "rejected"
  );
}

/** After driver re-uploads, mark slot pending again so admin can re-review (demo). */
export function markDocumentSlotPending(userId: string, slot: DocumentReviewSlot) {
  const cur = loadDriverDocumentReview(userId);
  if (!cur) return;
  saveDriverDocumentReview(userId, { ...cur, [slot]: "pending" });
}
