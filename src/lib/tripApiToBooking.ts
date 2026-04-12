import type { Booking, TripMode } from "@/lib/types";
import { splitTicketPrice } from "@/lib/tripPricing";

export type TripApiRow = {
  id: string;
  mode: string;
  originCity?: string;
  originName: string;
  destinationCity?: string;
  destinationName: string;
  departureAt: string;
  arrivalAt: string | null;
  priceAmount: number;
  priceCurrency: string;
  seatsAvailable?: number;
  owner: { id: string; fullName: string } | null;
  carpoolDetails: {
    carMake: string;
    carModel: string;
    carColor: string | null;
    plateNumber: string | null;
  } | null;
  busDetails: { lineName: string; busType: string | null; amenities?: Record<string, unknown> } | null;
};

function mapTripMode(m: string): TripMode {
  const u = (m || "").toUpperCase();
  if (u === "BUS") return "bus";
  if (u === "TRAIN") return "train";
  return "carpool";
}

function referenceFromTripId(id: string): string {
  const compact = id.replace(/-/g, "");
  const slice = compact.slice(0, 8).toUpperCase();
  return `TR-${slice}`;
}

function durationLabel(depIso: string, arrIso: string | null): string | undefined {
  if (!arrIso) return undefined;
  const a = new Date(arrIso).getTime();
  const d = new Date(depIso).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(d)) return undefined;
  const mins = Math.max(0, Math.round((a - d) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function trainClass(busType: string | null | undefined): "Standard" | "First" {
  const s = (busType ?? "").toLowerCase();
  return s.includes("first") ? "First" : "Standard";
}

function cityLabel(city: string | undefined, fullName: string): string {
  if (city?.trim()) return city.trim();
  const part = fullName.split("—")[0]?.trim();
  return part || fullName;
}

/** Build a checkout `Booking` from a GET /api/trips/:id row (same shape as search/trip pages). */
export function tripApiRowToBooking(t: TripApiRow): Booking {
  const mode = mapTripMode(t.mode);
  const dep = new Date(t.departureAt);
  const arr = t.arrivalAt ? new Date(t.arrivalAt) : null;
  const dateLabel = dep.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const hhmm = (d: Date) => d.toISOString().slice(11, 16);
  const currency = (t.priceCurrency === "DZD" ? "DZD" : "DZD") as "DZD";
  const { baseFare, serviceFee } = splitTicketPrice(t.priceAmount);

  const fromLabel = cityLabel(t.originCity, t.originName);
  const toLabel = cityLabel(t.destinationCity, t.destinationName);

  const providerOrDriverName =
    mode === "carpool"
      ? (t.owner?.fullName ?? "Driver")
      : (t.busDetails?.lineName?.split("·")[0]?.trim() ?? (mode === "train" ? "SNTF" : "Operator"));

  const base: Booking = {
    id: t.id,
    tripId: t.id,
    mode,
    status: mode === "carpool" ? "awaiting_approval" : "requested",
    fromLabel,
    toLabel,
    dateLabel,
    departureTime: hhmm(dep),
    arrivalTime: arr && Number.isFinite(arr.getTime()) ? hhmm(arr) : undefined,
    seatLabel:
      mode === "carpool"
        ? "Assigned after driver accepts"
        : mode === "bus"
          ? "As shown on boarding pass"
          : `${trainClass(t.busDetails?.busType)} · seat at check-in`,
    seatsCount: 1,
    baseFare: { currency, amount: baseFare },
    serviceFee: { currency, amount: serviceFee },
    totalPrice: { currency, amount: t.priceAmount },
    referenceCode: referenceFromTripId(t.id),
    providerOrDriverName,
    payment: {
      method: mode === "carpool" ? "cash" : "edahabia",
      status: mode === "carpool" ? "not_required" : "pending",
    },
    originDetail: mode !== "carpool" ? t.originName : undefined,
    destinationDetail: mode !== "carpool" ? t.destinationName : undefined,
    pickupDetail: mode === "carpool" ? t.originName : undefined,
    dropoffDetail: mode === "carpool" ? t.destinationName : undefined,
    durationLabel: durationLabel(t.departureAt, t.arrivalAt),
    vehicleLabel:
      mode === "carpool" && t.carpoolDetails
        ? `${t.carpoolDetails.carMake} ${t.carpoolDetails.carModel}${
            t.carpoolDetails.carColor ? ` • ${t.carpoolDetails.carColor}` : ""
          }${t.carpoolDetails.plateNumber ? ` • ${t.carpoolDetails.plateNumber}` : ""}`
        : undefined,
    serviceClass: mode === "train" ? trainClass(t.busDetails?.busType) : mode === "bus" ? (t.busDetails?.busType ?? "Comfort") : undefined,
    boardingPointTitle:
      mode === "carpool"
        ? "Meeting point (after driver accepts)"
        : mode === "train"
          ? "Boarding"
          : "Departure terminal",
    boardingPointBody:
      mode === "carpool"
        ? "The driver will confirm your request first. You will receive the exact pickup pin and can message the driver in the app."
        : mode === "train"
          ? "Arrive 45 minutes early for security check. Have your ID and e-ticket QR ready."
          : "Arrive at least 30 minutes before departure. Present your digital ticket at the assigned platform.",
    contextBackHref: mode === "carpool" ? `/carpool/${t.id}` : mode === "bus" ? `/bus/${t.id}` : `/train/${t.id}`,
    tripOwnerUserId: t.owner?.id ?? null,
  };

  return base;
}
