"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getAccessToken } from "@/lib/auth";
import { fetchUserMeClientCached } from "@/lib/userMeClientCache";
import { useIsTripOwner } from "@/lib/useIsTripOwner";

type Props = {
  pricePerSeat: number;
  currency: "DZD";
  seatsAvailable: number;
  instantBooking: boolean;
  /** When set, primary CTA goes to checkout instead of login (demo until trip→booking API exists). */
  checkoutHref?: string;
  /** Trip owner user id — when it matches the logged-in user, booking UI is hidden. */
  tripOwnerUserId?: string | null;
};

export function CarpoolBookingSidebar({
  pricePerSeat,
  currency,
  seatsAvailable,
  instantBooking,
  checkoutHref,
  tripOwnerUserId,
}: Props) {
  const t = useTranslations("common");
  const isOwner = useIsTripOwner(tripOwnerUserId);
  const [seats, setSeats] = useState(1);
  const [passengerNeedsIdentity, setPassengerNeedsIdentity] = useState(false);

  useEffect(() => {
    const tok = getAccessToken();
    if (!tok || !checkoutHref) {
      setPassengerNeedsIdentity(false);
      return;
    }
    let cancelled = false;
    void fetchUserMeClientCached()
      .then((me) => {
        if (cancelled || !me) return;
        if (!me.roles.includes("PASSENGER")) {
          setPassengerNeedsIdentity(false);
          return;
        }
        const ok = me.passengerVerification?.identityVerified === true;
        setPassengerNeedsIdentity(!ok);
      })
      .catch(() => {
        if (!cancelled) setPassengerNeedsIdentity(false);
      });
    return () => {
      cancelled = true;
    };
  }, [checkoutHref]);

  const effectiveCheckoutHref =
    checkoutHref && passengerNeedsIdentity ? undefined : checkoutHref;
  const bookBlocked = Boolean(checkoutHref && passengerNeedsIdentity);

  const total = useMemo(() => seats * pricePerSeat, [seats, pricePerSeat]);
  const formattedTotal = total.toLocaleString("fr-DZ");

  if (tripOwnerUserId && isOwner === "pending") {
    return (
      <div className="sticky top-28 rounded-xl border-t-4 border-primary bg-surface-container-lowest p-8 shadow-[0_24px_48px_-12px_rgba(0,83,91,0.12)]">
        <div className="flex min-h-[120px] items-center justify-center text-sm font-medium text-on-surface-variant">
          <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isOwner === true) {
    return (
      <div className="sticky top-28 space-y-4">
        <div className="rounded-xl border-t-4 border-secondary-container bg-surface-container-lowest p-8 shadow-[0_24px_48px_-12px_rgba(0,83,91,0.12)]">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <MaterialIcon name="badge" className="!text-2xl" />
            <span className="text-xs font-bold uppercase tracking-widest">{t("ownTripDriverTitle")}</span>
          </div>
          <p className="text-sm leading-relaxed text-on-surface-variant">{t("ownTripDriverBody")}</p>
          <div className="mt-6 space-y-3">
            <Link
              href="/driver/trips"
              className="block w-full rounded-full bg-primary py-4 text-center text-sm font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95"
            >
              {t("ownTripDriverManage")}
            </Link>
            <Link
              href="/driver/requests"
              className="block w-full rounded-full border-2 border-primary bg-transparent py-3 text-center text-sm font-bold text-primary active:scale-95"
            >
              {t("ownTripDriverRequests")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            {bookBlocked ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-error/20 bg-error-container/15 px-4 py-3 text-center text-xs font-semibold text-on-surface">
                  {t("bookingNeedsIdentity")}
                </div>
                <Link
                  href="/passenger/profile"
                  className="block w-full rounded-full border-2 border-primary bg-surface-container-lowest py-4 text-center font-bold text-primary shadow-sm transition-all hover:bg-primary-container/10 active:scale-95"
                >
                  {t("uploadIdentityToBook")}
                </Link>
              </div>
            ) : (
              <Link
                href={effectiveCheckoutHref ?? "/auth/login"}
                className="block w-full rounded-full bg-gradient-to-br from-primary to-primary-container py-4 text-center font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-95"
              >
                Book now
              </Link>
            )}
            <p className="text-center text-xs font-medium text-on-surface-variant">
              Free cancellation up to 24h before
            </p>
          </div>
        </div>
      </div>

      <div
        className={
          effectiveCheckoutHref || bookBlocked
            ? "flex items-center gap-3 rounded-xl border border-primary/15 bg-primary-container/15 p-4"
            : "flex items-center gap-3 rounded-xl border border-error/10 bg-error-container/20 p-4"
        }
      >
        <MaterialIcon
          name="info"
          className={`!text-xl ${effectiveCheckoutHref || bookBlocked ? "text-primary" : "text-error"}`}
        />
        <p
          className={
            effectiveCheckoutHref || bookBlocked
              ? "text-xs font-medium text-on-surface"
              : "text-xs font-medium text-on-error-container"
          }
        >
          {bookBlocked
            ? t("bookingNeedsIdentityHint")
            : effectiveCheckoutHref
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
