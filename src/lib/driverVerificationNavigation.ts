import type { DocumentReviewSlot } from "@/lib/driverDocumentReviewStorage";

const SLOT_TO_STEP: Record<DocumentReviewSlot, number> = {
  identity: 2,
  license: 3,
  vehiclePhotos: 4,
  otherDocs: 5,
};

export function documentSlotToOnboardingStep(slot: DocumentReviewSlot): number {
  return SLOT_TO_STEP[slot];
}

/** Query params supported: `step=1-6`, `slot` or `focus` = identity | license | vehiclePhotos | otherDocs */
export function parseDriverOnboardingUrlParams(searchParams: URLSearchParams): {
  step?: number;
  slot?: DocumentReviewSlot;
} {
  const validSlots: DocumentReviewSlot[] = ["identity", "license", "vehiclePhotos", "otherDocs"];
  const rawSlot = searchParams.get("slot") ?? searchParams.get("focus");
  const slot =
    rawSlot && validSlots.includes(rawSlot as DocumentReviewSlot) ? (rawSlot as DocumentReviewSlot) : undefined;

  const stepRaw = searchParams.get("step");
  let step: number | undefined;
  if (stepRaw != null && stepRaw !== "") {
    const n = Number.parseInt(stepRaw, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 6) step = n;
  }

  return { step, slot };
}

export type ServerVerificationSlots = {
  identity: string;
  license: string;
  vehiclePhotos: string;
  otherDocs: string;
};

/**
 * Pick onboarding step for "fix documents" CTAs: first rejected slot (in flow order), else first pending, else step 2.
 */
export function pickAttentionStepFromServerSlots(slots: ServerVerificationSlots): number {
  const slot = pickAttentionSlotFromServerSlots(slots);
  return slot ? documentSlotToOnboardingStep(slot) : 2;
}

/** First rejected slot (in flow order), else first pending — for deep links. */
export function pickAttentionSlotFromServerSlots(slots: ServerVerificationSlots): DocumentReviewSlot | null {
  const order: DocumentReviewSlot[] = ["identity", "license", "vehiclePhotos", "otherDocs"];
  for (const s of order) {
    if (slots[s] === "rejected") return s;
  }
  for (const s of order) {
    if (slots[s] === "pending") return s;
  }
  return null;
}

export function buildDriverOnboardingDocumentsHref(opts: {
  step?: number;
  slot?: DocumentReviewSlot;
}): string {
  const base = "/driver/onboarding";
  if (opts.slot) {
    return `${base}?slot=${encodeURIComponent(opts.slot)}`;
  }
  if (opts.step != null && opts.step >= 1 && opts.step <= 6) {
    return `${base}?step=${opts.step}`;
  }
  return base;
}

export function buildDriverOnboardingDocumentsHrefFromSlots(slots: ServerVerificationSlots): string {
  const slot = pickAttentionSlotFromServerSlots(slots);
  if (slot) return buildDriverOnboardingDocumentsHref({ slot });
  return buildDriverOnboardingDocumentsHref({ step: 2 });
}
