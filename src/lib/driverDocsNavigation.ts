import {
  hasRejectedDocumentSlots,
  loadDriverDocumentReview,
  type DocumentReviewSlot,
} from "@/lib/driverDocumentReviewStorage";
import { buildDriverOnboardingDocumentsHref } from "@/lib/driverVerificationNavigation";
import { currentDriverDraftUserId, loadDriverOnboardingState } from "@/lib/driverOnboardingStorage";

/** Where to send the driver to add or fix documents (onboarding first time; vehicle later; onboarding again if admin rejected). */
export function getDriverDocsCtaHref(): string {
  const uid = currentDriverDraftUserId();
  if (!uid) return "/driver/onboarding";
  const review = loadDriverDocumentReview(uid);
  if (review && hasRejectedDocumentSlots(uid)) {
    const order: DocumentReviewSlot[] = ["identity", "license", "vehiclePhotos", "otherDocs"];
    for (const k of order) {
      if (review[k] === "rejected") return buildDriverOnboardingDocumentsHref({ slot: k });
    }
  }
  const s = loadDriverOnboardingState(uid);
  if (s.wizardCompletedOnce === true) return "/driver/vehicle";
  return "/driver/onboarding";
}
