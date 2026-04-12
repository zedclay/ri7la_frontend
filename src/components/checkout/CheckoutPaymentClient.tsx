"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { CheckoutOwnTripMessage } from "@/components/checkout/CheckoutOwnTripMessage";
import { checkoutPriceBreakdown } from "@/lib/checkoutPrice";
import { loadPassengerDraft, loadPaymentDraft, savePaymentDraft } from "@/lib/checkoutStorage";
import { filesToDataUrls } from "@/lib/fileDataUrls";
import type { Booking, PaymentMethod } from "@/lib/types";
import { useIsTripOwner } from "@/lib/useIsTripOwner";

function modeIcon(mode: Booking["mode"]) {
  if (mode === "bus") return "directions_bus";
  if (mode === "train") return "train";
  return "directions_car";
}

const METHODS: { key: PaymentMethod; icon: string; labelKey: string }[] = [
  { key: "edahabia", icon: "credit_card", labelKey: "methodEdahabia" },
  { key: "cib", icon: "payment", labelKey: "methodCib" },
  { key: "baridimob", icon: "smartphone", labelKey: "methodBaridimob" },
];

export function CheckoutPaymentClient({ bookingId, booking }: { bookingId: string; booking: Booking }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [baridimobReceiptName, setBaridimobReceiptName] = useState<string | null>(null);

  const { base, fee, total, currency } = checkoutPriceBreakdown(booking);
  const icon = modeIcon(booking.mode);
  const seatTitle = booking.mode === "carpool" ? t("seatCarpool") : t("seatBusTrain");
  const tripOwnerCheck = useIsTripOwner(booking.tripOwnerUserId);

  useEffect(() => {
    if (!loadPassengerDraft(bookingId)) {
      router.replace(`/passenger/checkout/${bookingId}/details`);
      return;
    }
    const p = loadPaymentDraft(bookingId);
    if (p?.method) setMethod(p.method);
    if (p?.method === "baridimob" && p.baridimobReceiptDataUrl) {
      setBaridimobReceiptName("receipt");
    }
  }, [bookingId, router]);

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

  function goConfirm() {
    setError(null);
    if (!method) {
      setError(t("selectPayment"));
      return;
    }
    if (method === "baridimob") {
      const p = loadPaymentDraft(bookingId);
      if (!p?.baridimobReceiptDataUrl) {
        setError(t("baridimobNeedReceipt"));
        return;
      }
      savePaymentDraft(bookingId, { method: "baridimob", baridimobReceiptDataUrl: p.baridimobReceiptDataUrl });
    } else {
      savePaymentDraft(bookingId, { method });
    }
    router.push(`/passenger/checkout/${bookingId}/confirm`);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
          <h1 className="font-headline text-2xl font-extrabold text-on-surface md:text-3xl">{t("choosePayment")}</h1>
          <p className="mt-1 text-on-surface-variant">{t("choosePaymentSub")}</p>

          {booking.mode === "carpool" ? (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary-container/10 p-4 text-sm text-on-surface">
              {t("carpoolPaymentNote")}
            </div>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {METHODS.map((m) => {
              const active = method === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMethod(m.key);
                    if (m.key !== "baridimob") {
                      setBaridimobReceiptName(null);
                      savePaymentDraft(bookingId, { method: m.key });
                    } else {
                      const cur = loadPaymentDraft(bookingId);
                      savePaymentDraft(bookingId, {
                        method: "baridimob",
                        baridimobReceiptDataUrl: cur?.baridimobReceiptDataUrl,
                      });
                    }
                  }}
                  className={`flex items-center justify-between rounded-2xl border-2 px-5 py-4 text-left transition-all ${
                    active
                      ? "border-primary bg-primary-container/10 shadow-md shadow-primary/10"
                      : "border-outline-variant/20 bg-surface-container-low hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm">
                      <MaterialIcon name={m.icon} className="!text-2xl text-primary" />
                    </div>
                    <div className="text-sm font-extrabold text-on-surface">{t(m.labelKey)}</div>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      active ? "border-primary bg-primary" : "border-outline-variant bg-white"
                    }`}
                  >
                    {active ? <MaterialIcon name="check" className="!text-sm text-on-primary" /> : null}
                  </div>
                </button>
              );
            })}
          </div>

          {method === "baridimob" ? (
            <div className="mt-6 rounded-2xl border border-primary/25 bg-primary-container/10 p-5">
              <div className="flex items-start gap-3">
                <MaterialIcon name="receipt_long" className="!text-2xl shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-extrabold text-on-surface">{t("baridimobReceiptTitle")}</div>
                  <p className="mt-1 text-xs text-on-surface-variant">{t("baridimobReceiptBody")}</p>
                  <label className="mt-4 flex cursor-pointer flex-col gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        setError(null);
                        if (!file) {
                          setBaridimobReceiptName(null);
                          savePaymentDraft(bookingId, { method: "baridimob" });
                          return;
                        }
                        try {
                          const [dataUrl] = await filesToDataUrls([file]);
                          setBaridimobReceiptName(file.name);
                          setMethod("baridimob");
                          savePaymentDraft(bookingId, { method: "baridimob", baridimobReceiptDataUrl: dataUrl });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : t("baridimobUploadError"));
                        }
                      }}
                    />
                    <span className="inline-flex w-fit items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md active:scale-95">
                      {t("baridimobReceiptUpload")}
                    </span>
                  </label>
                  {baridimobReceiptName ? (
                    <p className="mt-3 text-xs font-medium text-on-surface">
                      {t("baridimobReceiptSelected", { name: baridimobReceiptName })}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
              {error}
            </div>
          ) : null}

          <div className="mt-8 rounded-2xl bg-surface-container-low p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-bold text-on-surface">{t("cardInfo")}</div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-bold text-on-primary-fixed-variant">
                <MaterialIcon name="verified_user" filled className="!text-sm" />
                {t("secureSsl")}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("cardholder")}</div>
                <input
                  disabled={method !== "edahabia" && method !== "cib"}
                  className="mt-2 w-full rounded-xl border-none bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  placeholder="—"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("cardNumber")}</div>
                <input
                  disabled={method !== "edahabia" && method !== "cib"}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border-none bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("expiry")}</div>
                <input
                  disabled={method !== "edahabia" && method !== "cib"}
                  className="mt-2 w-full rounded-xl border-none bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("cvc")}</div>
                <input
                  disabled={method !== "edahabia" && method !== "cib"}
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border-none bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  placeholder="•••"
                />
              </div>
            </div>
            <p className="mt-3 text-[10px] text-on-surface-variant">
              {t("confirmLegal")}
            </p>
          </div>

          {method === "baridimob" ? (
            <div className="mt-6 rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low p-6">
              <div className="flex items-start gap-3">
                <MaterialIcon name="schedule" className="!text-xl text-primary" />
                <div>
                  <div className="text-sm font-bold text-on-surface">{t("baridimobPendingTitle")}</div>
                  <div className="mt-1 text-sm text-on-surface-variant">{t("baridimobPendingBody")}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: "lock", titleKey: "trustEncrypted", subKey: "trustEncryptedSub" },
              { icon: "support_agent", titleKey: "trustSupport", subKey: "trustSupportSub" },
              { icon: "bolt", titleKey: "trustInstant", subKey: "trustInstantSub" },
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

          <button
            type="button"
            onClick={goConfirm}
            className="gradient-primary subtle-shadow mt-8 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-[0.99] lg:hidden"
          >
            {t("confirmPay")}
            <MaterialIcon name="arrow_forward" className="!text-xl rtl:rotate-180" />
          </button>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:sticky lg:top-36">
          <div className="mb-4 text-sm font-bold text-on-surface">{t("bookingSummary")}</div>
          <div className="rounded-2xl bg-surface-container-low p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm">
                <MaterialIcon name={icon} className="!text-2xl text-primary" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-on-surface">
                  {booking.fromLabel} → {booking.toLabel}
                </div>
                <div className="text-[10px] font-medium text-on-surface-variant">
                  {booking.dateLabel} • {booking.departureTime}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-container-lowest px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("passengers")}</div>
                <div className="mt-1 font-extrabold text-on-surface">{t("adultCount", { count: booking.seatsCount })}</div>
              </div>
              <div className="rounded-xl bg-surface-container-lowest px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{seatTitle}</div>
                <div className="mt-1 font-extrabold text-on-surface">{booking.seatLabel ?? "—"}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-outline-variant/15 pt-4 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>{t("baseFare")}</span>
                <span className="font-semibold text-on-surface">{base.toLocaleString("fr-DZ")} {currency}</span>
              </div>
              {fee > 0 ? (
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t("serviceFee")}</span>
                  <span className="font-semibold text-on-surface">{fee.toLocaleString("fr-DZ")} {currency}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-extrabold text-on-surface">
                <span>{t("total")}</span>
                <span className="text-primary-container">
                  {total.toLocaleString("fr-DZ")} {currency}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={goConfirm}
            className="mt-6 hidden w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-[0.99] lg:flex"
          >
            {t("confirmPay")}
            <MaterialIcon name="arrow_forward" className="!text-xl rtl:rotate-180" />
          </button>

          <Link
            href={`/passenger/checkout/${bookingId}/details`}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-surface-container-low py-3 text-sm font-bold text-on-surface"
          >
            {t("backToDetails")}
          </Link>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <MaterialIcon name="support_agent" className="!text-2xl text-secondary" />
            <div>
              <div className="text-sm font-bold text-on-surface">{t("needHelp")}</div>
              <div className="mt-1 text-xs text-on-surface-variant">{t("needHelpSub")}</div>
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
