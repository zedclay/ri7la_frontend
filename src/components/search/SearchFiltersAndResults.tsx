"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { apiGetJsonData } from "@/lib/api";
import { displayForCityKey, resolveCityKeyFromParam } from "@/lib/algeriaPlaces";
import { busCoverImage, coverForCarMake, trainCoverImage } from "@/lib/coverImages";
import { splitTicketPrice } from "@/lib/tripPricing";
import { mockSearchResults } from "@/lib/mockData";
import { allowDemoMocks } from "@/lib/runtimeEnv";
import type { SearchResult } from "@/lib/types";

const DRIVER_IMG =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80";

type TimeSlot = "morning" | "afternoon" | "evening" | null;

function timeToMinutes(t: string) {
  const m = t.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return Number.POSITIVE_INFINITY;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return Number.POSITIVE_INFINITY;
  return hh * 60 + mm;
}

function durationToMinutes(label: string) {
  const h = label.match(/(\d+)\s*h/);
  const m = label.match(/(\d+)\s*m/);
  const hh = h ? Number(h[1]) : 0;
  const mm = m ? Number(m[1]) : 0;
  return hh * 60 + mm;
}

function slotForDepartureTime(t: string): Exclude<TimeSlot, null> | "unknown" {
  const mins = timeToMinutes(t);
  if (!Number.isFinite(mins)) return "unknown";
  if (mins >= 6 * 60 && mins < 12 * 60) return "morning";
  if (mins >= 12 * 60 && mins < 18 * 60) return "afternoon";
  return "evening";
}

function itemPrice(item: SearchResult) {
  if (item.mode === "carpool") return item.pricePerSeat.amount;
  return item.baseFare.amount + item.serviceFee.amount;
}

function stripCity(label: string) {
  const first = label.split("(")[0]?.trim();
  return first && first.length > 0 ? first : label.trim();
}

