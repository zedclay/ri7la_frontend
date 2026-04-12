"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { CheckoutTripSummaryCard } from "@/components/checkout/CheckoutTripSummaryCard";
import { checkoutPriceBreakdown } from "@/lib/checkoutPrice";
import {
  clearCheckoutDrafts,
  loadPassengerDraft,
  loadPaymentDraft,
  type PassengerCheckoutDraft,
  type PaymentCheckoutDraft,
} from "@/lib/checkoutStorage";
import { CheckoutOwnTripMessage } from "@/components/checkout/CheckoutOwnTripMessage";
import { buildConfirmedSnapshot, saveConfirmedSnapshot } from "@/lib/confirmedBooking";
import { apiPostJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import type { Booking, PaymentMethod } from "@/lib/types";
import { useIsTripOwner } from "@/lib/useIsTripOwner";

const TRIP_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function methodLabel(method: PaymentMethod, t: (k: string) => string) {
  const keys: Record<PaymentMethod, string> = {
    edahabia: "methodEdahabia",
    cib: "methodCib",
    baridimob: "methodBaridimob",
    bank_transfer: "methodBank",
    cash: "methodCash",
  };
  return t(keys[method]);
}

export function CheckoutConfirmClient({ bookingId, booking }: { bookingId: string; booking: Booking }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [passenger, setPassenger] = useState<PassengerCheckoutDraft | null>(null);
  const [payment, setPayment] = useState<PaymentCheckoutDraft | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const tripOwnerCheck = useIsTripOwner(booking.tripOwnerUserId);

  const { base, fee, total, currency } = checkoutPriceBreakdown(booking);

  useEffect(() => {
    const p = loadPassengerDraft(bookingId);
    const pay = loadPaymentDraft(bookingId);
    if (!p || !pay) {
      router.replace(!p ? `/passenger/checkout/${bookingId}/details` : `/passenger/checkout/${bookingId}/payment`);
      return;
    }
    setPassenger(p);
    setPayment(pay);
  }, [bookingId, router]);

  async function finalize() {
    if (!passenger || !payment) return;
    setFinalizeError(null);
    const tripId = booking.tripId ?? bookingId;
    let serverBookingId: string | null = null;
    const authed = !!getAccessToken();

    setFinalizing(true);
    try {
      if (TRIP_ID_RE.test(tripId) && authed) {
        try {
          const created = await apiPostJsonData<{ id: string }>("/api/bookings", {
            tripId,
            seats: Math.max(1, booking.seatsCount ?? 1),
          });
          serverBookingId = created?.id ?? null;
          if (!serverBookingId) {
            setFinalizeError(t("bookingServerFailedGeneric"));
            return;
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "";
          setFinalizeError(msg ? t("bookingServerFailed", { message: msg }) : t("bookingServerFailedGeneric"));
          return;
        }
      }

      if (serverBookingId && authed) {
        try {
          if (payment.method === "edahabia") {
            await apiPostJsonData("/api/payments", { bookingId: serverBookingId, provider: "EDAHABIA" });
          } else if (payment.method === "cib") {
            await apiPostJsonData("/api/payments", { bookingId: serverBookingId, provider: "CIB" });
          } else if (payment.method === "baridimob") {
            const proof = payment.baridimobReceiptDataUrl;
            if (!proof) throw new Error("missing receipt");
            await apiPostJsonData("/api/payments", {
              bookingId: serverBookingId,
              provider: "BARIDIMOB",
              proofDataUrl: proof,
            });
          }
        } catch {
          /* Payment API optional when backend offline — booking row still exists */
        }
      }
      const snapshot = buildConfirmedSnapshot(bookingId, booking, passenger, payment, {
        base,
        fee,
        total,
        currency,
      });
      try {
        saveConfirmedSnapshot(snapshot);
        sessionStorage.setItem(`ri7la_success_passenger_${bookingId}`, passenger.fullName);
      } catch {
        /* ignore */
      }
      clearCheckoutDrafts(bookingId);
      router.push(`/passenger/checkout/${bookingId}/success`);
    } finally {
      setFinalizing(false);
    }
  }

  if (booking.tripOwnerUserId && tripOwnerCheck === "pending") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-on-surface-variant">
        <MaterialIcon name="progress_activity" className="!text-3xl animate-spin text-primary" />
      </div>
    );
  }

  if (tripOwnerCheck === true) {
    return <CheckoutOwnTripMessage booking={booking} />;
  }

  if (!passenger || !payment) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-on-surface-variant">
        <span className="inline-block animate-spin">
          <MaterialIcon name="sync" className="!text-4xl text-primary" />
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl font-extrabold text-on-surface md:text-3xl">{t("reviewTitle")}</h1>
              <p className="mt-1 text-on-surface-variant">{t("reviewSubtitle")}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed/40">
              <MaterialIcon name="check_circle" filled className="!text-3xl text-primary" />
            </div>
          </div>

          <div className="mb-8">
            <CheckoutTripSummaryCard booking={booking} />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-surface-container-low p-6">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t("passenger")}</div>
              <div className="text-lg font-extrabold text-on-surface">{passenger.fullName}</div>
              <div className="mt-2 text-sm text-on-surface-variant">{passenger.email}</div>
              <div className="text-sm text-on-surface-variant">+213 {passenger.phone}</div>
            </div>
            <div className="rounded-2xl bg-surface-container-low p-6">
              <div className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t("paymentMethod")}</div>
              <div className="text-lg font-extrabold text-on-surface">{methodLabel(payment.method, t)}</div>
              {payment.method === "baridimob" && payment.baridimobReceiptDataUrl ? (
                <div className="mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("baridimobReceiptTitle")}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={payment.baridimobReceiptDataUrl}
                    alt=""
                    className="mt-2 max-h-40 w-full max-w-xs rounded-xl border border-outline-variant/20 object-contain"
                  />
                </div>
              ) : null}
              <div className="mt-4 border-t border-outline-variant/20 pt-4">
                <div className="flex justify-between text-lg font-extrabold text-on-surface">
                  <span>{t("total")}</span>
                  <span className="text-primary-container">
                    {total.toLocaleString("fr-DZ")} {currency}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: "lock", titleKey: "securePayment", subKey: "securePaymentSub" },
              { icon: "verified_user", titleKey: "dataProtection", subKey: "dataProtectionSub" },
              { icon: "support_agent", titleKey: "trustSupport", subKey: "trustSupportSub" },
            ].map((i) => (
              <div key={i.titleKey} className="flex items-center gap-3 rounded-2xl bg-surface-container-low px-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm">
                  <MaterialIcon name={i.icon} className="!text-2xl text-primary" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-on-surface">{t(i.titleKey)}</div>
                  <div className="text-[10px] font-medium text-on-surface-variant">{t(i.subKey)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:sticky lg:top-36">
          <div className="mb-4 text-sm font-bold text-on-surface">{t("confirmSidebarTitle")}</div>
          {!getAccessToken() && TRIP_ID_RE.test(booking.tripId ?? bookingId) ? (
            <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-on-surface">
              {t("bookingOfflineHint")}
            </div>
          ) : null}
          {finalizeError ? (
            <div className="mb-4 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-xs font-semibold text-on-error-container" role="alert">
              {finalizeError}
            </div>
          ) : null}
          <button
            type="button"
            disabled={finalizing}
            onClick={() => void finalize()}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-[0.99] disabled:opacity-50"
          >
            {finalizing ? t("finalizing") : t("completeBooking")}
            <MaterialIcon name="check" className="!text-xl" />
          </button>
          <Link
            href={`/passenger/checkout/${bookingId}/payment`}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-surface-container-low py-3 text-sm font-bold text-on-surface"
          >
            {t("backToPayment")}
          </Link>
          <div className="mt-6 rounded-xl bg-surface-container-low p-4 text-xs text-on-surface-variant">{t("cancelPolicyNote")}</div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <MaterialIcon name="support_agent" className="!text-2xl text-secondary" />
            <div>
              <div className="text-sm font-bold text-on-surface">{t("needHelp")}</div>
              <Link href="/passenger/support" className="mt-2 inline-block text-xs font-bold text-primary underline underline-offset-4">
                {t("contactSupport")}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
