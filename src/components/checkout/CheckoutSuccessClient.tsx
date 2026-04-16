"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { Booking } from "@/lib/types";
import { loadConfirmedSnapshot, type ConfirmedBookingSnapshot } from "@/lib/confirmedBooking";
import { downloadTicketPdf, printTicketHtml, ticketQrImageUrl } from "@/lib/ticketDocument";

function modeIcon(mode: Booking["mode"]) {
  if (mode === "bus") return "directions_bus";
  if (mode === "train") return "train";
  return "directions_car";
}

export function CheckoutSuccessClient({ bookingId, booking }: { bookingId: string; booking: Booking }) {
  const t = useTranslations("checkout");
  const [snapshot, setSnapshot] = useState<ConfirmedBookingSnapshot | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const s = loadConfirmedSnapshot(bookingId);
    setSnapshot(s);
    setChecked(true);
    if (!s) {
      try {
        const n = sessionStorage.getItem(`saafir_success_passenger_${bookingId}`);
        if (n) {
          /* legacy: name without full snapshot — user should re-confirm */
        }
      } catch {
        /* ignore */
      }
    }
  }, [bookingId]);

  const displayBooking = snapshot?.booking ?? {
    mode: booking.mode,
    referenceCode: booking.referenceCode,
    fromLabel: booking.fromLabel,
    toLabel: booking.toLabel,
    dateLabel: booking.dateLabel,
    departureTime: booking.departureTime,
    arrivalTime: booking.arrivalTime,
    seatLabel: booking.seatLabel,
    durationLabel: booking.durationLabel,
    originDetail: booking.originDetail,
    destinationDetail: booking.destinationDetail,
  };

  const passengerName = snapshot?.passenger.fullName ?? "—";
  const modeForUi = snapshot?.booking.mode ?? booking.mode;
  const isPool = modeForUi === "carpool";
  const assignmentLabel = isPool ? t("seatCarpool") : t("seatBusTrain");

  const nextSteps = isPool
    ? [
        { icon: "schedule" as const, title: t("stepArriveCarpool"), desc: t("stepArriveCarpoolDesc") },
        { icon: "badge" as const, title: t("stepId"), desc: t("stepIdDesc") },
        { icon: "verified_user" as const, title: t("stepCodeCarpool"), desc: t("stepCodeCarpoolDesc") },
      ]
    : [
        { icon: "schedule" as const, title: t("stepArriveBusTrain"), desc: t("stepArriveBusTrainDesc") },
        { icon: "badge" as const, title: t("stepId"), desc: t("stepIdDesc") },
        { icon: "qr_code_2" as const, title: t("stepQrBusTrain"), desc: t("stepQrBusTrainDesc") },
      ];

  if (checked && !snapshot) {
    return (
      <>
        <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-container/40">
            <MaterialIcon name="receipt_long" className="!text-3xl text-on-tertiary-container" />
          </div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">{t("successSessionMissing")}</h1>
          <p className="mt-3 text-sm text-on-surface-variant">
            {booking.referenceCode} · {booking.fromLabel} → {booking.toLabel}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/passenger/checkout/${bookingId}/confirm`}
              className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/15"
            >
              {t("successGoConfirm")}
            </Link>
            <Link
              href={`/passenger/checkout/${bookingId}/details`}
              className="rounded-full bg-surface-container-low px-8 py-3 text-sm font-bold text-on-surface"
            >
              {t("stepDetails")}
            </Link>
          </div>
        </main>
        <footer className="border-t border-outline-variant/10 bg-surface-container-low px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-on-surface-variant md:flex-row">
            <div className="flex items-center gap-2">
              <img src="/saafir-icon.svg" alt="" className="h-7 w-7" />
              <img src="/saafir-wordmark.svg" alt="Saafir" className="h-5 w-auto" />
            </div>
            <div>© {new Date().getFullYear()} Saafir</div>
          </div>
        </footer>
      </>
    );
  }

  if (!checked) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-on-surface-variant">
        <span className="inline-block animate-spin">
          <MaterialIcon name="sync" className="!text-4xl text-primary" />
        </span>
      </div>
    );
  }

  const qrSrc = ticketQrImageUrl(snapshot!, 200);

  return (
    <>
      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-16 md:py-20">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/20">
          <MaterialIcon name="check" className="!text-3xl text-on-primary" />
        </div>
        <h1 className="text-center font-headline text-3xl font-extrabold tracking-tight text-primary-container md:text-5xl">
          {t("successTitle")}
        </h1>
        <p className="mt-3 max-w-md text-center text-on-surface-variant">{t("successSubtitle")}</p>

        <div className="mt-6 rounded-full bg-surface-container-low px-6 py-3 text-center shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("reference")}</div>
          <div className="text-xl font-extrabold text-primary-container">{displayBooking.referenceCode}</div>
        </div>

        <div className="mt-12 grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8 lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low shadow-sm">
                  <MaterialIcon name={modeIcon(modeForUi)} className="!text-2xl text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-on-surface">{t("tripSummary")}</div>
                  <div className="text-xs text-on-surface-variant">{displayBooking.dateLabel}</div>
                </div>
              </div>
              <span className="rounded-full bg-tertiary-fixed/60 px-3 py-1 text-[10px] font-bold text-on-tertiary-fixed">
                {t("statusConfirmed")}
              </span>
            </div>

            <div className="relative rounded-2xl bg-surface-container-low p-6">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("departure")}</div>
                  <div className="mt-1 text-2xl font-extrabold text-on-surface">{displayBooking.fromLabel}</div>
                  <div className="text-sm font-bold text-primary">{displayBooking.departureTime}</div>
                  {!isPool && displayBooking.originDetail ? (
                    <div className="mt-2 text-xs text-on-surface-variant">{displayBooking.originDetail}</div>
                  ) : null}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("arrival")}</div>
                  <div className="mt-1 text-2xl font-extrabold text-on-surface">{displayBooking.toLabel}</div>
                  {displayBooking.arrivalTime ? (
                    <div className="text-sm font-bold text-tertiary-container">{displayBooking.arrivalTime}</div>
                  ) : null}
                  {!isPool && displayBooking.destinationDetail ? (
                    <div className="mt-2 text-xs text-on-surface-variant">{displayBooking.destinationDetail}</div>
                  ) : null}
                </div>
              </div>
              {displayBooking.durationLabel ? (
                <div className="mt-6 flex items-center justify-center gap-2 border-t border-outline-variant/15 pt-6 text-xs font-extrabold text-primary">
                  <MaterialIcon name={modeIcon(modeForUi)} className="!text-base" />
                  {displayBooking.durationLabel}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-surface-container-low p-5 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("passenger")}</div>
                <div className="mt-1 text-sm font-extrabold text-on-surface">{passengerName}</div>
                {snapshot?.passenger.email ? (
                  <div className="mt-1 text-xs text-on-surface-variant">{snapshot.passenger.email}</div>
                ) : null}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{assignmentLabel}</div>
                <div className="mt-1 text-sm font-extrabold text-on-surface">{displayBooking.seatLabel ?? "—"}</div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-surface-container-low p-6">
              <div className="mb-4 text-sm font-bold text-on-surface">{t("nextSteps")}</div>
              <div className="space-y-4">
                {nextSteps.map((s) => (
                  <div key={s.title} className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm">
                      <MaterialIcon name={s.icon} className="!text-2xl text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{s.title}</div>
                      <div className="text-xs text-on-surface-variant">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {t("boardingQr")}
              </div>
              <div className="flex justify-center rounded-xl bg-surface-container-low py-8">
                <div className="rounded-xl bg-white p-4 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element -- external QR API, no Next optimizer needed */}
                  <img src={qrSrc} width={200} height={200} className="h-[200px] w-[200px]" alt="" />
                </div>
              </div>
              <p className="mt-4 text-center text-[10px] text-on-surface-variant">{t("boardingQrDesc")}</p>
              <button
                type="button"
                onClick={() => {
                  void downloadTicketPdf(snapshot!).catch(() => {});
                }}
                className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10"
              >
                {t("downloadTicket")}
              </button>
              <Link
                href="/passenger/bookings"
                className="mt-3 flex w-full items-center justify-center rounded-full bg-surface-container-low py-3 text-sm font-bold text-on-surface"
              >
                {t("viewDashboard")}
              </Link>
              <button
                type="button"
                onClick={() => printTicketHtml(snapshot!)}
                className="mt-3 w-full text-center text-sm font-bold text-on-surface-variant"
              >
                {t("print")}
              </button>
            </div>

            <div className="rounded-2xl bg-secondary-container/30 p-6">
              <div className="flex items-start gap-3">
                <MaterialIcon name="support_agent" className="!text-2xl text-secondary" />
                <div>
                  <div className="text-sm font-bold text-on-secondary-container">{t("needHelp")}</div>
                  <Link href="/passenger/support" className="mt-2 inline-block text-xs font-bold text-primary underline underline-offset-4">
                    {t("contactSupport")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/passenger/bookings"
            className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-bold text-on-surface shadow-sm"
          >
            {t("backBookings")}
          </Link>
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/15"
          >
            {t("goHome")}
          </Link>
        </div>
      </main>

      <footer className="border-t border-outline-variant/10 bg-surface-container-low px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-on-surface-variant md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/saafir-icon.svg" alt="" className="h-7 w-7" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-5 w-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/help" className="hover:text-primary">
              {t("footerHelp")}
            </Link>
            <Link href="/terms" className="hover:text-primary">
              {t("footerTerms")}
            </Link>
            <Link href="/privacy" className="hover:text-primary">
              {t("footerPrivacy")}
            </Link>
          </div>
          <div>
            © {new Date().getFullYear()} Saafir. {t("footerRights")}
          </div>
        </div>
      </footer>
    </>
  );
}
