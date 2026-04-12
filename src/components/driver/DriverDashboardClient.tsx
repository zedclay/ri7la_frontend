"use client";

import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { getPlaceByCityKey, placePrimaryLabel } from "@/lib/algeriaPlaces";
import { DriverDashboardVerificationCard } from "@/components/driver/DriverDashboardVerificationCard";

type TripRow = {
  id: string;
  mode: "CARPOOL" | "BUS" | "TRAIN";
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
  originCity: string;
  originName: string;
  destinationCity: string;
  destinationName: string;
  departureAt: string;
};

type DriverBookingRow = {
  id: string;
  status: string;
  seats: number;
  totalAmount: number;
  totalCurrency: string;
  paymentStatus?: string;
  passenger: {
    id: string;
    fullName: string;
    email?: string | null;
    phoneE164?: string | null;
    phoneVerified?: boolean;
  } | null;
  trip: {
    id: string;
    originCity: string;
    originName: string;
    destinationCity: string;
    destinationName: string;
    departureAt: string;
    allowInstantBooking: boolean;
  } | null;
};

type MeRow = { fullName: string };

function labelOriginDest(
  originCity: string,
  originName: string,
  destinationCity: string,
  destinationName: string,
  locale: string
) {
  const o = getPlaceByCityKey(originCity);
  const d = getPlaceByCityKey(destinationCity);
  const from = o ? placePrimaryLabel(o, locale) : originName || originCity;
  const to = d ? placePrimaryLabel(d, locale) : destinationName || destinationCity;
  return { from, to };
}

