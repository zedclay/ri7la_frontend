import { mockBookings } from "@/lib/mockData";
import { allowDemoMocks } from "@/lib/runtimeEnv";
import type { Booking } from "@/lib/types";
import { tripApiRowToBooking, type TripApiRow } from "@/lib/tripApiToBooking";
import { unwrapApiSuccess } from "@/lib/unwrapApi";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
}

/**
 * Resolve checkout booking: mock rows by id, otherwise treat `bookingId` as a trip id from the API.
 */
export async function loadCheckoutBooking(bookingId: string): Promise<Booking | null> {
  if (allowDemoMocks()) {
    const mock = mockBookings.find((b) => b.id === bookingId);
    if (mock) return mock;
  }

  try {
    const res = await fetch(`${apiBase()}/api/trips/${encodeURIComponent(bookingId)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const trip = unwrapApiSuccess<TripApiRow>(json);
    if (!trip?.id || typeof trip.mode !== "string") return null;
    return tripApiRowToBooking(trip);
  } catch {
    return null;
  }
}
