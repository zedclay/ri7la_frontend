"use client";

import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { Booking } from "@/lib/types";

function modeIcon(mode: Booking["mode"]) {
  if (mode === "bus") return "directions_bus";
  if (mode === "train") return "train";
  return "directions_car";
}

function modeLabelKey(mode: Booking["mode"]) {
  if (mode === "bus") return "modeBus";
  if (mode === "train") return "modeTrain";
  return "modeCarpool";
}

export function CheckoutTripSummaryCard({ booking }: { booking: Booking }) {
  const t = useTranslations("checkout");
  const icon = modeIcon(booking.mode);
  const isPool = booking.mode === "carpool";

  return (
    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm">
            <MaterialIcon name={icon} className="!text-2xl text-primary" />
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
              {t(modeLabelKey(booking.mode))}
            </div>
            <div className="text-base font-extrabold text-on-surface">
              {booking.fromLabel} → {booking.toLabel}
            </div>
            <div className="mt-0.5 text-xs text-on-surface-variant">
              {booking.dateLabel} • {booking.providerOrDriverName}
            </div>
          </div>
        </div>
        {booking.seatLabel ? (
          <div className="rounded-full bg-primary-container px-3 py-1.5 text-center text-[10px] font-bold text-on-primary">
            {booking.seatLabel}
          </div>
        ) : null}
      </div>

      <div className="flex gap-4">
        <div className="flex w-4 shrink-0 flex-col items-center pt-1">
          <span className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/15" />
          <span className="my-2 min-h-[48px] w-0.5 flex-1 bg-gradient-to-b from-primary/40 to-tertiary/40" />
          <span className="h-3 w-3 rounded-full bg-tertiary ring-4 ring-tertiary/15" />
        </div>
        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {isPool ? t("pickup") : t("departure")}
            </div>
            <div className="mt-1 text-lg font-extrabold text-on-surface">{booking.fromLabel}</div>
            <div className="text-sm font-semibold text-primary">{booking.departureTime}</div>
            <div className="mt-1 text-xs text-on-surface-variant">
              {isPool ? booking.pickupDetail ?? "—" : booking.originDetail ?? booking.fromLabel}
            </div>
          </div>

          {booking.durationLabel ? (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-outline-variant/20" />
              <div className="flex items-center gap-2 rounded-full bg-surface-container-lowest px-3 py-1 text-[10px] font-extrabold text-primary shadow-sm">
                <MaterialIcon name={icon} className="!text-sm" />
                {booking.durationLabel}
              </div>
              <div className="h-px flex-1 bg-outline-variant/20" />
            </div>
          ) : null}

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {isPool ? t("dropoff") : t("arrival")}
            </div>
            <div className="mt-1 text-lg font-extrabold text-on-surface">{booking.toLabel}</div>
            {booking.arrivalTime ? (
              <div className="text-sm font-semibold text-tertiary">{booking.arrivalTime}</div>
            ) : null}
            <div className="mt-1 text-xs text-on-surface-variant">
              {isPool ? booking.dropoffDetail ?? "—" : booking.destinationDetail ?? booking.toLabel}
            </div>
          </div>
        </div>
      </div>

      {!isPool && booking.serviceClass ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-outline-variant/10 pt-4 text-xs">
          <span className="rounded-lg bg-surface-container-lowest px-3 py-1.5 font-semibold text-on-surface">
            {t("class")}: {booking.serviceClass}
          </span>
        </div>
      ) : null}

      {isPool && booking.vehicleLabel ? (
        <div className="mt-4 border-t border-outline-variant/10 pt-4 text-xs">
          <span className="font-bold text-on-surface-variant">{t("vehicle")}: </span>
          <span className="font-semibold text-on-surface">{booking.vehicleLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
