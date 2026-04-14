"use client";

import { useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { StationAutocomplete } from "@/components/search/StationAutocomplete";
import { resolveCityKeyFromParam } from "@/lib/algeriaPlaces";

type Mode = "all" | "carpool" | "bus" | "train";

export function SearchWidget() {
  const t = useTranslations("common");
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("all");
  const [fromKey, setFromKey] = useState("Algiers");
  /** `"any"` = all destinations from departure */
  const [toKey, setToKey] = useState<string>("Oran");

  const tabs: { id: Mode; label: string; icon: string }[] = [
    { id: "all", label: t("allModes"), icon: "apps" },
    { id: "carpool", label: t("modeCarpoolTab"), icon: "directions_car" },
    { id: "bus", label: t("modeBusTab"), icon: "directions_bus" },
    { id: "train", label: t("train"), icon: "train" },
  ];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    const form = new FormData(e.currentTarget);
    const from = resolveCityKeyFromParam(String(form.get("from") ?? "").trim(), "Algiers");
    const toRaw = String(form.get("to") ?? "").trim();
    const to = toRaw.toLowerCase() === "any" ? "any" : resolveCityKeyFromParam(toRaw, "Oran");
    const date = String(form.get("date") ?? "").trim();
    const passengers = String(form.get("passengers") ?? "1").trim();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (date) params.set("date", date);
    if (passengers) params.set("passengers", passengers);
    if (mode !== "all") params.set("mode", mode);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="relative z-30 -mt-16 px-6">
      <div className="glass-effect subtle-shadow mx-auto max-w-5xl rounded-xl bg-surface-container-lowest/90 p-6 md:p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high font-medium text-on-surface-variant hover:bg-surface-container-highest"
                }`}
              >
                <MaterialIcon name={tab.icon} className="!text-base" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="ms-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t("departure")}
              </label>
              <div className="relative">
                <MaterialIcon
                  name="location_on"
                  className="pointer-events-none absolute start-4 top-1/2 !text-xl -translate-y-1/2 text-outline"
                />
                <StationAutocomplete
                  name="from"
                  value={fromKey}
                  onChange={setFromKey}
                  placeholder={t("departurePlaceholder")}
                  locale={locale}
                  inputClassName="w-full rounded-lg border-none bg-surface-container-low py-4 ps-12 pe-4 font-medium text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ms-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                {t("destination")}
              </label>
              <div className="relative">
                <MaterialIcon
                  name="near_me"
                  className="pointer-events-none absolute start-4 top-1/2 !text-xl -translate-y-1/2 text-outline"
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
                  inputClassName="w-full rounded-lg border-none bg-surface-container-low py-4 ps-12 pe-4 font-medium text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary-container"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="ms-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t("date")}
                </label>
                <div className="relative">
                  <MaterialIcon
                    name="calendar_month"
                    className="pointer-events-none absolute start-3 top-1/2 !text-lg -translate-y-1/2 text-outline"
                  />
                  <input
                    name="date"
                    type="date"
                    className="w-full rounded-lg border-none bg-surface-container-low py-4 ps-10 pe-3 text-base font-medium text-on-surface focus:ring-2 focus:ring-primary-container md:text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="ms-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t("passengers")}
                </label>
                <div className="relative">
                  <MaterialIcon
                    name="person"
                    className="pointer-events-none absolute start-3 top-1/2 !text-lg -translate-y-1/2 text-outline"
                  />
                  <input
                    name="passengers"
                    type="number"
                    min={1}
                    max={8}
                    defaultValue={1}
                    className="w-full rounded-lg border-none bg-surface-container-low py-4 ps-10 pe-3 text-base font-medium text-on-surface focus:ring-2 focus:ring-primary-container md:text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="gradient-primary subtle-shadow flex items-center justify-center gap-2 rounded-lg py-4 font-bold text-on-primary transition-all hover:scale-[1.02] active:scale-95"
            >
              <MaterialIcon name="search" className="!text-2xl" />
              {t("searchButton")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
