import type { Booking, PaymentMethod, TripMode } from "@/lib/types";
import type { PassengerCheckoutDraft, PaymentCheckoutDraft } from "@/lib/checkoutStorage";

export const CONFIRMED_BOOKING_KEY_PREFIX = "ri7la_confirmed_booking_";
export const COMPLETED_BOOKING_IDS_KEY = "ri7la_completed_booking_ids";

export type ConfirmedBookingSnapshot = {
  version: 1;
  bookingId: string;
  confirmedAt: string;
  ticketToken: string;
  booking: {
    mode: TripMode;
    referenceCode: string;
    fromLabel: string;
    toLabel: string;
    dateLabel: string;
    departureTime: string;
    arrivalTime?: string;
    seatLabel?: string;
    seatsCount: number;
    providerOrDriverName: string;
    originDetail?: string;
    destinationDetail?: string;
    pickupDetail?: string;
    dropoffDetail?: string;
    durationLabel?: string;
    vehicleLabel?: string;
    serviceClass?: string;
    boardingPointTitle?: string;
    boardingPointBody?: string;
  };
  passenger: PassengerCheckoutDraft;
  payment: { method: PaymentMethod; status: "captured" | "not_required" };
  pricing: { base: number; fee: number; total: number; currency: string };
};

function snapshotKey(bookingId: string) {
  return `${CONFIRMED_BOOKING_KEY_PREFIX}${bookingId}`;
}

function randomToken(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();
    }
  } catch {
    /* ignore */
  }
  return `TK${Date.now().toString(36).toUpperCase()}`;
}

export function buildConfirmedSnapshot(
  bookingId: string,
  booking: Booking,
  passenger: PassengerCheckoutDraft,
  payment: PaymentCheckoutDraft,
  pricing: { base: number; fee: number; total: number; currency: string }
): ConfirmedBookingSnapshot {
  const payStatus: "captured" | "not_required" =
    booking.mode === "carpool" && payment.method === "cash" ? "not_required" : "captured";

  return {
    version: 1,
    bookingId,
    confirmedAt: new Date().toISOString(),
    ticketToken: randomToken(),
    booking: {
      mode: booking.mode,
      referenceCode: booking.referenceCode,
      fromLabel: booking.fromLabel,
      toLabel: booking.toLabel,
      dateLabel: booking.dateLabel,
      departureTime: booking.departureTime,
      arrivalTime: booking.arrivalTime,
      seatLabel: booking.seatLabel,
      seatsCount: booking.seatsCount,
      providerOrDriverName: booking.providerOrDriverName,
      originDetail: booking.originDetail,
      destinationDetail: booking.destinationDetail,
      pickupDetail: booking.pickupDetail,
      dropoffDetail: booking.dropoffDetail,
      durationLabel: booking.durationLabel,
      vehicleLabel: booking.vehicleLabel,
      serviceClass: booking.serviceClass,
      boardingPointTitle: booking.boardingPointTitle,
      boardingPointBody: booking.boardingPointBody,
    },
    passenger,
    payment: { method: payment.method, status: payStatus },
    pricing,
  };
}

export function saveConfirmedSnapshot(snapshot: ConfirmedBookingSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(snapshotKey(snapshot.bookingId), JSON.stringify(snapshot));
    const raw = sessionStorage.getItem(COMPLETED_BOOKING_IDS_KEY);
    let ids: string[] = [];
    try {
      ids = raw ? (JSON.parse(raw) as string[]) : [];
      if (!Array.isArray(ids)) ids = [];
    } catch {
      ids = [];
    }
    const next = [snapshot.bookingId, ...ids.filter((x) => x !== snapshot.bookingId)];
    sessionStorage.setItem(COMPLETED_BOOKING_IDS_KEY, JSON.stringify(next.slice(0, 80)));
  } catch {
    /* ignore */
  }
}

export function loadConfirmedSnapshot(bookingId: string): ConfirmedBookingSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(snapshotKey(bookingId));
    if (!raw) return null;
    const j = JSON.parse(raw) as ConfirmedBookingSnapshot;
    if (j?.version !== 1 || typeof j.bookingId !== "string" || !j.booking || !j.passenger || !j.pricing) {
      return null;
    }
    return j;
  } catch {
    return null;
  }
}

export function loadCompletedBookingIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(COMPLETED_BOOKING_IDS_KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw) as unknown;
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Merge server/mock booking row with latest checkout confirmation (totals, payment state). */
export function applySnapshotToBooking(b: Booking, s: ConfirmedBookingSnapshot): Booking {
  return {
    ...b,
    status: "confirmed",
    totalPrice: { currency: "DZD", amount: s.pricing.total },
    payment: { method: s.payment.method, status: s.payment.status === "not_required" ? "not_required" : "captured" },
  };
}
