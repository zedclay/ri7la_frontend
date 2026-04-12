"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { loadConfirmedSnapshot, type ConfirmedBookingSnapshot } from "@/lib/confirmedBooking";
import { downloadTicketPdf, printTicketHtml, ticketQrImageUrl } from "@/lib/ticketDocument";
import type { Booking, PaymentMethod } from "@/lib/types";

function timelineStep(label: string, date: string, active: boolean) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={
          active
            ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary"
            : "flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-outline"
        }
      >
        <MaterialIcon name={active ? "check" : "schedule"} className="!text-xl" />
      </div>
      <div>
        <div className="text-sm font-bold text-on-surface">{label}</div>
        <div className="text-[10px] font-medium text-on-surface-variant">{date}</div>
      </div>
    </div>
  );
}

function paymentMethodLabel(m: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    edahabia: "Edahabia",
    cib: "CIB",
    baridimob: "Baridi Mob",
    bank_transfer: "Bank / CCP",
    cash: "Cash",
  };
  return map[m];
}

type Props = { bookingId: string; booking: Booking };

export function PassengerBookingDetailClient({ bookingId, booking }: Props) {
  const tMsg = useTranslations("messaging");
  const [snapshot, setSnapshot] = useState<ConfirmedBookingSnapshot | null>(null);
  const checkoutTripId = booking.tripId ?? bookingId;

  useEffect(() => {
    setSnapshot(loadConfirmedSnapshot(checkoutTripId));
  }, [checkoutTripId]);

  const passenger = snapshot?.passenger;
  const displayPaymentMethod = snapshot?.payment.method ?? booking.payment.method;
  const displayPaymentStatus = snapshot?.payment.status ?? booking.payment.status;
  const paidActive =
    displayPaymentStatus === "captured" || displayPaymentStatus === "not_required" || booking.payment.status === "captured";
  const fmtShort = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const flowDate = snapshot ? fmtShort(snapshot.confirmedAt) : "—";
  const paidLabel = paidActive ? (snapshot ? flowDate : "Paid") : "Pending";

  const tripModeLabel = booking.mode === "bus" ? "Bus" : booking.mode === "train" ? "Train" : "Carpool";
  const tripSubtitle =
    booking.mode === "bus" || booking.mode === "train"
      ? `${tripModeLabel} (${booking.providerOrDriverName})`
      : booking.providerOrDriverName;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Journey Timeline</div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {timelineStep("Booked", snapshot ? flowDate : "Demo / pending", true)}
            {timelineStep("Paid", paidLabel, paidActive)}
            {timelineStep(
              "Confirmed",
              snapshot ? flowDate : "—",
              booking.status === "confirmed" || booking.status === "completed"
            )}
            {timelineStep("Journey", booking.dateLabel, booking.status === "completed")}
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low">
                <MaterialIcon name="route" className="!text-2xl text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">Trip Summary</div>
                <div className="text-[10px] font-medium text-on-surface-variant">{tripSubtitle}</div>
              </div>
            </div>
            <div className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-bold text-on-surface-variant">
              {tripModeLabel}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container/10">
                <MaterialIcon name="location_on" className="!text-xl text-primary" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Origin</div>
                <div className="mt-1 text-lg font-extrabold text-on-surface">{booking.fromLabel}</div>
                <div className="text-sm font-bold text-primary-container">{booking.departureTime}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-tertiary-fixed/30">
                <MaterialIcon name="flag" className="!text-xl text-tertiary" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Destination</div>
                <div className="mt-1 text-lg font-extrabold text-on-surface">{booking.toLabel}</div>
                {booking.arrivalTime && (
                  <div className="text-sm font-bold text-tertiary-container">{booking.arrivalTime}</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-surface-container-low p-5 md:grid-cols-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Assigned seat</div>
              <div className="mt-1 flex items-center gap-2 text-sm font-extrabold text-on-surface">
                <MaterialIcon name="event_seat" className="!text-lg" />
                {booking.seatLabel ?? "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Payment</div>
              <div className="mt-1 text-sm font-extrabold text-on-surface">
                {paymentMethodLabel(displayPaymentMethod).toUpperCase()} •{" "}
                <span className="text-primary-container">{displayPaymentStatus.replaceAll("_", " ")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-bold text-on-surface">Passenger & Payment</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Total{" "}
              {(snapshot?.pricing.total ?? booking.totalPrice.amount).toLocaleString("fr-DZ")}{" "}
              {snapshot?.pricing.currency ?? booking.totalPrice.currency}
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant">
                {(passenger?.fullName ?? "?").trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <div className="text-sm font-bold text-on-surface">
                  {passenger?.fullName ?? "Complete checkout to see passenger details"}
                </div>
                {passenger ? (
                  <>
                    <div className="text-[10px] font-medium text-on-surface-variant">+213 {passenger.phone}</div>
                    <div className="text-[10px] font-medium text-on-surface-variant">{passenger.email}</div>
                  </>
                ) : (
                  <div className="text-[10px] font-medium text-on-surface-variant">
                    <Link href={`/passenger/checkout/${checkoutTripId}/details`} className="font-bold text-primary underline">
                      Open checkout
                    </Link>{" "}
                    to add your details.
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-low px-4 py-3 text-sm font-bold text-on-surface">
              Payment Method:{" "}
              <span className="text-primary-container">{paymentMethodLabel(displayPaymentMethod)}</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 text-sm font-bold text-on-surface">Digital Ticket</div>
          <div className="flex h-52 items-center justify-center rounded-xl bg-surface-container-low">
            {snapshot ? (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-outline">Digital ticket</div>
                  <div className="text-[10px] font-bold text-outline">{booking.referenceCode}</div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ticketQrImageUrl(snapshot, 160)}
                  width={160}
                  height={160}
                  className="h-40 w-40"
                  alt=""
                />
              </div>
            ) : (
              <div className="px-4 text-center text-sm text-on-surface-variant">
                QR appears after you complete checkout confirmation for this booking.
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={!snapshot}
            onClick={() => {
              if (snapshot) void downloadTicketPdf(snapshot).catch(() => {});
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MaterialIcon name="download" className="!text-xl" />
            Download E-Ticket
          </button>
          <button
            type="button"
            disabled={!snapshot}
            onClick={() => snapshot && printTicketHtml(snapshot)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-low py-3 text-sm font-bold text-on-surface active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MaterialIcon name="print" className="!text-xl" />
            Print Ticket
          </button>

          {booking.mode === "carpool" &&
          (booking.status === "requested" ||
            booking.status === "awaiting_approval" ||
            booking.status === "confirmed") ? (
            <Link
              href={`/passenger/messages?booking=${encodeURIComponent(bookingId)}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary/30 bg-primary-container/15 py-3 text-sm font-extrabold text-primary-container active:scale-[0.99]"
            >
              <MaterialIcon name="chat" className="!text-xl" />
              {tMsg("ctaMessageDriver")}
            </Link>
          ) : null}

          <div className="mt-6 rounded-xl bg-secondary-container/30 p-4">
            <div className="flex items-start gap-3">
              <MaterialIcon name="support_agent" className="!text-2xl text-secondary" />
              <div>
                <div className="text-sm font-bold text-on-secondary-container">Need Help?</div>
                <Link href="/passenger/support" className="mt-1 block text-xs font-bold text-primary underline underline-offset-4">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>

          <button type="button" className="mt-4 w-full text-center text-xs font-bold text-error">
            Cancel Booking
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className="h-44 bg-gradient-to-tr from-primary/10 to-primary-container/10" />
          <div className="p-6">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-surface-container-low py-3 text-sm font-bold text-on-surface active:scale-95"
            >
              <MaterialIcon name="map" className="!text-xl text-primary" />
              View Live Route
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
