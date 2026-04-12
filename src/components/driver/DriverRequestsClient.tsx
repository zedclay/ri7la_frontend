"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Link } from "@/i18n/navigation";
import { apiGetJsonData, apiPostJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { getPlaceByCityKey, placePrimaryLabel } from "@/lib/algeriaPlaces";
import { isDriverIdentityAndLicenseUploaded } from "@/lib/verificationGates";

type DriverBookingRow = {
  id: string;
  status: string;
  seats: number;
  totalAmount: number;
  totalCurrency: string;
  paymentStatus: string;
  externalReference: string | null;
  createdAt: string;
  updatedAt: string;
  passenger: {
    id: string;
    fullName: string;
    email: string | null;
    phoneE164: string | null;
    phoneVerified: boolean;
  } | null;
  trip: {
    id: string;
    originCity: string;
    originName: string;
    destinationCity: string;
    destinationName: string;
    departureAt: string;
    allowInstantBooking: boolean;
    pricePerSeat: number;
    priceCurrency: string;
    seatsTotal: number;
    seatsAvailable: number;
  } | null;
  payment: {
    id: string;
    provider: string;
    recordStatus: string;
    proofUrl: string | null;
    providerReference: string | null;
    amount: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
  } | null;
};

function paymentStatusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case "UNPAID":
      return t("requestsPaymentUnpaid");
    case "PAID":
      return t("requestsPaymentPaid");
    case "FAILED":
      return t("requestsPaymentFailed");
    case "REFUNDED":
      return t("requestsPaymentRefunded");
    default:
      return status;
  }
}

function paymentTxStatusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case "PENDING":
      return t("requestsPaymentTxPending");
    case "PAID":
      return t("requestsPaymentTxPaid");
    case "FAILED":
      return t("requestsPaymentTxFailed");
    case "REFUNDED":
      return t("requestsPaymentTxRefunded");
    default:
      return status;
  }
}

function paymentProviderLabel(provider: string, t: (key: string) => string) {
  switch (provider) {
    case "BARIDIMOB":
      return t("requestsPaymentProviderBaridimob");
    case "CASH":
      return t("requestsPaymentProviderCash");
    case "CIB":
      return t("requestsPaymentProviderCib");
    case "EDAHABIA":
      return t("requestsPaymentProviderEdahabia");
    default:
      return provider;
  }
}

