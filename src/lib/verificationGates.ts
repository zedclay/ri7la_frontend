import { loadDriverDocumentReview } from "@/lib/driverDocumentReviewStorage";
import { currentDriverDraftUserId, loadDriverOnboardingState } from "@/lib/driverOnboardingStorage";
import { isPassengerIdentityComplete } from "@/lib/passengerIdentityStorage";

/**
 * Driver can accept requests when ID + license are satisfied.
 * If an admin review exists, both slots must be `approved`.
 * Otherwise (no review yet), local file names must be present (legacy demo).
 */
export function isDriverIdentityAndLicenseUploaded(): boolean {
  const uid = currentDriverDraftUserId();
  if (!uid) return false;
  const s = loadDriverOnboardingState(uid);
  const hasLocal = s.identityDocumentFileNames.length > 0 && s.licenseDocumentFileNames.length > 0;
  const review = loadDriverDocumentReview(uid);
  if (!review) return hasLocal;
  return review.identity === "approved" && review.license === "approved";
}

export { isPassengerIdentityComplete };
