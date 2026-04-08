"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { busCoverImage } from "@/lib/coverImages";
import { splitTicketPrice } from "@/lib/tripPricing";
import { unwrapApiSuccess } from "@/lib/unwrapApi";

const MAP_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4QJbl2WB3EvJStVI7ImvvHPulYUE7zWbIzfz_ZT8hXW5dLMZGRjDGssUFxSssdeFqswnxTDPmbI0QsGzZy4b52_lHC9l_7530GvzSFU2yhO8w3Liw7ULXKYv8tpQ1Da3u9K0hgchvzTF1rFMz8wSXvCnUETRkmEL2MSMwdIqnwqhOx0YpwNYkuE6XrUmSfBvGAlSlqQs3AbrH-dEiD555A-iw_NCWBb_FuDdSBpFCKTqLYZgHMtK8C3j_S7ZV-YcOBjIWdYxS5y9E";

const LEFT_SEATS = ["1A", "1B", "2A", "2B", "3A", "3B"] as const;
const RIGHT_SEATS = ["1C", "1D", "2C", "2D", "3C", "3D"] as const;
const UNAVAILABLE = new Set<string>(["1A", "2D"]);

type ApiTrip = {
  id: string;
  mode: string;
  originName: string;
  destinationName: string;
  departureAt: string;
  arrivalAt: string | null;
  priceAmount: number;
  coverImageUrl?: string | null;
  busDetails?: { lineName: string; busType: string | null; amenities?: Record<string, unknown> } | null;
};

