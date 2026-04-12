/** Maps backend audit `action` codes to short English labels for admin UI. */
const LABELS: Record<string, string> = {
  "user.status_update": "User status changed",
  "user.role_add": "Role added",
  "user.role_remove": "Role removed",
  "driver.verification_update": "Driver verification updated",
  "passenger.verification_update": "Passenger verification updated",
  "payment.baridimob_confirm": "Baridimob payment confirmed",
  "review.moderate": "Review moderated",
  "booking.admin_cancel": "Booking cancelled (admin)",
  "trip.admin_cancel": "Trip cancelled (admin)",
};

function titleCaseSegment(s: string): string {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Human-readable label; falls back to formatted code. */
export function formatAuditAction(action: string): string {
  const known = LABELS[action];
  if (known) return known;
  if (!action?.trim()) return "—";
  const parts = action.split(".").map(titleCaseSegment);
  return parts.join(" · ");
}
