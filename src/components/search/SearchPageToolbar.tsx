"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StationAutocomplete } from "@/components/search/StationAutocomplete";
import {
  displayForCityKey,
  getPlaceByCityKey,
  placePrimaryLabel,
  resolveCityKeyFromParam,
} from "@/lib/algeriaPlaces";

type Mode = "all" | "carpool" | "bus" | "train";

function isoDay(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function shortPlaceLabel(cityKey: string, locale: string) {
  const p = getPlaceByCityKey(cityKey);
  if (!p) return cityKey;
  return placePrimaryLabel(p, locale);
}

function formatDateLabel(raw: string | undefined, locale: string) {
  const loc = locale === "ar" ? "ar-DZ" : "fr-DZ";
  const iso = raw?.trim() || isoDay(new Date());
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

export function SearchPageToolbar() {
  const t = useTranslations("common");
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelId = useId();

  const [expanded, setExpanded] = useState(false);
  const [fromKey, setFromKey] = useState("Algiers");
  /** `"any"` = all destinations from departure */
  const [toKey, setToKey] = useState<string>("Oran");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [mode, setMode] = useState<Mode>("all");

  const spKey = searchParams.toString();

  const syncDraftFromUrl = useCallback(() => {
    setFromKey(resolveCityKeyFromParam(searchParams.get("from") ?? undefined, "Algiers"));
    const rawTo = searchParams.get("to")?.trim() ?? "";
    if (rawTo.toLowerCase() === "any") setToKey("any");
    else setToKey(resolveCityKeyFromParam(rawTo || undefined, "Oran"));
    setDate((searchParams.get("date") ?? isoDay(new Date())).trim());
    setPassengers((searchParams.get("passengers") ?? "1").trim() || "1");
    const m = (searchParams.get("mode") ?? "all").trim();
    if (m === "carpool") setMode("carpool");
    else if (m === "bus") setMode("bus");
    else if (m === "train") setMode("train");
    else setMode("all");
  }, [searchParams]);

  useEffect(() => {
    if (expanded) return;
    syncDraftFromUrl();
  }, [expanded, spKey, syncDraftFromUrl]);

  function openEditor() {
    syncDraftFromUrl();
    setExpanded(true);
  }

  function applySearch() {
    const params = new URLSearchParams();
    params.set("from", resolveCityKeyFromParam(fromKey, "Algiers"));
    if (toKey === "any") params.set("to", "any");
    else params.set("to", resolveCityKeyFromParam(toKey, "Oran"));
    if (date.trim()) params.set("date", date.trim());
    const n = Math.min(8, Math.max(1, Number.parseInt(passengers, 10) || 1));
    params.set("passengers", String(n));
    if (mode !== "all") params.set("mode", mode);
    router.push(`/search?${params.toString()}`);
    setExpanded(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const cancelEdit = useCallback(() => {
    syncDraftFromUrl();
    setExpanded(false);
  }, [syncDraftFromUrl]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, cancelEdit]);

  const urlFromKey = resolveCityKeyFromParam(searchParams.get("from") ?? undefined, "Algiers");
  const urlDestinationAny = searchParams.get("to")?.trim().toLowerCase() === "any";
  const urlToKey = urlDestinationAny
    ? "Oran"
    : resolveCityKeyFromParam(searchParams.get("to") ?? undefined, "Oran");
  const urlDate = searchParams.get("date") ?? undefined;
  const urlPassCount = Math.max(
    1,
    Number.parseInt(searchParams.get("passengers") ?? "1", 10) || 1
  );

  const tabs: { id: Mode; label: string; icon: string }[] = [
    { id: "all", label: t("allModes"), icon: "apps" },
    { id: "carpool", label: t("modeCarpoolTab"), icon: "directions_car" },
    { id: "bus", label: t("modeBusTab"), icon: "directions_bus" },
    { id: "train", label: t("train"), icon: "train" },
  ];

  return (
    <section className="border-b border-outline-variant/15 bg-surface-container-lowest">
      {/*
        Only the summary row is sticky. The expanded editor sits in normal document flow below it
        so it pushes results down instead of painting over them (fixes overlap when z-stacked).
        Wilaya lists use a portal, so overflow-hidden here is safe.
      */}
      <div className="sticky top-[72px] z-40 border-b border-outline-variant/15 bg-surface-container-lowest/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-3 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 md:gap-5">
              <div className="flex min-w-0 items-center gap-2 text-on-surface">
                <MaterialIcon name="location_on" className="!text-xl shrink-0 text-primary" />
                <span className="truncate font-semibold" title={displayForCityKey(urlFromKey, locale)}>
                  {shortPlaceLabel(urlFromKey, locale)}
                </span>
                <MaterialIcon name="trending_flat" className="!text-lg shrink-0 text-outline" />
                <span
                  className="truncate font-semibold"
                  title={
                    urlDestinationAny ? tSearch("destinationAnySummary") : displayForCityKey(urlToKey, locale)
                  }
                >
                  {urlDestinationAny ? tSearch("destinationAnySummary") : shortPlaceLabel(urlToKey, locale)}
                </span>
              </div>
              <div className="hidden h-4 w-px bg-outline-variant/30 sm:block" />
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <MaterialIcon name="calendar_today" className="!text-base" />
                <span className="text-sm font-medium">{formatDateLabel(urlDate, locale)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <MaterialIcon name="person" className="!text-base" />
                <span className="text-sm font-medium">
                  {t("searchPassengersSummary", { count: urlPassCount })}
                </span>
              </div>
            </div>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => (expanded ? cancelEdit() : openEditor())}
              className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-md shadow-primary/15 transition-colors hover:opacity-95 active:scale-[0.98] md:px-5"
            >
              <MaterialIcon name={expanded ? "close" : "tune"} className="!text-base" />
              <span className="max-sm:hidden">{expanded ? tSearch("cancelEdit") : tSearch("modifySearch")}</span>
              <span className="sm:hidden">{expanded ? tSearch("cancelEditShort") : tSearch("modifySearchShort")}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative z-0 mx-auto max-h-[min(85vh,920px)] max-w-7xl overflow-y-auto border-t border-outline-variant/10 bg-surface-container-lowest px-6 pb-4 pt-4 md:px-8">
              <p className="mb-4 text-sm text-on-surface-variant">{tSearch("editSearchHint")}</p>

              <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const active = mode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setMode(tab.id)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                        active
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                      }`}
                    >
                      <MaterialIcon name={tab.icon} className="!text-base" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-end">
                <div className="space-y-2 lg:col-span-3">
                  <label className="ms-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {t("departure")}
                  </label>
                  <div className="relative">
                    <MaterialIcon
                      name="location_on"
                      className="pointer-events-none absolute start-3 top-1/2 !text-xl -translate-y-1/2 text-outline"
                    />
                    <StationAutocomplete
                      name="from"
                      value={fromKey}
                      onChange={setFromKey}
                      placeholder={t("departurePlaceholder")}
                      locale={locale}
                      inputClassName="w-full rounded-xl border-none bg-surface-container-low py-3.5 ps-11 pe-3 text-sm font-medium text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-3">
                  <label className="ms-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    {t("destination")}
                  </label>
                  <div className="relative">
                    <MaterialIcon
                      name="near_me"
                      className="pointer-events-none absolute start-3 top-1/2 !text-xl -translate-y-1/2 text-outline"
                    />
                    <StationAutocomplete
                      name="to"
                      value={toKey}
                      onChange={setToKey}
                      placeholder={t("destinationPlaceholder")}
                      locale={locale}
                      prependOptions={[
                        {
                          value: "any",
                          label: tSearch("destinationAnySelect"),
                          sublabel: tSearch("destinationAnySummary"),
                        },
                      ]}
                      inputClassName="w-full rounded-xl border-none bg-surface-container-low py-3.5 ps-11 pe-3 text-sm font-medium text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:col-span-4">
                  <div className="space-y-2">
                    <label className="ms-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      {t("date")}
                    </label>
                    <div className="relative">
                      <MaterialIcon
                        name="calendar_month"
                        className="pointer-events-none absolute start-2.5 top-1/2 !text-lg -translate-y-1/2 text-outline"
                      />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border-none bg-surface-container-low py-3.5 ps-10 pe-2 text-base font-medium text-on-surface focus:ring-2 focus:ring-primary-container md:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="ms-1 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      {t("passengers")}
                    </label>
                    <div className="relative">
                      <MaterialIcon
                        name="person"
                        className="pointer-events-none absolute start-2.5 top-1/2 !text-lg -translate-y-1/2 text-outline"
                      />
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                        className="w-full rounded-xl border-none bg-surface-container-low py-3.5 ps-10 pe-2 text-base font-medium text-on-surface focus:ring-2 focus:ring-primary-container md:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:col-span-2">
                  <span className="hidden text-xs font-semibold uppercase tracking-wider text-transparent lg:block">
                    —
                  </span>
                  <button
                    type="button"
                    onClick={applySearch}
                    className="gradient-primary subtle-shadow flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-on-primary transition-all hover:opacity-95 active:scale-[0.99]"
                  >
                    <MaterialIcon name="search" className="!text-xl" />
                    {tSearch("updateSearch")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}