function formatDurationMs(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h Duration`;
  return `${h}h ${m}m Duration`;
}

export function BusTripDetailView({ departureId }: { departureId: string }) {
  const [trip, setTrip] = useState<ApiTrip | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<string>("2A");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setLoadError(null);
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
        const res = await fetch(`${base}/api/trips/${departureId}`, { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) {
            setTrip(null);
            setLoadError("This bus trip could not be loaded.");
          }
          return;
        }
        const raw = (await res.json()) as unknown;
        const data = unwrapApiSuccess<ApiTrip>(raw);
        if (cancelled) return;
        if (data.mode !== "BUS") {
          setTrip(null);
          setLoadError("This page is only for bus departures.");
          return;
        }
        setTrip(data);
      } catch {
        if (!cancelled) {
          setTrip(null);
          setLoadError("Network error while loading the trip.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [departureId]);

  const { baseFare, serviceFee } = useMemo(
    () => (trip ? splitTicketPrice(trip.priceAmount) : { baseFare: 0, serviceFee: 0 }),
    [trip]
  );
  const total = baseFare + serviceFee;

  const depTime = trip ? new Date(trip.departureAt).toISOString().slice(11, 16) : "";
  const arrTime =
    trip?.arrivalAt && Number.isFinite(new Date(trip.arrivalAt).getTime())
      ? new Date(trip.arrivalAt).toISOString().slice(11, 16)
      : "—";
  const dateLabel = trip
    ? new Date(trip.departureAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const durationLabel =
    trip?.arrivalAt && Number.isFinite(new Date(trip.arrivalAt).getTime())
      ? formatDurationMs(new Date(trip.arrivalAt).getTime() - new Date(trip.departureAt).getTime())
      : "—";
  const providerName = trip?.busDetails?.lineName?.split("·")[0]?.trim() ?? "Bus operator";
  const classLabel = trip?.busDetails?.busType ?? "Comfort";
  const coverSrc = trip?.coverImageUrl?.trim() || busCoverImage();
  const amenities = trip?.busDetails?.amenities ?? {};
  const showWifi = amenities.wifi === true;
  const showUsb = amenities.usb === true;
  const showWc = amenities.wc === true;

  function handleSeatClick(id: string) {
    if (UNAVAILABLE.has(id)) return;
    setSelectedSeat(id);
  }

  function renderSeatButton(id: string) {
    const unavailable = UNAVAILABLE.has(id);
    const selected = selectedSeat === id && !unavailable;

    if (unavailable) {
      return (
        <button
          key={id}
          type="button"
          disabled
          className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg bg-surface-dim"
        >
          <MaterialIcon name="close" className="!text-xs text-white" />
        </button>
      );
    }

    return (
      <button
        key={id}
        type="button"
        onClick={() => handleSeatClick(id)}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
          selected
            ? "border-primary bg-primary text-white"
            : "border-outline-variant bg-white text-on-surface-variant hover:border-primary"
        }`}
      >
        {id}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-on-surface-variant">
        <span className="inline-block animate-spin">
          <MaterialIcon name="sync" className="!text-4xl text-primary" />
        </span>
      </div>
    );
  }

  if (loadError || !trip) {
    return (
      <div className="rounded-xl bg-error-container px-6 py-5 text-sm font-semibold text-on-error-container">
        {loadError ?? "Trip not found."}
      </div>
    );
  }

  const amenityList: { icon: string; label: string }[] = [
    ...(showWifi ? [{ icon: "wifi", label: "Wifi" } as const] : []),
    { icon: "ac_unit", label: "AC" },
    ...(showUsb ? [{ icon: "power", label: "USB" } as const] : [{ icon: "power", label: "Power" } as const]),
    ...(showWc ? [{ icon: "wc", label: "WC" } as const] : []),
  ];

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section className="relative h-48 overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest">
          <Image src={coverSrc} alt="Bus" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-on-surface">
            <MaterialIcon name="directions_bus" className="!text-sm text-primary" />
            Bus
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-primary-container px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-on-primary-container">
                  Bus Trip
                </span>
                <span className="text-sm font-medium text-on-surface-variant">{dateLabel}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">{depTime}</h2>
                  <p className="text-sm text-on-surface-variant">{trip.originName}</p>
                </div>
                <div className="flex flex-1 flex-col items-center px-4">
                  <span className="mb-1 font-body text-xs text-outline">{durationLabel}</span>
                  <div className="relative h-px w-full bg-outline-variant">
                    <span className="absolute -top-1 left-0 h-2 w-2 rounded-full bg-primary" />
                    <span className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-primary" />
                    <MaterialIcon
                      name="directions_bus"
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container-lowest px-2 !text-xl text-primary"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="font-headline text-2xl font-bold text-on-surface">{arrTime}</h2>
                  <p className="text-sm text-on-surface-variant">{trip.destinationName}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-outline-variant/20 bg-surface-container-lowest">
                <MaterialIcon name="airport_shuttle" className="!text-3xl text-primary" />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">{providerName}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center text-tertiary-container">
                    <MaterialIcon name="star" filled className="!text-sm" />
                    <span className="ml-1 text-sm font-bold">4.5</span>
                  </div>
                  <span className="text-xs text-outline">•</span>
                  <span className="text-sm font-medium text-on-surface-variant">{classLabel} Class</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              {amenityList.map((a) => (
                <div key={a.label} className="flex flex-col items-center gap-1">
                  <MaterialIcon name={a.icon} className="!text-xl text-outline" />
                  <span className="font-body text-[10px] uppercase">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-8">
          <h3 className="mb-6 font-headline text-xl font-bold text-on-surface">Select Your Seat</h3>
          <div className="flex flex-col items-center justify-center gap-12 md:flex-row">
            <div className="relative w-full max-w-[320px] rounded-3xl border-4 border-surface-container-high bg-surface-container-low p-6">
              <div className="mb-8 flex justify-end border-b border-outline-variant/30 pb-4">
                <MaterialIcon
                  name="airline_seat_recline_extra"
                  className="rotate-90 text-on-surface-variant"
                />
              </div>
              <div className="grid grid-cols-5 gap-y-4">
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  {LEFT_SEATS.map((id) => renderSeatButton(id))}
                </div>
                <div className="col-span-1 flex flex-col items-center justify-center pt-4 font-body text-[10px] uppercase tracking-widest text-outline">
                  <div className="h-full w-px border-l border-dashed border-outline-variant/20" />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  {RIGHT_SEATS.map((id) => renderSeatButton(id))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded border border-outline-variant bg-white" />
                <span className="text-sm font-medium text-on-surface">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded bg-primary" />
                <span className="text-sm font-medium text-on-surface">Selected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-6 rounded bg-surface-dim" />
                <span className="text-sm font-medium text-on-surface">Unavailable</span>
              </div>
              <div className="mt-8 border-t border-outline-variant/20 pt-8">
                <p className="text-xs leading-relaxed text-on-surface-variant">
                  Seats are assigned upon selection. Your current selection is{" "}
                  <span className="font-bold text-primary">Seat {selectedSeat}</span>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <h4 className="mb-4 flex items-center gap-2 font-headline font-bold text-on-surface">
              <MaterialIcon name="location_on" className="!text-xl text-primary" />
              Boarding Point
            </h4>
            <p className="text-sm font-bold text-on-surface">{trip.originName}</p>
            <p className="mb-4 text-sm text-on-surface-variant">Boarding at the departure terminal above.</p>
            <div className="relative h-32 overflow-hidden rounded-lg bg-surface-container">
              <Image
                src={MAP_IMG}
                alt="Map near boarding point"
                fill
                className="object-cover opacity-50 grayscale"
                sizes="400px"
              />
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6">
            <h4 className="mb-4 flex items-center gap-2 font-headline font-bold text-on-surface">
              <MaterialIcon name="luggage" className="!text-xl text-primary" />
              Luggage Policy
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MaterialIcon name="check_circle" className="!text-lg text-primary" />
                <div>
                  <span className="font-bold text-on-surface">2 Checked Bags</span>
                  <p className="text-xs text-outline">Up to 23kg total per passenger</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MaterialIcon name="check_circle" className="!text-lg text-primary" />
                <div>
                  <span className="font-bold text-on-surface">1 Hand Carry</span>
                  <p className="text-xs text-outline">Must fit in overhead compartment</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant/15 bg-surface-container-low p-8">
          <h3 className="mb-6 font-headline text-xl font-bold text-on-surface">Terms & Conditions</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <MaterialIcon name="assignment_return" className="mb-2 !text-2xl text-primary" />
              <h5 className="mb-1 text-sm font-bold text-on-surface">Cancellation</h5>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                100% refund available up to 24h before departure. 50% refund between 24h-12h.
              </p>
            </div>
            <div>
              <MaterialIcon name="schedule" className="mb-2 !text-2xl text-primary" />
              <h5 className="mb-1 text-sm font-bold text-on-surface">Boarding</h5>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                Boarding starts 30 minutes before departure. Gates close 5 minutes before start.
              </p>
            </div>
            <div>
              <MaterialIcon name="badge" className="mb-2 !text-2xl text-primary" />
              <h5 className="mb-1 text-sm font-bold text-on-surface">ID Requirement</h5>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                Original National ID or Passport is mandatory for all passengers to board.
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-24">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-lg shadow-[#00535b]/5">
          <h3 className="mb-6 font-headline text-lg font-bold text-on-surface">Booking Summary</h3>
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/10 py-3">
              <span className="text-sm text-on-surface-variant">Selected Seat</span>
              <span className="rounded-full bg-primary-container/10 px-3 py-1 text-sm font-bold text-primary">
                {selectedSeat}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-outline-variant/10 py-3">
              <span className="text-sm text-on-surface-variant">Passengers</span>
              <span className="text-sm font-bold text-on-surface">1 Adult</span>
            </div>
            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Base Fare</span>
                <span className="font-medium text-on-surface">
                  {baseFare.toLocaleString("fr-DZ")} DZD
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Service Fee</span>
                <span className="font-medium text-on-surface">
                  {serviceFee.toLocaleString("fr-DZ")} DZD
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-outline-variant/20 pt-4 text-lg font-bold text-on-surface">
                <span>Total Price</span>
                <span className="text-primary">{total.toLocaleString("fr-DZ")} DZD</span>
              </div>
            </div>
          </div>
          <Link
            href={`/passenger/checkout/${departureId}/details`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container py-4 font-bold text-on-primary shadow-md transition-all active:scale-95 group"
          >
            Continue to Checkout
            <MaterialIcon
              name="arrow_forward"
              className="!text-xl transition-transform group-hover:translate-x-1"
            />
          </Link>
          <p className="mt-4 text-center font-body text-[10px] uppercase tracking-widest text-outline">
            Secure Payment Processing
          </p>
        </div>

        <div className="rounded-xl border border-secondary-container/50 bg-secondary-container/30 p-6">
          <div className="flex items-start gap-4">
            <MaterialIcon name="support_agent" className="!text-2xl text-secondary" />
            <div>
              <h4 className="font-headline text-sm font-bold text-on-secondary-container">
                Need help?
              </h4>
              <p className="mt-1 text-xs text-on-secondary-container/80">
                Our concierge is available 24/7 for booking assistance.
              </p>
              <Link
                href="/help"
                className="mt-3 text-xs font-bold text-primary underline underline-offset-4"
              >
                Chat with Support
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
