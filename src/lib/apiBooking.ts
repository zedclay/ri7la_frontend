import type { Booking, PaymentMethod, TripMode } from "@/lib/types";
import { splitTicketPrice } from "@/lib/tripPricing";

/** Shape of `presentBooking` from GET /api/bookings/mine and GET /api/bookings/:id */
export type ApiBookingRow = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  seats: number;
  totalAmount: number;
  totalCurrency: string;
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  externalReference: string | null;
  trip: {
    id: string;
    mode: string;
    status: string;
    originCity: string;
    originName: string;
    destinationCity: string;
    destinationName: string;
    departureAt: string;
    arrivalAt: string | null;
    owner: { id: string; fullName: string } | null;
    carpoolDetails: {
      carMake: string;
      carModel: string;
      carColor: string | null;
      plateNumber: string | null;
    } | null;
    busDetails: { lineName: string; busType: string | null } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

function mapTripMode(m: string): TripMode {
  const u = (m || "").toUpperCase();
  if (u === "BUS") return "bus";
  if (u === "TRAIN") return "train";
  return "carpool";
}

function referenceCodeFromApi(row: ApiBookingRow): string {
  if (row.externalReference?.trim()) return row.externalReference.trim();
  const compact = row.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `BK-${compact}`;
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

function mapApiStatus(row: ApiBookingRow, mode: TripMode): Booking["status"] {
  switch (row.status) {
    case "CONFIRMED":
      return "confirmed";
    case "CANCELLED":
      return "cancelled";
    case "COMPLETED":
      return "completed";
    case "PENDING":
    default:
      return mode === "carpool" ? "awaiting_approval" : "requested";
  }
}

function mapPayment(
  paymentStatus: ApiBookingRow["paymentStatus"]
): { method: PaymentMethod; status: Booking["payment"]["status"] } {
  if (paymentStatus === "PAID") {
    return { method: "edahabia", status: "captured" };
  }
  return { method: "edahabia", status: "pending" };
}

export function apiBookingRowToBooking(row: ApiBookingRow): Booking {
  const trip = row.trip;
  if (!trip) {
    throw new Error("Booking has no trip");
  }
  const mode = mapTripMode(trip.mode);
  const dep = new Date(trip.departureAt);
  const arr = trip.arrivalAt ? new Date(trip.arrivalAt) : null;
  const dateLabel = dep.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const hhmm = (d: Date) => d.toISOString().slice(11, 16);
  const currency = (row.totalCurrency === "DZD" ? "DZD" : "DZD") as "DZD";
  const { baseFare, serviceFee } = splitTicketPrice(row.totalAmount);

  const fromLabel = trip.originCity?.trim() || trip.originName.split("—")[0]?.trim() || trip.originName;
  const toLabel = trip.destinationCity?.trim() || trip.destinationName.split("—")[0]?.trim() || trip.destinationName;

  const providerOrDriverName =
    mode === "carpool"
      ? (trip.owner?.fullName ?? "Driver")
      : (trip.busDetails?.lineName?.split("·")[0]?.trim() ?? (mode === "train" ? "SNTF" : "Operator"));

  const pay = mapPayment(row.paymentStatus);

  const booking: Booking = {
    id: row.id,
    tripId: trip.id,
    mode,
    status: mapApiStatus(row, mode),
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
          : `${trip.busDetails?.busType?.includes("First") ? "First" : "Standard"} · at check-in`,
    seatsCount: row.seats,
    baseFare: { currency, amount: baseFare },
    serviceFee: { currency, amount: serviceFee },
    totalPrice: { currency, amount: row.totalAmount },
    referenceCode: referenceCodeFromApi(row),
    providerOrDriverName,
    payment: pay,
    originDetail: mode !== "carpool" ? trip.originName : undefined,
    destinationDetail: mode !== "carpool" ? trip.destinationName : undefined,
    pickupDetail: mode === "carpool" ? trip.originName : undefined,
    dropoffDetail: mode === "carpool" ? trip.destinationName : undefined,
    durationLabel: durationLabel(trip.departureAt, trip.arrivalAt),
    vehicleLabel:
      mode === "carpool" && trip.carpoolDetails
        ? `${trip.carpoolDetails.carMake} ${trip.carpoolDetails.carModel}${
            trip.carpoolDetails.carColor ? ` • ${trip.carpoolDetails.carColor}` : ""
          }${trip.carpoolDetails.plateNumber ? ` • ${trip.carpoolDetails.plateNumber}` : ""}`
        : undefined,
    serviceClass:
      mode === "train"
        ? trip.busDetails?.busType?.toLowerCase().includes("first")
          ? "First"
          : "Standard"
        : mode === "bus"
          ? trip.busDetails?.busType ?? "Comfort"
          : undefined,
    contextBackHref: mode === "carpool" ? `/carpool/${trip.id}` : mode === "bus" ? `/bus/${trip.id}` : `/train/${trip.id}`,
  };

  return booking;
}
