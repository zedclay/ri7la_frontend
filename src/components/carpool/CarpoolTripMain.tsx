"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { carpoolAmenityIcon, type CarpoolAmenityId } from "@/lib/carpoolAmenities";

const DRIVER_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuACiuG45emmP2PT_nL48qq2PXmmbPthiNzgUdxsBqSaleduzt7Bs468e0XIR66cx1S46WpiT7a3395Ii96dSyL6iBaj5jXt7I-Dx0X8XMMaSt-t4CkwJaImM9okBxRQ6wWPr547hQjjmsS6DxBoq3BC7p3pgDsvtzxoeiXaqxdTZQ-hFTvzmrmpDw_SB-n0hfVPSBwWvXfE5P7rw-4nxsSfa2JxcCu9E_54kd2xdp4gd7FbK6CwmEJRxuZ5Zj_BmTpK8q1PzWYCocqJ";

const MAP_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAsSZsMqLdnUtsI1RODQemxmEYIL37ZgvZCDMy7a5iE3PjzzCb02pwir7GvvEYP1B0P8WmLHAkMhRU6zLws7RQ7bdKwrYVqNUSMbgNZa0gJzCa381__Adc3UyX2x3Z5KDvh_-bMISO-1v9U-xjQVF4bjtTvh-3OK_Cre_m-bX36_hCOwESVPcNol3ojcsmmveZcBuYfjKG2HdNwSwWFliid0By_HiHMTpaqfgfZaYW6etFb_DAO0XDrJ8fVk734Q39amRdqN0B0vG7w";

function Stars({ count }: { count: number }) {
  return (
    <div className="ml-auto flex text-tertiary">
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialIcon key={i} name="star" filled={i <= count} className="!text-xs" />
      ))}
    </div>
  );
}

const LUGGAGE_TO_I18N: Record<string, "luggageNone" | "luggageSmall" | "luggageMedium" | "luggageLarge"> = {
  NONE: "luggageNone",
  SMALL: "luggageSmall",
  MEDIUM: "luggageMedium",
  LARGE: "luggageLarge",
};

export type CarpoolTripViewModel = {
  id: string;
  coverImageUrl: string;
  title: string;
  dateLabel: string;
  departureTime: string;
  arrivalTime: string;
  durationLabel: string;
  durationHoursApprox: number | null;
  seatsAvailable: number;
  seatsTotal: number;
  driverName: string;
  vehicleLabel: string;
  plateNumber: string | null;
  originName: string;
  destinationName: string;
  luggagePolicy: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  womenOnly: boolean;
  driverNote: string | null;
  tripRules: string | null;
  amenities: string[];
};