function formatMoney(amount: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency === "DZD" ? "DZD" : currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

export function DriverDashboardClient() {
  const t = useTranslations("driverProfile");
  const tMsg = useTranslations("messaging");
  const locale = useLocale();
  const [me, setMe] = useState<MeRow | null>(null);
  const [trips, setTrips] = useState<TripRow[] | null>(null);
  const [bookingsPayload, setBookingsPayload] = useState<{
    items: DriverBookingRow[];
    pendingCount: number;
    weekConfirmedTotalDzd: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setMe(null);
      setTrips([]);
      setBookingsPayload({ items: [], pendingCount: 0, weekConfirmedTotalDzd: 0 });
      return;
    }
    setError(null);
    try {
      const [u, tr, bk] = await Promise.all([
        apiGetJsonData<MeRow>("/api/users/me"),
        apiGetJsonData<{ items: TripRow[] }>("/api/trips/mine"),
        apiGetJsonData<{
          items: DriverBookingRow[];
          pendingCount: number;
          weekConfirmedTotalDzd: number;
        }>("/api/drivers/me/bookings"),
      ]);
      setMe(u);
      setTrips(tr.items ?? []);
      setBookingsPayload({
        items: bk.items ?? [],
        pendingCount: bk.pendingCount ?? 0,
        weekConfirmedTotalDzd: bk.weekConfirmedTotalDzd ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t("dashboardLoadError"));
      setMe(null);
      setTrips([]);
      setBookingsPayload(null);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onAuth() {
      void load();
    }
    window.addEventListener("ri7la_auth", onAuth);
    return () => window.removeEventListener("ri7la_auth", onAuth);
  }, [load]);

  const now = useMemo(() => new Date(), []);

  const pendingBookings = useMemo(() => {
    if (!bookingsPayload?.items) return [];
    return bookingsPayload.items.filter((b) => b.status === "PENDING" && b.trip && b.passenger);
  }, [bookingsPayload]);

  const previewRequests = useMemo(() => pendingBookings.slice(0, 5), [pendingBookings]);

  const upcomingTrips = useMemo(() => {
    if (!trips) return [];
    return trips
      .filter((r) => r.status === "PUBLISHED" && new Date(r.departureAt) > now)
      .sort((a, b) => new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime())
      .slice(0, 5);
  }, [trips, now]);

  const displayName = me?.fullName?.trim() || t("unnamed");
  const pendingCount = bookingsPayload?.pendingCount ?? 0;
  const weekEarnings = bookingsPayload?.weekConfirmedTotalDzd ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("dashboardWelcome", { name: displayName })}</h1>
          <p className="mt-1 text-on-surface-variant">
            {pendingCount === 0
              ? t("dashboardSubtitleZeroPending")
              : t("dashboardSubtitlePending", { count: pendingCount })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Link
            href="/driver/messages"
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-low px-5 py-3 text-sm font-extrabold text-on-surface shadow-sm active:scale-95"
          >
            <MaterialIcon name="forum" className="!text-xl" />
            {tMsg("title")}
          </Link>
          <Link
            href="/driver/trips/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
          >
            {t("actionNewTrip")}
            <MaterialIcon name="add" className="!text-xl" />
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container" role="alert">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DriverDashboardVerificationCard />

        <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm lg:col-span-1">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">{t("dashboardEarningsTitle")}</div>
          <div className="mt-2 text-4xl font-extrabold">
            {bookingsPayload === null && !error ? "…" : formatMoney(weekEarnings, "DZD", locale)}
          </div>
          <p className="mt-2 text-xs font-bold opacity-90">{t("dashboardEarningsHint")}</p>
          <div className="mt-6 flex items-center justify-between text-xs font-bold opacity-90">
            <span />
            <Link href="/driver/earnings" className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-primary-container">
              {t("statSeeAll")}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">{t("requestsListTitle")}</div>
            <Link href="/driver/requests" className="text-xs font-bold text-primary underline underline-offset-4">
              {t("dashboardViewAllRequests")}
            </Link>
          </div>
          {!bookingsPayload && !error ? (
            <div className="flex justify-center py-12 text-on-surface-variant">
              <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
            </div>
          ) : previewRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">{t("dashboardRequestsEmpty")}</p>
          ) : (
            <div className="space-y-3">
              {previewRequests.map((r) => {
                const trip = r.trip!;
                const p = r.passenger!;
                const { from, to } = labelOriginDest(
                  trip.originCity,
                  trip.originName,
                  trip.destinationCity,
                  trip.destinationName,
                  locale
                );
                const when = new Date(trip.departureAt).toLocaleString(locale, {
                  dateStyle: "medium",
                  timeStyle: "short",
                });
                const initial = p.fullName.trim().charAt(0).toUpperCase() || "?";
                return (
                  <div
                    key={r.id}
                    className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant">
                        {initial}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-on-surface">{p.fullName}</div>
                        {p.email?.trim() || p.phoneE164?.trim() ? (
                          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] font-semibold text-on-surface-variant">
                            {p.email?.trim() ? (
                              <a href={`mailto:${p.email!.trim()}`} className="max-w-full break-all text-primary hover:underline">
                                {p.email!.trim()}
                              </a>
                            ) : null}
                            {p.email?.trim() && p.phoneE164?.trim() ? <span aria-hidden>·</span> : null}
                            {p.phoneE164?.trim() ? (
                              <a href={`tel:${p.phoneE164!.trim()}`} className="text-primary hover:underline">
                                {p.phoneE164!.trim()}
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant">
                          <span className="rounded-full bg-white/60 px-3 py-1">{from}</span>
                          <MaterialIcon name="trending_flat" className="!text-lg text-outline" />
                          <span className="rounded-full bg-white/60 px-3 py-1">{to}</span>
                          <span className="ml-2">{when}</span>
                          <span className="ml-2">
                            {t("dashboardSeatsAndTotal", {
                              seats: r.seats,
                              total: formatMoney(r.totalAmount, r.totalCurrency || "DZD", locale),
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/driver/requests"
                      className="shrink-0 rounded-full bg-white px-5 py-2 text-center text-xs font-extrabold text-primary-container active:scale-95"
                    >
                      {t("dashboardOpenRequests")}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 text-sm font-extrabold text-on-surface">{t("dashboardScheduledTitle")}</div>
            {!trips && !error ? (
              <div className="flex justify-center py-8 text-on-surface-variant">
                <MaterialIcon name="progress_activity" className="!text-2xl animate-spin text-primary" />
              </div>
            ) : upcomingTrips.length === 0 ? (
              <p className="py-4 text-center text-xs text-on-surface-variant">{t("dashboardScheduledEmpty")}</p>
            ) : (
              <div className="space-y-3">
                {upcomingTrips.map((trip) => {
                  const { from, to } = labelOriginDest(
                    trip.originCity,
                    trip.originName,
                    trip.destinationCity,
                    trip.destinationName,
                    locale
                  );
                  const time = new Date(trip.departureAt).toLocaleString(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                  const title = `${from} → ${to}`;
                  const icon = trip.mode === "BUS" ? "directions_bus" : trip.mode === "TRAIN" ? "train" : "directions_car";
                  return (
                    <div key={trip.id} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
                        <MaterialIcon name={icon} className="!text-2xl text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-extrabold text-on-surface">{title}</div>
                        <div className="mt-1 text-[10px] font-bold text-on-surface-variant">{time}</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-extrabold text-on-primary-fixed-variant">
                        {t("dashboardTripUpcoming")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <Link
              href="/driver/trips"
              className="mt-4 block w-full rounded-full bg-surface-container-low py-3 text-center text-sm font-extrabold text-on-surface active:scale-95"
            >
              {t("dashboardManageTrips")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
