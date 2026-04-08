"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { CheckoutTripSummaryCard } from "@/components/checkout/CheckoutTripSummaryCard";
import { checkoutPriceBreakdown } from "@/lib/checkoutPrice";
import { loadPassengerDraft, savePassengerDraft } from "@/lib/checkoutStorage";
import { isValidEmail } from "@/lib/emailValidation";
import type { Booking } from "@/lib/types";

export function CheckoutDetailsClient({ bookingId, booking }: { bookingId: string; booking: Booking }) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadPassengerDraft(bookingId);
    if (d) {
      setFullName(d.fullName);
      setEmail(d.email);
      setPhone(d.phone);
    }
  }, [bookingId]);

  const { base, fee, total, currency } = checkoutPriceBreakdown(booking);
  const backHref = booking.contextBackHref ?? "/search";

  function handleContinue(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (fullName.trim().length < 2 || !isValidEmail(email) || phone.trim().length < 6) {
      setError(t("validationPassenger"));
      return;
    }
    savePassengerDraft(bookingId, {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    router.push(`/passenger/checkout/${bookingId}/payment`);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-headline text-2xl font-extrabold text-on-surface md:text-3xl">{t("detailsTitle")}</h1>
              <p className="mt-1 text-on-surface-variant">{t("detailsSubtitle")}</p>
            </div>
            <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {t("bilingualSupport")}
            </span>
          </div>

          <div className="mb-8">
            <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">
              {t("tripSummary")}
            </div>
            <CheckoutTripSummaryCard booking={booking} />
          </div>

          <form onSubmit={(e) => handleContinue(e)} className="space-y-6">
            <div>
              <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">
                {t("passengerDetails")}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t("fullName")}
                  </label>
                  <input
                    required
                    minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("fullNamePlaceholder")}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t("phone")}
                  </label>
                  <div className="mt-2 flex items-center overflow-hidden rounded-xl bg-surface-container-low">
                    <div className="px-4 py-3 text-sm font-bold text-on-surface-variant">+213</div>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="min-w-0 flex-1 border-none bg-transparent px-3 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-0"
                      placeholder={t("phonePlaceholder")}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {t("email")}
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
                {error}
              </div>
            ) : null}

            {(booking.boardingPointTitle || booking.boardingPointBody) && (
              <div className="rounded-2xl border-s-4 border-primary bg-surface-container-low p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-on-surface">
                  <MaterialIcon name="info" className="!text-xl text-primary" />
                  {booking.boardingPointTitle ?? t("boardingInfo")}
                </div>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {booking.boardingPointBody ?? ""}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="gradient-primary subtle-shadow flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-[0.99] lg:hidden"
            >
              {t("continueToPayment")}
              <MaterialIcon name="arrow_forward" className="!text-xl rtl:rotate-180" />
            </button>
          </form>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:sticky lg:top-36">
          <div className="mb-4 text-sm font-bold text-on-surface">{t("priceSummary")}</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">{t("baseFare")}</span>
              <span className="font-bold text-on-surface">
                {base.toLocaleString("fr-DZ")} {currency}
              </span>
            </div>
            {fee > 0 ? (
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">{t("serviceFee")}</span>
                <span className="font-bold text-on-surface">
                  {fee.toLocaleString("fr-DZ")} {currency}
                </span>
              </div>
            ) : null}
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3 text-lg font-extrabold text-on-surface">
              <span>{t("total")}</span>
              <span className="text-primary-container">
                {total.toLocaleString("fr-DZ")} {currency}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleContinue()}
            className="mt-6 hidden w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-[0.99] lg:flex"
          >
            {t("continueToPayment")}
            <MaterialIcon name="arrow_forward" className="!text-xl rtl:rotate-180" />
          </button>
          <Link
            href={backHref}
            className="mt-3 flex w-full items-center justify-center rounded-full bg-surface-container-low py-3 text-sm font-bold text-on-surface active:scale-[0.99]"
          >
            {t("backToTrip")}
          </Link>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/10">
                <MaterialIcon name="lock" className="!text-2xl text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">{t("securePayment")}</div>
                <div className="text-xs text-on-surface-variant">{t("securePaymentSub")}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-container/40">
                <MaterialIcon name="verified_user" className="!text-2xl text-secondary" />
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">{t("dataProtection")}</div>
                <div className="text-xs text-on-surface-variant">{t("dataProtectionSub")}</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
