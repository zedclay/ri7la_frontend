"use client";

import { useLocale } from "next-intl";
import { useMemo } from "react";
import { ALGERIA_PLACES, getPlaceByCityKey, placePrimaryLabel, type PlaceEntry } from "@/lib/algeriaPlaces";

type Props = {
  id: string;
  label: string;
  valueCityKey: string;
  onChange: (cityKey: string, place: PlaceEntry) => void;
};

/**
 * One wilaya = one chef-lieu in `ALGERIA_PLACES`; selecting a wilaya sets the canonical `cityKey`.
 */
export function WilayaPlaceSelect({ id, label, valueCityKey, onChange }: Props) {
  const locale = useLocale();

  const byWilayaCode = useMemo(() => {
    const m = new Map<string, PlaceEntry>();
    for (const p of ALGERIA_PLACES) {
      m.set(p.wilayaCode, p);
    }
    return m;
  }, []);

  const sortedCodes = useMemo(
    () => [...byWilayaCode.keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [byWilayaCode],
  );

  const selected = getPlaceByCityKey(valueCityKey) ?? ALGERIA_PLACES.find((p) => p.cityKey === "Algiers") ?? ALGERIA_PLACES[0]!;

  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </label>
      <select
        id={id}
        value={selected.wilayaCode}
        onChange={(e) => {
          const place = byWilayaCode.get(e.target.value);
          if (place) onChange(place.cityKey, place);
        }}
        className="mt-2 w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary"
      >
        {sortedCodes.map((code) => {
          const p = byWilayaCode.get(code)!;
          const optLabel =
            locale === "ar" ? `${p.wilayaAr} (${p.wilayaCode})` : `${p.wilayaFr} (${p.wilayaCode})`;
          return (
            <option key={code} value={code}>
              {optLabel}
            </option>
          );
        })}
      </select>
      <p className="mt-1 text-xs text-on-surface-variant">
        {placePrimaryLabel(selected, locale)} · {locale === "ar" ? `ولاية ${selected.wilayaCode}` : `Wilaya ${selected.wilayaCode}`}
      </p>
    </div>
  );
}
