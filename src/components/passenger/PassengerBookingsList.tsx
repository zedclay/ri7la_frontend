"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { applySnapshotToBooking, loadCompletedBookingIds, loadConfirmedSnapshot } from "@/lib/confirmedBooking";
import { downloadTicketPdf } from "@/lib/ticketDocument";
import type { Booking } from "@/lib/types";
import { getAccessToken } from "@/lib/auth";
import { apiGetJsonData } from "@/lib/api";
import { apiBookingRowToBooking, type ApiBookingRow } from "@/lib/apiBooking";

function statusPill(status: string) {
  if (status === "confirmed") return "bg-primary-fixed/40 text-on-primary-fixed-variant";
  if (status === "awaiting_approval") return "bg-tertiary-fixed/60 text-on-tertiary-fixed";
  if (status === "completed") return "bg-secondary-container/60 text-on-secondary-fixed-variant";
  if (status === "cancelled") return "bg-error-container text-on-error-container";
  return "bg-surface-container-high text-on-surface-variant";
}

function statusLabel(status: string) {
  if (status === "awaiting_approval") return "Awaiting approval";
  if (status === "requested") return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function modeLabel(b: Booking) {
  if (b.mode === "bus") return "Bus";
  if (b.mode === "train") return "Train";
  return "Carpool";
}

function snapshotTicketTripIds(): Set<string> {
  const ids = loadCompletedBookingIds();
  const set = new Set<string>();
  for (const id of ids) {
    const s = loadConfirmedSnapshot(id);
    if (s) set.add(s.bookingId);
  }
  return set;
}

function mergeSnapshotsInto(rows: Booking[]): Booking[] {
  const ids = loadCompletedBookingIds();
  const byTrip = new Map<string, NonNullable<ReturnType<typeof loadConfirmedSnapshot>>>();
  for (const id of ids) {
    const s = loadConfirmedSnapshot(id);
    if (s) byTrip.set(s.bookingId, s);
  }
  return rows.map((b) => {
    const key = b.tripId ?? b.id;
    const s = byTrip.get(key);
    return s ? applySnapshotToBooking(b, s) : b;
  });
}

type Props = { initialBookings?: Booking[] };

function canMessageDriverOnBooking(b: Booking) {
  return (
    b.mode === "carpool" &&
    (b.status === "requested" || b.status === "awaiting_approval" || b.status === "confirmed")
  );
}

export function PassengerBookingsList({ initialBookings = [] }: Props) {
  const tMsg = useTranslations("messaging");
  const [rows, setRows] = useState<Booking[]>(initialBookings);
  const [ticketTripIds, setTicketTripIds] = useState<Set<string>>(() => snapshotTicketTripIds());
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshSnapshots = useCallback((list: Booking[]) => {
    setTicketTripIds(snapshotTicketTripIds());
    setRows(mergeSnapshotsInto(list));
  }, []);

  const loadFromApi = useCallback(async () => {
    setLoadError(null);
    if (!getAccessToken()) {
      setAuthRequired(true);
      setRows([]);
      setLoading(false);
      return;
    }
    setAuthRequired(false);
    try {
      const list = await apiGetJsonData<ApiBookingRow[]>("/api/bookings/mine");
      const mapped = list.map(apiBookingRowToBooking);
      refreshSnapshots(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load bookings.";
      setLoadError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [refreshSnapshots]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      await loadFromApi();
      if (cancelled) return;
    }
    void run();
    function onAuth() {
      void loadFromApi();
    }
    window.addEventListener("ri7la_auth", onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener("ri7la_auth", onAuth);
    };
  }, [loadFromApi]);

  function handleDownload(e: React.MouseEvent, b: Booking) {
    e.preventDefault();
    const key = b.tripId ?? b.id;
    const s = loadConfirmedSnapshot(key);
    if (s) void downloadTicketPdf(s).catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-on-surface-variant">
        <span className="inline-block animate-spin">
          <MaterialIcon name="sync" className="!text-4xl text-primary" />
        </span>
      </div>
    );
  }

  if (authRequired) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-10 text-center shadow-sm">
        <MaterialIcon name="login" className="mx-auto !text-5xl text-primary" />
        <h2 className="mt-4 font-headline text-xl font-extrabold text-on-surface">Sign in to see your bookings</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Your reservations are loaded from your Ri7la account after you sign in.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/15"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl bg-error-container/30 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-on-error-container">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void loadFromApi();
          }}
          className="mt-4 text-sm font-bold text-primary underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-10 text-center shadow-sm">
        <MaterialIcon name="event_available" className="mx-auto !text-5xl text-on-surface-variant" />
        <h2 className="mt-4 font-headline text-xl font-extrabold text-on-surface">No bookings yet</h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Search for a trip and book a seat — your trips will appear here.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/15"
        >
          Search trips
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((b) => {
        const tripKey = b.tripId ?? b.id;
        const hasTicket = ticketTripIds.has(tripKey);
        return (
          <div key={b.id} className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
            <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-surface-container-low md:h-24 md:w-64">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/10" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-primary-container">
                  <MaterialIcon
                    name={b.mode === "bus" ? "directions_bus" : b.mode === "train" ? "train" : "directions_car"}
                    className="!text-sm"
                  />
                  {modeLabel(b)}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <div className="text-sm font-extrabold text-on-surface">
                    {b.fromLabel} <span className="mx-1 text-outline">→</span> {b.toLabel}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusPill(b.status)}`}>
                    {statusLabel(b.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</div>
                    <div className="mt-1 text-sm font-bold text-on-surface">{b.dateLabel}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Departure</div>
                    <div className="mt-1 text-sm font-bold text-on-surface">{b.departureTime}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Reference</div>
                    <div className="mt-1 text-sm font-extrabold text-primary-container">{b.referenceCode}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {b.mode === "carpool" ? "Mode" : "Seat"}
                    </div>
                    <div className="mt-1 text-sm font-bold text-on-surface">
                      {b.mode === "carpool" ? "Carpool" : (b.seatLabel ?? "—")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Total</div>
                    <div className="mt-1 text-sm font-extrabold text-on-surface">
                      {b.totalPrice.amount.toLocaleString("fr-DZ")} {b.totalPrice.currency}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                {hasTicket ? (
                  <button
                    type="button"
                    onClick={(e) => handleDownload(e, b)}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-5 py-2.5 text-xs font-bold text-on-surface active:scale-95"
                  >
                    <MaterialIcon name="download" className="!text-lg" />
                    Download ticket
                  </button>
                ) : null}
                {canMessageDriverOnBooking(b) ? (
                  <Link
                    href={`/passenger/messages?booking=${encodeURIComponent(b.id)}`}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary-container/15 px-5 py-2.5 text-xs font-extrabold text-primary-container active:scale-95"
                  >
                    <MaterialIcon name="chat" className="!text-lg" />
                    {tMsg("ctaMessageDriver")}
                  </Link>
                ) : null}
                <Link
                  href={`/passenger/bookings/${b.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
                >
                  View details
                  <MaterialIcon name="arrow_forward" className="!text-lg" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