function proofUrlLooksLikeImage(url: string) {
  const u = url.trim().toLowerCase();
  return u.startsWith("data:image/") || /\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(u);
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

type TabId = "pending" | "confirmed";

export function DriverRequestsClient() {
  const t = useTranslations("driverProfile");
  const tMsg = useTranslations("messaging");
  const locale = useLocale();
  const [canAccept, setCanAccept] = useState(false);
  const [items, setItems] = useState<DriverBookingRow[] | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("pending");
  const [tabTouched, setTabTouched] = useState(false);

  const load = useCallback(async () => {
    if (!getAccessToken()) {
      setItems([]);
      setPendingCount(0);
      return;
    }
    setError(null);
    try {
      const res = await apiGetJsonData<{
        items: DriverBookingRow[];
        pendingCount: number;
      }>("/api/drivers/me/bookings");
      setItems(res.items ?? []);
      setPendingCount(res.pendingCount ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requestsLoadError"));
      setItems([]);
      setPendingCount(0);
    }
  }, [t]);

  useEffect(() => {
    function refreshGates() {
      setCanAccept(isDriverIdentityAndLicenseUploaded());
    }
    refreshGates();
    window.addEventListener("focus", refreshGates);
    window.addEventListener("ri7la_auth", refreshGates);
    return () => {
      window.removeEventListener("focus", refreshGates);
      window.removeEventListener("ri7la_auth", refreshGates);
    };
  }, []);

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

  const pending = useMemo(() => {
    if (!items) return [];
    return items.filter((b) => b.status === "PENDING" && b.trip && b.passenger);
  }, [items]);

  const confirmed = useMemo(() => {
    if (!items) return [];
    return items
      .filter((b) => (b.status === "CONFIRMED" || b.status === "COMPLETED") && b.trip && b.passenger)
      .slice(0, 80);
  }, [items]);

  useEffect(() => {
    if (items === null) return;
    if (tabTouched) return;
    if (tab === "pending" && pending.length === 0 && confirmed.length > 0) {
      setTab("confirmed");
    }
  }, [confirmed.length, items, pending.length, tab, tabTouched]);

  const list = tab === "pending" ? pending : confirmed;

  async function confirm(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await apiPostJsonData(`/api/drivers/me/bookings/${encodeURIComponent(id)}/confirm`, {});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requestsActionError"));
    } finally {
      setBusyId(null);
    }
  }

  async function decline(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await apiPostJsonData(`/api/drivers/me/bookings/${encodeURIComponent(id)}/decline`, {});
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("requestsActionError"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("requestsTitle")}</h1>
        <p className="mt-1 text-on-surface-variant">{t("requestsSubtitle")}</p>
        <p className="mt-3 rounded-xl bg-surface-container-low px-4 py-3 text-xs font-semibold text-on-surface-variant">
          {t("requestsInstantBookingHint")}
        </p>
      </div>

      {!canAccept ? (
        <div className="rounded-2xl border border-error/25 bg-error-container/20 px-5 py-5 text-on-error-container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <MaterialIcon name="block" className="!text-3xl shrink-0" />
              <div>
                <div className="font-headline text-lg font-extrabold">{t("cannotAcceptTitle")}</div>
                <p className="mt-1 text-sm opacity-95">{t("cannotAcceptBody")}</p>
              </div>
            </div>
            <Link
              href="/driver/onboarding"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary"
            >
              {t("cannotAcceptCta")}
            </Link>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-on-error-container" role="alert">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setTabTouched(true);
                setTab("pending");
              }}
              className={`rounded-full px-4 py-2 text-xs font-extrabold ${
                tab === "pending" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"
              }`}
            >
              {t("requestsPendingTab")}
            </button>
            <button
              type="button"
              onClick={() => {
                setTabTouched(true);
                setTab("confirmed");
              }}
              className={`rounded-full px-4 py-2 text-xs font-extrabold ${
                tab === "confirmed" ? "bg-primary text-on-primary" : "bg-surface-container-low text-on-surface"
              }`}
            >
              {t("requestsConfirmedTab")}
            </button>
          </div>
          <span className="rounded-full bg-tertiary-fixed/60 px-3 py-1 text-[10px] font-extrabold text-on-tertiary-fixed">
            {tab === "pending"
              ? t("requestsPendingBadge", { count: pendingCount })
              : t("requestsConfirmedBadge", { count: confirmed.length })}
          </span>
        </div>

        <div className="mb-4 text-sm font-extrabold text-on-surface">
          {tab === "pending" ? t("requestsListTitle") : t("requestsConfirmedTitle")}
        </div>

        {items === null ? (
          <div className="flex justify-center py-16 text-on-surface-variant">
            <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">
            {tab === "pending" ? t("requestsEmptyAll") : t("requestsConfirmedEmpty")}
          </p>
        ) : (
          <div className="space-y-4">
            {list.map((r) => {
              const trip = r.trip!;
              const p = r.passenger!;
              const o = getPlaceByCityKey(trip.originCity);
              const originLabel = o ? placePrimaryLabel(o, locale) : trip.originName || trip.originCity;
              const d = getPlaceByCityKey(trip.destinationCity);
              const destLabel = d ? placePrimaryLabel(d, locale) : trip.destinationName || trip.destinationCity;
              const when = new Date(trip.departureAt).toLocaleString(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              });
              const bookedAt = new Date(r.createdAt).toLocaleString(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              });
              const initial = p.fullName.trim().charAt(0).toUpperCase() || "?";
              const loading = busyId === r.id;
              const email = p.email?.trim() || null;
              const phone = p.phoneE164?.trim() || null;
              const refDisplay = r.externalReference?.trim() || r.id.slice(0, 8);
              const priceCur = trip.priceCurrency || r.totalCurrency || "DZD";
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-5 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 lg:flex-row lg:items-start lg:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-base font-extrabold text-on-primary-fixed-variant">
                        {initial}
              </div>
                      <div className="min-w-0 flex-1 space-y-3">
              <div>
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                            {t("requestsPassengerHeading")}
                          </div>
                          <div className="mt-0.5 text-base font-extrabold text-on-surface">{p.fullName}</div>
                          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                            <div className="flex items-start gap-2 rounded-xl bg-surface-container-lowest/80 px-3 py-2">
                              <MaterialIcon name="mail" className="!text-lg shrink-0 text-primary" />
                              <div className="min-w-0">
                                <div className="text-[10px] font-bold uppercase text-on-surface-variant">{t("requestsContactEmail")}</div>
                                {email ? (
                                  <a href={`mailto:${email}`} className="break-all font-semibold text-primary underline-offset-2 hover:underline">
                                    {email}
                                  </a>
                                ) : (
                                  <span className="font-semibold text-on-surface-variant">{t("notProvided")}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-start gap-2 rounded-xl bg-surface-container-lowest/80 px-3 py-2">
                              <MaterialIcon name="call" className="!text-lg shrink-0 text-primary" />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-bold uppercase text-on-surface-variant">{t("requestsContactPhone")}</span>
                                  {p.phoneVerified ? (
                                    <span className="rounded-full bg-tertiary-fixed/50 px-2 py-0.5 text-[9px] font-extrabold text-on-tertiary-fixed">
                                      {t("requestsPhoneVerified")}
                                    </span>
                                  ) : null}
                                </div>
                                {phone ? (
                                  <a href={`tel:${phone}`} className="font-semibold text-primary underline-offset-2 hover:underline">
                                    {phone}
                                  </a>
                                ) : (
                                  <span className="font-semibold text-on-surface-variant">{t("notProvided")}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest/60 p-3">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">{t("requestsTripHeading")}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-extrabold text-on-surface">
                            <span>{originLabel}</span>
                            <MaterialIcon name="arrow_forward" className="!text-lg text-outline" />
                            <span>{destLabel}</span>
                          </div>
                          {(trip.originName || trip.destinationName) && (
                            <div className="mt-1 text-[11px] font-semibold text-on-surface-variant">
                              <span className="font-bold text-on-surface-variant/80">{t("requestsPickupDropoff")}:</span>{" "}
                              {[trip.originName || "—", trip.destinationName || "—"].join(" → ")}
                            </div>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-on-surface-variant">
                            <span className="inline-flex items-center gap-1">
                              <MaterialIcon name="event" className="!text-base" />
                              {when}
                            </span>
                            {trip.allowInstantBooking ? (
                              <span className="rounded-full bg-secondary-container/40 px-2 py-0.5 text-[10px] font-extrabold text-on-secondary-container">
                                {t("requestsInstantTrip")}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-on-surface-variant">
                            <span>
                              {t("requestsPricePerSeat")}: {formatMoney(trip.pricePerSeat, priceCur, locale)}
                            </span>
                            <span>
                              {t("requestsSeatsAvailable")}: {trip.seatsAvailable} / {trip.seatsTotal}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest/60 p-3">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">{t("requestsBookingHeading")}</div>
                          <div className="mt-2 space-y-1.5 text-xs font-bold text-on-surface-variant">
                            <div className="text-on-surface">
                              {t("requestsTripLine", {
                                seats: r.seats,
                                total: formatMoney(r.totalAmount, r.totalCurrency || "DZD", locale),
                                origin: originLabel,
                                dest: destLabel,
                                when,
                              })}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              <span className="inline-flex items-center gap-1">
                                <MaterialIcon name="payments" className="!text-base" />
                                {t("requestsPayment")}: {paymentStatusLabel(r.paymentStatus, t)}
                              </span>
                              <span className="font-mono text-[11px] text-on-surface-variant">
                                {t("requestsBookingRef")}: {refDisplay}
                              </span>
                            </div>
                            <div className="text-[11px] font-semibold">
                              {t("requestsBookedAt")}: {bookedAt}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest/60 p-3">
                          <div className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                            {t("requestsPaymentProofTitle")}
                          </div>
                          {r.payment ? (
                            <div className="mt-2 space-y-2 text-xs font-bold text-on-surface-variant">
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                <span>
                                  {t("requestsPaymentMethod")}: {paymentProviderLabel(r.payment.provider, t)}
                                </span>
                                <span>{paymentTxStatusLabel(r.payment.recordStatus, t)}</span>
                              </div>
                              {r.payment.providerReference?.trim() ? (
                                <div className="font-mono text-[11px]">
                                  {t("requestsPaymentGatewayRef")}: {r.payment.providerReference.trim()}
                                </div>
                              ) : null}
                              {r.payment.proofUrl?.trim() ? (
                                <div className="mt-2 space-y-2">
                                  {proofUrlLooksLikeImage(r.payment.proofUrl) ? (
                                    <a
                                      href={r.payment.proofUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block overflow-hidden rounded-lg border border-outline-variant/20 bg-black/5"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={r.payment.proofUrl}
                                        alt=""
                                        className="max-h-56 w-full object-contain"
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      href={r.payment.proofUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 font-extrabold text-primary underline-offset-2 hover:underline"
                                    >
                                      <MaterialIcon name="description" className="!text-lg" />
                                      {t("requestsPaymentProofOpen")}
                                    </a>
                                  )}
                                  {proofUrlLooksLikeImage(r.payment.proofUrl) ? (
                                    <a
                                      href={r.payment.proofUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary underline-offset-2 hover:underline"
                                    >
                                      <MaterialIcon name="open_in_new" className="!text-base" />
                                      {t("requestsPaymentProofOpen")}
                                    </a>
                                  ) : null}
                                </div>
                              ) : (
                                <p className="mt-1 text-[11px] font-semibold leading-relaxed text-on-surface-variant">
                                  {t("requestsPaymentNoReceiptFile")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="mt-2 text-[11px] font-semibold leading-relaxed text-on-surface-variant">
                              {t("requestsPaymentNoAttempt")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {tab === "pending" ? (
                    <div className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-3 border-t border-outline-variant/15 pt-4 lg:flex-col lg:border-t-0 lg:pt-0 lg:pl-4">
                      <Link
                        href={`/driver/messages?booking=${encodeURIComponent(r.id)}`}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-primary-container underline"
                      >
                        <MaterialIcon name="chat" className="!text-base" />
                        {tMsg("ctaMessagePassenger")}
                      </Link>
                      <button
                        type="button"
                        disabled={!canAccept || loading}
                        onClick={() => void decline(r.id)}
                        className="text-xs font-bold text-on-surface-variant hover:text-error disabled:opacity-45"
                      >
                        {t("reject")}
                      </button>
                      <button
                        type="button"
                        disabled={!canAccept || loading}
                        title={!canAccept ? t("approveDisabledHint") : undefined}
                        onClick={() => void confirm(r.id)}
                        className="rounded-full bg-primary px-6 py-2.5 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/10 disabled:cursor-not-allowed disabled:opacity-45 active:scale-95"
                      >
                        {loading ? t("requestsWorking") : t("approve")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 flex-col items-stretch gap-2 border-t border-outline-variant/15 pt-4 sm:flex-row sm:justify-end lg:flex-col lg:border-t-0 lg:pt-0 lg:pl-4">
                      <span className="rounded-full bg-primary-fixed/35 px-3 py-1 text-center text-[10px] font-extrabold uppercase text-on-primary-fixed-variant">
                        {r.status === "COMPLETED" ? r.status : t("requestsStatusConfirmed")}
                      </span>
                      <Link
                        href={`/driver/messages?booking=${encodeURIComponent(r.id)}`}
                        className="rounded-full bg-secondary-container/40 px-4 py-2 text-center text-xs font-extrabold text-on-secondary-container"
                      >
                        {tMsg("ctaMessagePassenger")}
                      </Link>
                      <Link
                        href={`/carpool/${trip.id}`}
                        className="rounded-full bg-white px-4 py-2 text-center text-xs font-extrabold text-primary-container"
                      >
                        {t("requestsViewTrip")}
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
