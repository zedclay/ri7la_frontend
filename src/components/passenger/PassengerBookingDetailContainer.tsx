"use client";

import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PassengerBookingDetailClient } from "@/components/passenger/PassengerBookingDetailClient";
import { apiGetJsonData } from "@/lib/api";
import { apiBookingRowToBooking, type ApiBookingRow } from "@/lib/apiBooking";
import { mockBookings } from "@/lib/mockData";
import { allowDemoMocks } from "@/lib/runtimeEnv";
import type { Booking } from "@/lib/types";
import { getAccessToken } from "@/lib/auth";

type Props = { bookingId: string };

export function PassengerBookingDetailContainer({ bookingId }: Props) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        try {
          if (getAccessToken()) {
            const row = await apiGetJsonData<ApiBookingRow>(`/api/bookings/${encodeURIComponent(bookingId)}`);
            if (!cancelled) setBooking(apiBookingRowToBooking(row));
            return;
          }
        } catch {
          /* optional demo fallback below */
        }

        if (allowDemoMocks()) {
          const mock = mockBookings.find((b) => b.id === bookingId) ?? null;
          if (!cancelled) setBooking(mock);
          return;
        }

        if (!cancelled) setBooking(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-on-surface-variant">
        <span className="inline-block animate-spin">
          <MaterialIcon name="sync" className="!text-4xl text-primary" />
        </span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-6 py-16 text-center">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Booking not found</h1>
        <p className="text-sm text-on-surface-variant">
          This reference does not match any booking. Sign in with the account you used to book, or open a booking from My bookings.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/15"
          >
            Sign in
          </Link>
          <Link
            href="/passenger/bookings"
            className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-bold text-on-surface"
          >
            My bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            My bookings <span className="mx-2 text-outline">›</span> Details
          </div>
          <h1 className="mt-2 font-headline text-3xl font-extrabold text-on-surface">
            Booking detail:{" "}
            <span className="text-primary-container">{booking.referenceCode}</span>
          </h1>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed/40 px-4 py-2 text-xs font-bold text-on-primary-fixed-variant">
          <MaterialIcon name="verified" filled className="!text-lg" />
          {booking.status === "confirmed" ? "CONFIRMED" : booking.status.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      <PassengerBookingDetailClient bookingId={bookingId} booking={booking} />
    </div>
  );
}