function isoDay(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type TripSearchPage = {
  items: TripSearchRow[];
  total: number;
  limit: number;
  offset: number;
};

type TripSearchRow = {
  id: string;
  mode: "CARPOOL" | "BUS" | "TRAIN";
  status: string;
  originCity: string;
  originName: string;
  destinationCity: string;
  destinationName: string;
  departureAt: string;
  arrivalAt: string | null;
  seatsTotal: number;
  seatsAvailable: number;
  priceAmount: number;
  priceCurrency: "DZD";
  allowInstantBooking: boolean;
  coverImageUrl?: string | null;
  owner?: { id: string; fullName: string } | null;
  carpoolDetails?: { carMake: string; carModel: string; carColor: string | null } | null;
  busDetails?: { lineName: string; busType: string | null } | null;
};

function formatDurationFromMs(ms: number): string {
  const mins = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function busServiceClass(busType: string | null | undefined): "Economy" | "Comfort" | "Premium" {
  const s = (busType ?? "").toLowerCase();
  if (s.includes("premium")) return "Premium";
  if (s.includes("comfort")) return "Comfort";
  return "Economy";
}

function trainServiceClass(busType: string | null | undefined): "Standard" | "First" {
  const s = (busType ?? "").toLowerCase();
  if (s.includes("first")) return "First";
  return "Standard";
}

function mapCarpoolRows(rows: TripSearchRow[]): SearchResult[] {
  return rows.map((t) => {
    const dep = new Date(t.departureAt);
    const arr = t.arrivalAt ? new Date(t.arrivalAt) : null;
    const hhmm = (d: Date) => d.toISOString().slice(11, 16);
    const dateLabel = dep.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const durationLabel =
      arr && Number.isFinite(arr.getTime())
        ? formatDurationFromMs(arr.getTime() - dep.getTime())
        : "—";
    const vehicleLabel = t.carpoolDetails
      ? `${t.carpoolDetails.carMake} ${t.carpoolDetails.carModel}${t.carpoolDetails.carColor ? ` • ${t.carpoolDetails.carColor}` : ""}`
      : "Car";
    const coverImageUrl = t.coverImageUrl?.trim() || coverForCarMake(t.carpoolDetails?.carMake ?? null);

    return {
      id: t.id,
      mode: "carpool",
      coverImageUrl,
      fromLabel: t.originName,
      toLabel: t.destinationName,
      pickupLabel: `Pickup: ${t.originName}`,
      dropoffLabel: `Drop-off: ${t.destinationName}`,
      departureTime: hhmm(dep),
      arrivalTime: arr ? hhmm(arr) : hhmm(new Date(dep.getTime() + 4 * 60 * 60 * 1000)),
      durationLabel,
      dateLabel,
      pricePerSeat: { currency: "DZD", amount: t.priceAmount },
      seatsLeft: t.seatsAvailable,
      driverName: t.owner?.fullName ?? "Driver",
      driverRating: 4.7,
      vehicleLabel,
      luggageIncluded: true,
      instantBooking: t.allowInstantBooking,
      womenOnly: false,
    };
  });
}

function mapBusRows(rows: TripSearchRow[]): SearchResult[] {
  return rows.map((t) => {
    const dep = new Date(t.departureAt);
    const arr = t.arrivalAt ? new Date(t.arrivalAt) : null;
    const hhmm = (d: Date) => d.toISOString().slice(11, 16);
    const dateLabel = dep.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const durationLabel =
      arr && Number.isFinite(arr.getTime())
        ? formatDurationFromMs(arr.getTime() - dep.getTime())
        : "—";
    const { baseFare, serviceFee } = splitTicketPrice(t.priceAmount);
    const providerName = t.busDetails?.lineName?.split("·")[0]?.trim() ?? "Bus operator";
    const coverImageUrl = t.coverImageUrl?.trim() || busCoverImage();

    return {
      id: t.id,
      mode: "bus",
      providerName,
      coverImageUrl,
      serviceClass: busServiceClass(t.busDetails?.busType),
      fromLabel: t.originName,
      toLabel: t.destinationName,
      departureTime: hhmm(dep),
      arrivalTime: arr ? hhmm(arr) : hhmm(new Date(dep.getTime() + 5 * 60 * 60 * 1000)),
      durationLabel,
      dateLabel,
      baseFare: { currency: "DZD", amount: baseFare },
      serviceFee: { currency: "DZD", amount: serviceFee },
      availableSeats: t.seatsAvailable,
      instantConfirmation: t.allowInstantBooking,
    };
  });
}

function mapTrainRows(rows: TripSearchRow[]): SearchResult[] {
  return rows.map((t) => {
    const dep = new Date(t.departureAt);
    const arr = t.arrivalAt ? new Date(t.arrivalAt) : null;
    const hhmm = (d: Date) => d.toISOString().slice(11, 16);
    const dateLabel = dep.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const durationLabel =
      arr && Number.isFinite(arr.getTime())
        ? formatDurationFromMs(arr.getTime() - dep.getTime())
        : "—";
    const { baseFare, serviceFee } = splitTicketPrice(t.priceAmount);
    const providerName = "SNTF";
    const coverImageUrl = t.coverImageUrl?.trim() || trainCoverImage();

    return {
      id: t.id,
      mode: "train",
      providerName,
      coverImageUrl,
      serviceClass: trainServiceClass(t.busDetails?.busType),
      fromLabel: t.originName,
      toLabel: t.destinationName,
      departureTime: hhmm(dep),
      arrivalTime: arr ? hhmm(arr) : hhmm(new Date(dep.getTime() + 5 * 60 * 60 * 1000)),
      durationLabel,
      dateLabel,
      baseFare: { currency: "DZD", amount: baseFare },
      serviceFee: { currency: "DZD", amount: serviceFee },
      availableSeats: t.seatsAvailable,
      instantConfirmation: t.allowInstantBooking,
    };
  });
}

export function SearchFiltersAndResults() {
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") ?? "all").trim();
  const [carpool, setCarpool] = useState(() => initialMode === "all" || initialMode === "carpool");
  const [bus, setBus] = useState(() => initialMode === "all" || initialMode === "bus");
  const [train, setTrain] = useState(() => initialMode === "all" || initialMode === "train");
  const [priceMax, setPriceMax] = useState(5000);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>(null);
  const [luggage, setLuggage] = useState(true);
  const [instantBooking, setInstantBooking] = useState(false);
  const [sortBy, setSortBy] = useState("Cheapest");
  const [apiCarpools, setApiCarpools] = useState<SearchResult[]>([]);
  const [apiBuses, setApiBuses] = useState<SearchResult[]>([]);
  const [apiTrains, setApiTrains] = useState<SearchResult[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [apiFailedCarpool, setApiFailedCarpool] = useState(false);
  const [apiFailedBus, setApiFailedBus] = useState(false);
  const [apiFailedTrain, setApiFailedTrain] = useState(false);

  const spKey = searchParams.toString();
  useEffect(() => {
    const m = (searchParams.get("mode") ?? "all").trim();
    setCarpool(m === "all" || m === "carpool");
    setBus(m === "all" || m === "bus");
    setTrain(m === "all" || m === "train");
  }, [spKey, searchParams]);

  function selectTimeSlot(id: "morning" | "afternoon" | "evening") {
    setTimeSlot(id);
  }

  const requestParams = useMemo(() => {
    const from = resolveCityKeyFromParam(
      stripCity((searchParams.get("from") ?? "Algiers").trim()),
      "Algiers"
    );
    const rawTo = stripCity((searchParams.get("to") ?? "Oran").trim());
    const destinationAny = rawTo.toLowerCase() === "any";
    const to = destinationAny ? null : resolveCityKeyFromParam(rawTo, "Oran");
    const date = (searchParams.get("date") ?? isoDay(new Date())).trim();
    const mode = (searchParams.get("mode") ?? "all").trim();
    return { from, to, destinationAny, date, mode };
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setApiError(null);
      const { from, to, date } = requestParams;

      if (!carpool) {
        setApiCarpools([]);
        setApiFailedCarpool(false);
      }
      if (!bus) {
        setApiBuses([]);
        setApiFailedBus(false);
      }
      if (!train) {
        setApiTrains([]);
        setApiFailedTrain(false);
      }

      const jobs: Promise<void>[] = [];

      if (carpool) {
        jobs.push(
          (async () => {
            try {
              const qs = new URLSearchParams({ fromCity: from, date, mode: "CARPOOL" });
              if (to) qs.set("toCity", to);
              const page = await apiGetJsonData<TripSearchPage>(`/api/trips/search?${qs.toString()}`);
              if (cancelled) return;
              setApiFailedCarpool(false);
              setApiCarpools(mapCarpoolRows(page.items));
            } catch (e) {
              if (cancelled) return;
              setApiFailedCarpool(true);
              setApiCarpools([]);
              setApiError(e instanceof Error ? e.message : "Failed to load carpool offers");
            }
          })()
        );
      }

      if (bus) {
        jobs.push(
          (async () => {
            try {
              const qs = new URLSearchParams({ fromCity: from, date, mode: "BUS" });
              if (to) qs.set("toCity", to);
              const page = await apiGetJsonData<TripSearchPage>(`/api/trips/search?${qs.toString()}`);
              if (cancelled) return;
              setApiFailedBus(false);
              setApiBuses(mapBusRows(page.items));
            } catch (e) {
              if (cancelled) return;
              setApiFailedBus(true);
              setApiBuses([]);
              setApiError((prev) => prev ?? (e instanceof Error ? e.message : "Failed to load bus offers"));
            }
          })()
        );
      }

      if (train) {
        jobs.push(
          (async () => {
            try {
              const qs = new URLSearchParams({ fromCity: from, date, mode: "TRAIN" });
              if (to) qs.set("toCity", to);
              const page = await apiGetJsonData<TripSearchPage>(`/api/trips/search?${qs.toString()}`);
              if (cancelled) return;
              setApiFailedTrain(false);
              setApiTrains(mapTrainRows(page.items));
            } catch (e) {
              if (cancelled) return;
              setApiFailedTrain(true);
              setApiTrains([]);
              setApiError((prev) => prev ?? (e instanceof Error ? e.message : "Failed to load train offers"));
            }
          })()
        );
      }

      await Promise.all(jobs);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [bus, carpool, train, requestParams, retryKey]);

  const chips = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];
    if (timeSlot === "afternoon")
      list.push({
        key: "afternoon",
        label: "Afternoon",
        onRemove: () => setTimeSlot(null),
      });
    if (timeSlot === "morning")
      list.push({
        key: "morning",
        label: "Morning",
        onRemove: () => setTimeSlot(null),
      });
    if (timeSlot === "evening")
      list.push({
        key: "evening",
        label: "Evening",
        onRemove: () => setTimeSlot(null),
      });
    if (luggage)
      list.push({
        key: "luggage",
        label: "Luggage",
        onRemove: () => setLuggage(false),
      });
    return list;
  }, [timeSlot, luggage]);

  function clearAllFilters() {
    setTimeSlot(null);
    setLuggage(false);
    setInstantBooking(false);
  }

  const visibleResults = useMemo(() => {
    const useMocks = allowDemoMocks();
    const carpoolList =
      useMocks && carpool && apiFailedCarpool ? mockSearchResults.filter((r) => r.mode === "carpool") : apiCarpools;
    const busList = useMocks && bus && apiFailedBus ? mockSearchResults.filter((r) => r.mode === "bus") : apiBuses;
    const trainList =
      useMocks && train && apiFailedTrain ? mockSearchResults.filter((r) => r.mode === "train") : apiTrains;

    const base = [
      ...(carpool ? carpoolList : []),
      ...(bus ? busList : []),
      ...(train ? trainList : []),
    ] as SearchResult[];

    const filtered = base.filter((r) => {
      if (r.mode === "carpool" && !carpool) return false;
      if (r.mode === "bus" && !bus) return false;
      if (r.mode === "train" && !train) return false;
      if (itemPrice(r) > priceMax) return false;
      if (timeSlot) {
        const slot = slotForDepartureTime(r.departureTime);
        if (slot !== timeSlot) return false;
      }
      if (r.mode === "carpool") {
        if (luggage && !r.luggageIncluded) return false;
        if (instantBooking && !r.instantBooking) return false;
      } else {
        if (instantBooking && !r.instantConfirmation) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortBy === "Cheapest") {
      sorted.sort((a, b) => itemPrice(a) - itemPrice(b));
    } else if (sortBy === "Fastest") {
      sorted.sort((a, b) => durationToMinutes(a.durationLabel) - durationToMinutes(b.durationLabel));
    } else if (sortBy === "Earliest") {
      sorted.sort((a, b) => timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime));
    }

    return sorted;
  }, [
    apiBuses,
    apiCarpools,
    apiFailedBus,
    apiFailedCarpool,
    apiFailedTrain,
    apiTrains,
    bus,
    carpool,
    instantBooking,
    luggage,
    priceMax,
    sortBy,
    timeSlot,
    train,
  ]);

  return (
    <>
      <aside className="col-span-12 space-y-8 lg:col-span-3">
        <div className="sticky top-40 space-y-6 rounded-xl bg-surface-container-low p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-on-surface">
            <MaterialIcon name="filter_list" className="!text-xl" />
            Filters
          </h3>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Transport Type
            </p>
            <div className="space-y-2">
              <label className="group flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={carpool}
                  onChange={(e) => setCarpool(e.target.checked)}
                  className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="text-on-surface transition-colors group-hover:text-primary">
                  Carpool
                </span>
              </label>
              <label className="group flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={bus}
                  onChange={(e) => setBus(e.target.checked)}
                  className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="text-on-surface transition-colors group-hover:text-primary">Bus</span>
              </label>
              <label className="group flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={train}
                  onChange={(e) => setTrain(e.target.checked)}
                  className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                />
                <span className="text-on-surface transition-colors group-hover:text-primary">Train</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Price Range
              </p>
              <span className="text-xs font-bold text-primary">{priceMax} DZD</span>
            </div>
            <input
              type="range"
              min={0}
              max={5000}
              step={100}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-outline-variant accent-primary"
            />
            <div className="flex justify-between text-[10px] font-medium text-on-surface-variant">
              <span>0 DZD</span>
              <span>5000 DZD</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Departure Time
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  { id: "morning" as const, label: "Morning", sub: "06:00-12:00" },
                  { id: "afternoon" as const, label: "Afternoon", sub: "12:00-18:00" },
                  { id: "evening" as const, label: "Evening", sub: "18:00-00:00" },
                ] as const
              ).map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => selectTimeSlot(slot.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
                    timeSlot === slot.id
                      ? "border-transparent bg-primary text-white shadow-sm"
                      : "border-transparent bg-surface-container-lowest text-on-surface hover:border-primary/30"
                  }`}
                >
                  {slot.label}
                  <span
                    className={
                      timeSlot === slot.id
                        ? "text-[10px] opacity-80"
                        : "text-[10px] text-on-surface-variant"
                    }
                  >
                    {slot.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Preferences
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">Luggage included</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={luggage}
                  onClick={() => setLuggage(!luggage)}
                  className={`relative h-5 w-10 rounded-full transition-colors ${luggage ? "bg-primary" : "bg-outline-variant"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${luggage ? "right-0.5" : "left-0.5"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface">Instant Booking</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={instantBooking}
                  onClick={() => setInstantBooking(!instantBooking)}
                  className={`relative h-5 w-10 rounded-full transition-colors ${instantBooking ? "bg-primary" : "bg-outline-variant"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${instantBooking ? "right-0.5" : "left-0.5"}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="col-span-12 space-y-6 lg:col-span-6">
        {apiError && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-on-error-container">
            <span>{apiError}</span>
            <button
              type="button"
              onClick={() => {
                setApiError(null);
                setRetryKey((k) => k + 1);
              }}
              className="rounded-full bg-on-error-container/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-on-error-container hover:bg-on-error-container/25"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-headline text-2xl font-bold text-on-surface">
                {visibleResults.length} results found
              </h1>
              {requestParams.destinationAny ? (
                <p className="mt-1 text-sm text-on-surface-variant">
                  {tSearch("destinationAnyBanner", { city: displayForCityKey(requestParams.from, locale) })}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2">
              <span className="text-xs font-semibold text-on-surface-variant">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer border-none bg-transparent p-0 text-xs font-bold text-primary focus:ring-0"
              >
                <option>Cheapest</option>
                <option>Fastest</option>
                <option>Earliest</option>
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <span
                  key={c.key}
                  className="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold text-on-secondary-fixed-variant"
                >
                  {c.label}
                  <button
                    type="button"
                    onClick={c.onRemove}
                    className="inline-flex rounded p-0.5 hover:bg-black/5"
                    aria-label={`Remove ${c.label}`}
                  >
                    <MaterialIcon name="close" className="!text-sm" />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-2 text-[11px] font-bold text-primary underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {visibleResults.length === 0 ? (
            <div className="rounded-xl bg-surface-container-lowest p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high">
                <MaterialIcon name="search_off" className="!text-2xl text-outline" />
              </div>
              <h2 className="mb-1 font-headline text-lg font-bold text-on-surface">
                No results match your filters
              </h2>
              <p className="text-sm text-on-surface-variant">
                Try increasing the price range or clearing some filters.
              </p>
            </div>
          ) : (
            visibleResults.map((item) => {
              const soldOut =
                item.mode === "carpool" ? item.seatsLeft === 0 : item.availableSeats === 0;
              const href =
                item.mode === "carpool"
                  ? `/carpool/${item.id}`
                  : item.mode === "bus"
                    ? `/bus/${item.id}`
                    : `/train/${item.id}`;

              return (
                <div
                  key={`${item.mode}-${item.id}`}
                  className={`group relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(0,83,91,0.08)] ${
                    soldOut ? "opacity-70 grayscale" : ""
                  }`}
                >
                  {item.coverImageUrl && (
                    <div className="relative mb-5 h-32 overflow-hidden rounded-xl">
                      <Image
                        src={item.coverImageUrl}
                        alt={item.mode === "carpool" ? item.vehicleLabel : item.providerName}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 700px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                      <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[10px] font-extrabold text-on-surface">
                        <MaterialIcon
                          name={item.mode === "carpool" ? "directions_car" : item.mode === "bus" ? "directions_bus" : "train"}
                          className="!text-sm text-primary"
                        />
                        {item.mode === "carpool" ? "Covoiturage" : item.mode === "bus" ? "Bus" : "Train"}
                      </div>
                    </div>
                  )}
                  {soldOut && (
                    <div className="absolute right-[-35px] top-4 z-10 rotate-45 bg-error py-1 pl-10 pr-10 text-[10px] font-bold text-white">
                      SOLD OUT
                    </div>
                  )}

                  <div className="flex flex-col gap-6 md:flex-row">
                    <div className="flex flex-1 items-center gap-8">
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <span className="text-xl font-bold text-on-surface">{item.departureTime}</span>
                        <div className="flex h-12 w-0.5 items-center justify-center rounded-full bg-outline-variant">
                          <span className="bg-surface px-1 text-[8px] font-bold tracking-widest text-outline-variant">
                            {item.durationLabel}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-on-surface">{item.arrivalTime}</span>
                      </div>

                      <div className="flex-1 space-y-6">
                        <div>
                          <p className="text-sm font-bold text-on-surface">{item.fromLabel}</p>
                          <p className="text-[10px] font-medium text-on-surface-variant">
                            {item.mode === "carpool" ? "Pickup" : "Terminal"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{item.toLabel}</p>
                          <p className="text-[10px] font-medium text-on-surface-variant">
                            {item.mode === "carpool" ? "Drop-off" : "Arrival"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between border-t border-outline-variant/15 pt-4 md:w-52 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-primary">
                          {itemPrice(item)} <span className="text-xs font-bold">DZD</span>
                        </p>

                        {item.mode === "carpool" ? (
                          <p className="text-[10px] font-bold text-tertiary">
                            {item.seatsLeft} seats left
                          </p>
                        ) : (
                          <span className="mt-1 inline-block rounded-full bg-secondary-container px-2 py-0.5 text-[9px] font-bold text-on-secondary-fixed-variant">
                            {item.serviceClass} Class
                          </span>
                        )}
                      </div>

                      {soldOut ? (
                        <button
                          type="button"
                          disabled
                          className="mt-4 w-full cursor-not-allowed rounded-full bg-surface-container-high py-2.5 text-xs font-bold text-on-surface-variant"
                        >
                          Full
                        </button>
                      ) : (
                        <Link
                          href={href}
                          className="mt-4 w-full rounded-full bg-gradient-primary py-2.5 text-center text-xs font-bold text-white transition-transform group-hover:scale-[1.02]"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/15 pt-4">
                    {item.mode === "carpool" ? (
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-container-high">
                          <Image
                            src={DRIVER_IMG}
                            alt={item.driverName}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                          <div className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center rounded-full border border-white bg-blue-500">
                            <MaterialIcon name="verified" filled className="!text-[8px] text-white" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-on-surface">{item.driverName}</span>
                            <span className="flex items-center gap-0.5 text-xs font-medium text-on-surface-variant">
                              <MaterialIcon name="star" filled className="!text-sm text-amber-500" />
                              {item.driverRating.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-[10px] font-medium text-on-surface-variant">
                            {item.vehicleLabel}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-high">
                          <MaterialIcon
                            name={item.mode === "bus" ? "directions_bus" : "train"}
                            className="!text-2xl text-primary"
                          />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-on-surface">{item.providerName}</span>
                          <p className="text-[10px] font-medium text-on-surface-variant">
                            Scheduled Service
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      {item.mode !== "carpool" && item.instantConfirmation && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                          <MaterialIcon name="bolt" className="!text-xs" />
                          Instant Confirmation
                        </div>
                      )}
                      {item.mode === "carpool" && item.instantBooking && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                          <MaterialIcon name="bolt" className="!text-xs" />
                          Instant Booking
                        </div>
                      )}
                      {item.mode === "carpool" && item.womenOnly && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary-container">
                          <MaterialIcon name="woman" className="!text-xs" />
                          Women-only
                        </div>
                      )}
                      {item.mode === "carpool" && item.luggageIncluded && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
                          <MaterialIcon name="luggage" className="!text-xs" />
                          Luggage included
                        </div>
                      )}
                      {item.mode !== "carpool" && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
                          <MaterialIcon name="chair" className="!text-xs" />
                          {item.availableSeats} Available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
