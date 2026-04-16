"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiPostJsonData } from "@/lib/api";
import { getAccessToken } from "@/lib/auth";
import { fetchUserMeClientCached } from "@/lib/userMeClientCache";
import {
  currentDriverDraftUserId,
  loadDriverOnboardingState,
  type DriverVehicleDraft,
} from "@/lib/driverOnboardingStorage";
import { getPlaceByCityKey, placePrimaryLabel } from "@/lib/algeriaPlaces";
import { WilayaPlaceSelect } from "@/components/driver/WilayaPlaceSelect";
import { CARPOOL_AMENITY_IDS, type CarpoolAmenityId } from "@/lib/carpoolAmenities";

function splitMakeModel(line: string): { carMake: string; carModel: string } {
  const t = line.trim();
  if (!t) return { carMake: "", carModel: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { carMake: t, carModel: "Vehicle" };
  const carMake = t.slice(0, i).trim();
  const carModel = t.slice(i + 1).trim() || "Vehicle";
  return { carMake, carModel };
}

function plateFromVehicle(v: DriverVehicleDraft): string {
  return [v.plateSequence, v.plateModelCode, v.plateWilayaCode].map((s) => s.trim()).filter(Boolean).join(" ").trim();
}

function defaultDepartureLocal(): string {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DriverCreateTripForm() {
  const t = useTranslations("driverTripNew");
  const locale = useLocale();
  const router = useRouter();

  const [originKey, setOriginKey] = useState("Algiers");
  const [destKey, setDestKey] = useState("Oran");
  const [originName, setOriginName] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [departureLocal, setDepartureLocal] = useState(defaultDepartureLocal);
  const [seatsTotal, setSeatsTotal] = useState(3);
  const [priceAmount, setPriceAmount] = useState(1200);
  const [luggagePolicy, setLuggagePolicy] = useState<"NONE" | "SMALL" | "MEDIUM" | "LARGE">("MEDIUM");
  const [allowInstantBooking, setAllowInstantBooking] = useState(true);
  const [tripRules, setTripRules] = useState("");
  const [driverNote, setDriverNote] = useState("");
  const [womenOnly, setWomenOnly] = useState(false);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [amenities, setAmenities] = useState<Record<CarpoolAmenityId, boolean>>(() => {
    const o = {} as Record<CarpoolAmenityId, boolean>;
    for (const id of CARPOOL_AMENITY_IDS) o[id] = false;
    return o;
  });
  const [submitting, setSubmitting] = useState<"idle" | "draft" | "publish">("idle");
  const [error, setError] = useState<string | null>(null);
  const [driverFullyVerified, setDriverFullyVerified] = useState<boolean | null>(null);

  const originPlace = useMemo(() => getPlaceByCityKey(originKey), [originKey]);
  const destPlace = useMemo(() => getPlaceByCityKey(destKey), [destKey]);

  useEffect(() => {
    if (!getAccessToken()) {
      setDriverFullyVerified(null);
      return;
    }
    let cancelled = false;
    void fetchUserMeClientCached().then((me) => {
      if (cancelled || !me) return;
      setDriverFullyVerified(me.driverVerification?.fullyVerified ?? false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const depLabel = originPlace ? placePrimaryLabel(originPlace, locale) : originKey;
    const arrLabel = destPlace ? placePrimaryLabel(destPlace, locale) : destKey;
    const depAt = new Date(departureLocal);
    const earnings = seatsTotal * priceAmount;
    return { depLabel, arrLabel, depAt, earnings };
  }, [originPlace, destPlace, originKey, destKey, locale, departureLocal, seatsTotal, priceAmount]);

  function buildCarpoolDetails() {
    const uid = currentDriverDraftUserId();
    const v: DriverVehicleDraft | null = uid ? loadDriverOnboardingState(uid).vehicle : null;
    const amenityList = CARPOOL_AMENITY_IDS.filter((id) => amenities[id]);
    if (v?.vehicleLine?.trim()) {
      const { carMake, carModel } = splitMakeModel(v.vehicleLine);
      return {
        carMake: carMake || "Saafir",
        carModel: carModel || "Vehicle",
        carColor: v.colorPreset === "other" ? v.colorCustom.trim() || undefined : undefined,
        plateNumber: plateFromVehicle(v) || undefined,
        luggagePolicy,
        smokingAllowed,
        petsAllowed,
        amenities: amenityList.length ? amenityList : undefined,
      };
    }
    return {
      carMake: "Saafir",
      carModel: "Vehicle",
      luggagePolicy,
      smokingAllowed,
      petsAllowed,
      amenities: amenityList.length ? amenityList : undefined,
    };
  }

  async function submit(publish: boolean) {
    setError(null);
    if (!getAccessToken()) {
      setError(t("errAuth"));
      return;
    }
    if (originKey === destKey) {
      setError(t("errSameCity"));
      return;
    }
    const dep = new Date(departureLocal);
    if (Number.isNaN(dep.getTime())) {
      setError(t("errDate"));
      return;
    }

    if (publish && driverFullyVerified === false) {
      setError(t("errVerification"));
      return;
    }

    setSubmitting(publish ? "publish" : "draft");
    try {
      const carpoolDetails = buildCarpoolDetails();
      const trip = await apiPostJsonData<{
        id: string;
        status: string;
      }>("/api/trips", {
        mode: "CARPOOL",
        originCity: originKey,
        originName: originName.trim() || (originPlace ? placePrimaryLabel(originPlace, "fr") : originKey),
        destinationCity: destKey,
        destinationName:
          destinationName.trim() || (destPlace ? placePrimaryLabel(destPlace, "fr") : destKey),
        departureAt: dep.toISOString(),
        seatsTotal,
        priceAmount,
        priceCurrency: "DZD",
        allowInstantBooking,
        tripRules: tripRules.trim() || undefined,
        driverNote: driverNote.trim() || undefined,
        womenOnly,
        carpoolDetails,
      });

      if (publish && trip.status === "DRAFT") {
        await apiPostJsonData(`/api/trips/${trip.id}/publish`, {});
      }
      router.push("/driver/trips");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errGeneric"));
    } finally {
      setSubmitting("idle");
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("title")}</h1>
          <p className="mt-1 text-on-surface-variant">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={submitting !== "idle"}
            onClick={() => void submit(false)}
            className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-extrabold text-on-surface active:scale-95 disabled:opacity-50"
          >
            {submitting === "draft" ? "…" : t("saveDraft")}
          </button>
          <button
            type="button"
            disabled={submitting !== "idle" || driverFullyVerified === false}
            onClick={() => void submit(true)}
            className="rounded-full bg-tertiary-container px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50"
          >
            {submitting === "publish" ? "…" : t("publish")}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container" role="alert">
          {error}
        </div>
      ) : null}

      {driverFullyVerified === false ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-on-surface">
          <div className="font-extrabold text-on-surface">{t("verificationGateTitle")}</div>
          <p className="mt-1 text-on-surface-variant">{t("verificationGateBody")}</p>
          <Link href="/driver/onboarding" className="mt-3 inline-block text-sm font-extrabold text-primary underline">
            {t("verificationGateCta")}
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon name="route" className="!text-2xl text-primary" />
              <div className="text-lg font-extrabold text-on-surface">{t("routeSection")}</div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <WilayaPlaceSelect
                id="origin-wilaya"
                label={t("departureWilaya")}
                valueCityKey={originKey}
                onChange={(key) => setOriginKey(key)}
              />
              <WilayaPlaceSelect
                id="dest-wilaya"
                label={t("destinationWilaya")}
                valueCityKey={destKey}
                onChange={(key) => setDestKey(key)}
              />
              <div className="md:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("pickupDropoff")}</div>
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input
                    value={originName}
                    onChange={(e) => setOriginName(e.target.value)}
                    className="rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("pickupPlaceholder")}
                  />
                  <input
                    value={destinationName}
                    onChange={(e) => setDestinationName(e.target.value)}
                    className="rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("dropoffPlaceholder")}
                  />
                </div>
                <p className="mt-2 text-xs text-on-surface-variant">{t("pickupHint")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon name="calendar_month" className="!text-2xl text-primary" />
              <div className="text-lg font-extrabold text-on-surface">{t("scheduleSection")}</div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("departureDateTime")}</div>
                <input
                  type="datetime-local"
                  value={departureLocal}
                  onChange={(e) => setDepartureLocal(e.target.value)}
                  className="mt-2 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("seats")}</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <button
                    type="button"
                    className="rounded-lg bg-white/70 px-3 py-1 text-sm font-extrabold text-on-surface active:scale-95"
                    onClick={() => setSeatsTotal((s) => Math.max(1, s - 1))}
                  >
                    −
                  </button>
                  <div className="text-sm font-extrabold text-on-surface">{seatsTotal}</div>
                  <button
                    type="button"
                    className="rounded-lg bg-white/70 px-3 py-1 text-sm font-extrabold text-on-surface active:scale-95"
                    onClick={() => setSeatsTotal((s) => Math.min(8, s + 1))}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("priceSeat")}</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <input
                    type="number"
                    min={100}
                    step={50}
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value) || 0)}
                    className="w-full border-none bg-transparent text-sm font-semibold text-on-surface outline-none"
                  />
                  <span className="text-xs font-extrabold text-on-surface-variant">DZD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon name="tune" className="!text-2xl text-primary" />
              <div className="text-lg font-extrabold text-on-surface">{t("prefsSection")}</div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-surface-container-low p-6">
                <div className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">{t("luggage")}</div>
                <select
                  value={luggagePolicy}
                  onChange={(e) => setLuggagePolicy(e.target.value as typeof luggagePolicy)}
                  className="mt-3 w-full rounded-xl border-none bg-white px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="NONE">{t("luggageNone")}</option>
                  <option value="SMALL">{t("luggageSmall")}</option>
                  <option value="MEDIUM">{t("luggageMedium")}</option>
                  <option value="LARGE">{t("luggageLarge")}</option>
                </select>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-6">
                <div className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">{t("bookingMode")}</div>
                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    onClick={() => setAllowInstantBooking(true)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left ${
                      allowInstantBooking ? "border-primary bg-white" : "border-outline-variant/20 bg-white/60"
                    }`}
                  >
                    <div className="text-sm font-extrabold text-on-surface">{t("instantBooking")}</div>
                    <div className="text-xs text-on-surface-variant">{t("instantBookingHint")}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowInstantBooking(false)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left ${
                      !allowInstantBooking ? "border-primary bg-white" : "border-outline-variant/20 bg-white/60"
                    }`}
                  >
                    <div className="text-sm font-extrabold text-on-surface">{t("manualBooking")}</div>
                    <div className="text-xs text-on-surface-variant">{t("manualBookingHint")}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <MaterialIcon name="gavel" className="!text-2xl text-primary" />
                <div className="text-lg font-extrabold text-on-surface">{t("passengerInfoSection")}</div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="trip-rules">
                    {t("tripRulesLabel")}
                  </label>
                  <textarea
                    id="trip-rules"
                    value={tripRules}
                    onChange={(e) => setTripRules(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="mt-2 w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("tripRulesHint")}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="driver-note">
                    {t("driverNoteLabel")}
                  </label>
                  <textarea
                    id="driver-note"
                    value={driverNote}
                    onChange={(e) => setDriverNote(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="mt-2 w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    placeholder={t("driverNoteHint")}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                  <input
                    type="checkbox"
                    checked={womenOnly}
                    onChange={(e) => setWomenOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-outline text-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface">{t("womenOnlyLabel")}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                  <input
                    type="checkbox"
                    checked={petsAllowed}
                    onChange={(e) => setPetsAllowed(e.target.checked)}
                    className="h-4 w-4 rounded border-outline text-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface">{t("petsAllowedLabel")}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                  <input
                    type="checkbox"
                    checked={smokingAllowed}
                    onChange={(e) => setSmokingAllowed(e.target.checked)}
                    className="h-4 w-4 rounded border-outline text-primary"
                  />
                  <span className="text-sm font-semibold text-on-surface">{t("smokingAllowedLabel")}</span>
                </label>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("vehicleComfortTitle")}</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {CARPOOL_AMENITY_IDS.map((id) => (
                      <label key={id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={amenities[id]}
                          onChange={(e) => setAmenities((prev) => ({ ...prev, [id]: e.target.checked }))}
                          className="h-4 w-4 shrink-0 rounded border-outline text-primary"
                        />
                        <span className="text-sm font-medium text-on-surface">
                          {t(`amenity_${id}` as Parameters<typeof t>[0])}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
          </div>

        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="text-sm font-extrabold">{t("summaryTitle")}</div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">{t("summaryDep")}</div>
                <div className="max-w-[min(100%,14rem)] text-right">
                  <div className="font-extrabold">{summary.depLabel}</div>
                  {originName.trim() ? (
                    <div className="mt-1 break-words text-xs font-semibold opacity-90">{originName.trim()}</div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">{t("summaryArr")}</div>
                <div className="max-w-[min(100%,14rem)] text-right">
                  <div className="font-extrabold">{summary.arrLabel}</div>
                  {destinationName.trim() ? (
                    <div className="mt-1 break-words text-xs font-semibold opacity-90">{destinationName.trim()}</div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">{t("summaryWhen")}</div>
                <div className="max-w-[min(100%,14rem)] text-right font-extrabold">
                  {Number.isNaN(summary.depAt.getTime())
                    ? departureLocal || "—"
                    : summary.depAt.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/10 p-5">
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">{t("summaryEarnings")}</div>
              <div className="mt-2 text-3xl font-extrabold">
                {summary.earnings.toLocaleString(locale === "ar" ? "ar-DZ" : "fr-DZ")} DZD
              </div>
              <div className="mt-1 text-xs opacity-80">{t("summaryEarningsHint", { seats: seatsTotal, price: priceAmount })}</div>
            </div>
            <button
              type="button"
              disabled={submitting !== "idle"}
              onClick={() => void submit(true)}
              className="mt-6 w-full rounded-full bg-tertiary-container py-3 text-sm font-extrabold text-white active:scale-95 disabled:opacity-50"
            >
              {t("publish")}
            </button>
            <button
              type="button"
              disabled={submitting !== "idle"}
              onClick={() => void submit(false)}
              className="mt-3 w-full rounded-full bg-white/10 py-3 text-sm font-extrabold text-white active:scale-95 disabled:opacity-50"
            >
              {t("saveDraft")}
            </button>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <MaterialIcon name="shield_with_heart" className="!text-2xl text-primary" />
              <div>
                <div className="text-sm font-extrabold text-on-surface">{t("trustTitle")}</div>
                <div className="mt-1 text-xs text-on-surface-variant">{t("trustBody")}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <Link href="/driver/trips" className="flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4">
              <MaterialIcon name="arrow_back" className="!text-lg rtl:rotate-180" />
              {t("backTrips")}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
