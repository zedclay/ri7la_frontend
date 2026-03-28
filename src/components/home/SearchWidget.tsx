"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "all" | "carpool" | "bus";

const tabs: { id: Mode; label: string }[] = [
  { id: "all", label: "Tout" },
  { id: "carpool", label: "Covoiturage" },
  { id: "bus", label: "Bus" },
];

export function SearchWidget() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("all");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    const form = new FormData(e.currentTarget);
    const from = String(form.get("from") ?? "").trim();
    const to = String(form.get("to") ?? "").trim();
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
    <div className="relative z-20 -mt-10 mx-auto max-w-5xl px-4 sm:-mt-14 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-foreground/5 sm:p-6">
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                mode === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <MapPinIcon className="h-3.5 w-3.5" />
                Départ
              </span>
              <input
                name="from"
                type="text"
                placeholder="Ville de départ"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoComplete="off"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <MapPinIcon className="h-3.5 w-3.5" />
                Destination
              </span>
              <input
                name="to"
                type="text"
                placeholder="Ville d&apos;arrivée"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoComplete="off"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <CalendarIcon className="h-3.5 w-3.5" />
                Date
              </span>
              <input
                name="date"
                type="date"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted">
                <UsersIcon className="h-3.5 w-3.5" />
                Passagers
              </span>
              <input
                name="passengers"
                type="number"
                min={1}
                max={8}
                defaultValue={1}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover lg:min-w-[140px]"
          >
            <SearchIcon className="h-4 w-4" />
            Rechercher
          </button>
        </form>
      </div>
    </div>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
