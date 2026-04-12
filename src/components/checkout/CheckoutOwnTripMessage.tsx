"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import type { Booking } from "@/lib/types";

export function CheckoutOwnTripMessage({ booking }: { booking: Booking }) {
  const t = useTranslations("checkout");
  const back = booking.contextBackHref ?? "/search";

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 text-center shadow-sm">
      <MaterialIcon name="directions_car" className="mx-auto !text-5xl text-primary" />
      <h1 className="mt-4 font-headline text-2xl font-extrabold text-on-surface">{t("ownTripTitle")}</h1>
      <p className="mt-2 text-sm text-on-surface-variant">{t("ownTripBody")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/driver/trips"
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-extrabold text-on-primary shadow-lg"
        >
          {t("ownTripManageTrips")}
        </Link>
        <Link
          href={back}
          className="inline-flex items-center justify-center rounded-full bg-surface-container-low px-8 py-3 text-sm font-extrabold text-on-surface"
        >
          {t("backToTrip")}
        </Link>
      </div>
    </div>
  );
}