export function CarpoolTripMain({ trip }: { trip: CarpoolTripViewModel }) {
  const t = useTranslations("carpoolTrip");
  const td = useTranslations("driverTripNew");

  const luggageKey = LUGGAGE_TO_I18N[trip.luggagePolicy] ?? "luggageMedium";
  const luggageLabel = td(luggageKey);
  const durationSecondary =
    trip.durationHoursApprox != null && Number.isFinite(trip.durationHoursApprox)
      ? t("duration", { hours: trip.durationHoursApprox })
      : trip.durationLabel;

  const validAmenities = trip.amenities.filter((a): a is CarpoolAmenityId =>
    [
      "AIR_CONDITIONING",
      "COMFORTABLE_SEATS",
      "USB_CHARGING",
      "WIFI",
      "LARGE_TRUNK",
      "EXTRA_LEGROOM",
    ].includes(a)
  );

  return (
    <div className="lg:col-span-8 space-y-8">
      <section className="rounded-xl bg-surface-container-lowest p-8 shadow-[0_12px_32px_-4px_rgba(0,83,91,0.04)]">
        <div className="relative mb-8 h-48 overflow-hidden rounded-xl bg-surface-container-low">
          <Image
            src={trip.coverImageUrl}
            alt={trip.vehicleLabel}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 900px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-extrabold text-on-surface">
            <MaterialIcon name="directions_car" className="!text-sm text-primary" />
            Carpool
          </div>
        </div>
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-xs font-bold uppercase tracking-wide text-on-secondary-fixed-variant">
              <MaterialIcon name="directions_car" filled className="!text-sm" />
              Carpool
            </span>
            <h1 className="mb-2 font-headline text-3xl font-bold text-on-surface">{trip.title}</h1>
            <p className="flex items-center gap-2 text-on-surface-variant">
              <MaterialIcon name="calendar_today" className="!text-sm" />
              {trip.dateLabel}
            </p>
          </div>
          <div className="text-right">
            <div className="mb-1 text-lg font-bold text-primary">{t("seatsAvailable", { count: trip.seatsAvailable })}</div>
            <div className="text-sm text-on-surface-variant">{durationSecondary}</div>
          </div>
        </div>

        <div className="relative flex items-center gap-8 py-6">
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl font-bold text-on-surface">{trip.departureTime}</div>
            <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
            <div className="h-16 w-0.5 border-l-2 border-dashed border-outline-variant" />
            <div className="h-3 w-3 rounded-full bg-tertiary ring-4 ring-tertiary/20" />
            <div className="text-2xl font-bold text-on-surface">{trip.arrivalTime}</div>
          </div>
          <div className="flex flex-col gap-12 pt-1">
            <div>
              <div className="text-lg font-bold text-on-surface">{trip.originName}</div>
              <div className="text-sm text-on-surface-variant">{t("pickupHint")}</div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-bold text-on-surface">{trip.destinationName}</div>
              <div className="text-sm text-on-surface-variant">{t("dropoffHint")}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl bg-surface-container-low p-6">
          <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Driver</h3>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="relative h-16 w-16 overflow-hidden rounded-full">
                <Image src={DRIVER_IMG} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-surface-container-low bg-primary p-1 text-white">
                <MaterialIcon name="verified" filled className="!text-xs" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xl font-bold text-on-surface">{trip.driverName}</div>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-surface-container-low p-6">
          <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t("vehicleComfort")}</h3>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-white/60 p-3">
              <MaterialIcon name="directions_car" className="!text-3xl text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xl font-bold text-on-surface">{trip.vehicleLabel}</div>
              <div className="mb-4 text-sm text-on-surface-variant">
                {trip.plateNumber ? `• ${trip.plateNumber}` : "—"}
              </div>
              {validAmenities.length === 0 ? (
                <p className="text-sm text-on-surface-variant">{t("noAmenities")}</p>
              ) : (
                <div className="space-y-2">
                  {validAmenities.map((id) => (
                    <div key={id} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <MaterialIcon name={carpoolAmenityIcon(id)} className="!text-lg shrink-0 text-primary" />
                      <span>{(td as (key: string) => string)(`amenity_${id}`)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_-4px_rgba(0,83,91,0.04)]">
        <div className="border-b border-surface-container p-6">
          <h3 className="text-lg font-bold text-on-surface">
            {t("pickup")} &amp; {t("dropoff")}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-6 p-6">
            <div className="flex gap-4">
              <div className="mt-1">
                <MaterialIcon name="location_on" className="!text-xl text-primary" />
              </div>
              <div>
                <div className="font-bold text-on-surface">
                  {t("pickup")}: {trip.originName}
                </div>
                <div className="text-sm text-on-surface-variant">{t("pickupHint")}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1">
                <MaterialIcon name="location_on" className="!text-xl text-tertiary" />
              </div>
              <div>
                <div className="font-bold text-on-surface">
                  {t("dropoff")}: {trip.destinationName}
                </div>
                <div className="text-sm text-on-surface-variant">{t("dropoffHint")}</div>
              </div>
            </div>
            {trip.driverNote?.trim() ? (
              <div className="rounded-xl bg-surface-container-low/80 p-4 text-sm text-on-surface">
                <span className="font-bold text-on-surface-variant">{t("driverNote")}: </span>
                {trip.driverNote.trim()}
              </div>
            ) : null}
          </div>
          <div className="relative h-72 w-full bg-surface-container md:h-full md:min-h-[280px]">
            <Image
              src={MAP_IMG}
              alt=""
              fill
              className="object-cover opacity-60 grayscale"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-primary shadow-lg backdrop-blur"
              >
                <MaterialIcon name="map" className="!text-sm" />
                Map
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-surface-container-low p-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-6 text-lg font-bold text-on-surface">{t("tripRules")}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-white/40 p-3">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="luggage" className="!text-xl text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface">{t("luggage")}</span>
                </div>
                <span className="text-sm font-bold text-primary">{luggageLabel}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/40 p-3">
                <div className="flex items-center gap-3">
                  <MaterialIcon name={trip.smokingAllowed ? "smoking_rooms" : "smoke_free"} className="!text-xl text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface">{t("smoking")}</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {trip.smokingAllowed ? t("smokingAllowed") : t("smokingNotAllowed")}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/40 p-3">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="pets" className="!text-xl text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface">{t("pets")}</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {trip.petsAllowed ? t("petsAllowed") : t("petsNotAllowed")}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/40 p-3">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="woman" className="!text-xl text-on-surface-variant" />
                  <span className="text-sm font-medium text-on-surface">{t("womenOnly")}</span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {trip.womenOnly ? t("womenOnlyOn") : t("womenOnlyOff")}
                </span>
              </div>
            </div>
            {trip.tripRules?.trim() ? (
              <div className="mt-6">
                <h4 className="mb-2 text-sm font-bold text-on-surface-variant">{t("tripRulesExtra")}</h4>
                <p className="whitespace-pre-wrap rounded-xl bg-white/50 p-4 text-sm text-on-surface">{trip.tripRules.trim()}</p>
              </div>
            ) : null}
          </div>
          <div>
            <h3 className="mb-6 text-lg font-bold text-on-surface">{t("driverNote")}</h3>
            <div className="relative rounded-xl bg-white/60 p-6 leading-relaxed text-on-surface-variant">
              <MaterialIcon
                name="format_quote"
                filled
                className="absolute -left-2 -top-3 !text-4xl text-primary/10"
              />
              {trip.driverNote?.trim() ? (
                <p className="italic">{trip.driverNote.trim()}</p>
              ) : (
                <p className="text-sm">{t("driverNoteEmpty")}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-headline text-xl font-bold text-on-surface">Reviews</h3>
          <div className="flex items-center gap-2 font-bold text-primary">
            <MaterialIcon name="star" filled />
            4.8/5 avg.
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container font-bold text-xs text-on-secondary-fixed-variant">
                M
              </div>
              <div className="text-sm font-bold text-on-surface">Meriem B.</div>
              <Stars count={5} />
            </div>
            <p className="text-sm italic text-on-surface-variant">
              &quot;Great driver, very safe and steady driving. Highly recommend for the Algiers-Oran route.&quot;
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-fixed font-bold text-xs text-on-primary-fixed-variant">
                K
              </div>
              <div className="text-sm font-bold text-on-surface">Karim R.</div>
              <Stars count={4} />
            </div>
            <p className="text-sm italic text-on-surface-variant">
              &quot;Punctual and clean car. Communication was very easy through the app.&quot;
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
