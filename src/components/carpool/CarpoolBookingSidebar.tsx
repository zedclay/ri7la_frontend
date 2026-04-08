"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Props = {
  pricePerSeat: number;
  currency: "DZD";
  seatsAvailable: number;
  instantBooking: boolean;
  /** When set, primary CTA goes to checkout instead of login (demo until trip→booking API exists). */
  checkoutHref?: string;
};

export function CarpoolBookingSidebar({
  pricePerSeat,
  currency,
  seatsAvailable,
  instantBooking,
  checkoutHref,
}: Props) {
  const [seats, setSeats] = useState(1);

  const total = useMemo(() => seats * pricePerSeat, [seats, pricePerSeat]);
  const formattedTotal = total.toLocaleString("fr-DZ");

  return (
    <div className="sticky top-28 space-y-4">
      <div className="rounded-xl border-t-4 border-primary bg-surface-container-lowest p-8 shadow-[0_24px_48px_-12px_rgba(0,83,91,0.12)]">
        <div className="mb-8 flex items-baseline justify-between">
          <span className="font-medium text-on-surface-variant">Price per seat</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-on-surface">
              {pricePerSeat.toLocaleString("fr-DZ")}
            </span>
            <span className="text-lg font-bold text-on-surface-variant">{currency}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Number of seats
            </label>
            <div className="relative">
              <select
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="h-12 w-full appearance-none rounded-lg border-none bg-surface-container-low px-4 font-bold text-on-surface focus:ring-2 focus:ring-primary"
              >
                <option value={1}>1 seat</option>
                <option value={2} disabled={seatsAvailable < 2}>
                  2 seats
                </option>
                <option value={3} disabled={seatsAvailable < 3}>
                  3 seats
                </option>
              </select>
              <MaterialIcon
                name="expand_more"
                className="pointer-events-none absolute right-3 top-3 !text-xl text-on-surface-variant"
              />
            </div>
          </div>

          {instantBooking && (
            <div className="flex items-center gap-3 rounded-lg bg-secondary-container/30 p-3">
              <MaterialIcon name="bolt" filled className="text-primary" />
              <div>
                <div className="text-xs font-bold text-on-secondary-fixed-variant">Instant Booking</div>
                <div className="text-[10px] text-on-secondary-fixed-variant/80">
                  No waiting for driver approval
                </div>
              </div>
              <MaterialIcon name="check_circle" filled className="ml-auto text-primary" />
            </div>
          )}

          <div className="space-y-4 border-t border-surface-container pt-6">
            <div className="flex items-center justify-between font-bold text-on-surface">
              <span>
                Total for {seats} seat{seats > 1 ? "s" : ""}
              </span>
              <span>
                {formattedTotal} DZD
              </span>
            </div>
            <Link
              href={checkoutHref ?? "/auth/login"}
              className="block w-full rounded-full bg-gradient-to-br from-primary to-primary-container py-4 text-center font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95"
            >
              Book now
            </Link>
            <p className="text-center text-xs font-medium text-on-surface-variant">
              Free cancellation up to 24h before
            </p>
          </div>
        </div>
      </div>

      <div
        className={
          checkoutHref
            ? "flex items-center gap-3 rounded-xl border border-primary/15 bg-primary-container/15 p-4"
            : "flex items-center gap-3 rounded-xl border border-error/10 bg-error-container/20 p-4"
        }
      >
        <MaterialIcon name="info" className={`!text-xl ${checkoutHref ? "text-primary" : "text-error"}`} />
        <p
          className={
            checkoutHref
              ? "text-xs font-medium text-on-surface"
              : "text-xs font-medium text-on-error-container"
          }
        >
          {checkoutHref
            ? "Next: passenger details, then payment. Sign in may be required at checkout."
            : "Sign in to complete your booking and earn trip credits."}
        </p>
      </div>

      <div className="rounded-xl bg-tertiary-fixed/30 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-tight text-on-tertiary-fixed">
          <MaterialIcon name="shield_with_heart" className="!text-sm" />
          Safety First
        </div>
        <p className="text-xs leading-relaxed text-on-tertiary-fixed-variant">
          Always check the vehicle plate matches the app. Travel safe with Ri7la.
        </p>
      </div>
    </div>
  );
}
