"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  filterPlaces,
  filterQueryForDropdown,
  formatPlaceLine,
  getPlaceByCityKey,
  placePrimaryLabel,
  placeWilayaLabel,
  resolveCityKeyFromTypedText,
  type PlaceEntry,
} from "@/lib/algeriaPlaces";

export type StationPrependOption = {
  value: string;
  label: string;
  /** Shown under label in dropdown; optional */
  sublabel?: string;
};

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Typing “toutes” / “all” / etc. still resolves to the “any destination” prepend row. */
function matchesAnyDestinationAliases(o: StationPrependOption, qq: string) {
  if (o.value !== "any") return false;
  return (
    qq === "toutes" ||
    qq === "all" ||
    qq === "toutes destinations" ||
    qq === "all destinations" ||
    qq === norm("كل")
  );
}

type Props = {
  name: string;
  /** Canonical city key for form submit */
  value: string;
  onChange: (cityKey: string) => void;
  placeholder: string;
  locale: string;
  required?: boolean;
  /** Shown first in the list (e.g. “all destinations”); `value` is submitted as hidden field */
  prependOptions?: StationPrependOption[];
  /** Classes for the visible text input (e.g. padding for start icon) */
  inputClassName?: string;
  className?: string;
};

export function StationAutocomplete({
  name,
  value,
  onChange,
  placeholder,
  locale,
  required,
  prependOptions,
  inputClassName = "",
  className = "",
}: Props) {
  const listId = useId();
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    };
  }, []);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const selected = getPlaceByCityKey(value);
  const [inputText, setInputText] = useState(() => {
    const prep = prependOptions?.find((o) => o.value === value);
    if (prep) return prep.label;
    return selected ? formatPlaceLine(selected, locale) : value;
  });

  useEffect(() => {
    const prep = prependOptions?.find((o) => o.value === value);
    if (prep) {
      setInputText(prep.label);
      return;
    }
    const p = getPlaceByCityKey(value);
    setInputText(p ? formatPlaceLine(p, locale) : value);
  }, [value, locale, prependOptions]);

  /** Always list prepend rows first; do not hide them when the field shows a selected city (input text is non-empty). */
  const prependFiltered = useMemo(() => prependOptions ?? [], [prependOptions]);

  const suggestions = useMemo(() => {
    const prep = prependOptions?.find((o) => o.value === value);
    if (prep && norm(inputText.trim()) === norm(prep.label)) {
      return filterPlaces("");
    }
    const q = filterQueryForDropdown(inputText, selected, locale);
    return filterPlaces(q);
  }, [inputText, selected, locale, prependOptions, value]);

  const close = useCallback(() => {
    setOpen(false);
    setHighlight(0);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (!open || !inputRef.current) {
      setMenuBox(null);
      return;
    }
    const r = inputRef.current.getBoundingClientRect();
    setMenuBox({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [open]);

  useLayoutEffect(() => {
    updateMenuPosition();
  }, [open, suggestions.length, prependFiltered.length, inputText, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      close();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [close]);

  const syncFromText = useCallback(
    (text: string) => {
      const t = text.trim();
      const qq = norm(t);
      if (prependOptions?.length) {
        const hit = prependOptions.find(
          (o) =>
            norm(o.label) === qq ||
            (o.sublabel && norm(o.sublabel) === qq) ||
            matchesAnyDestinationAliases(o, qq)
        );
        if (hit) {
          if (hit.value !== value) onChange(hit.value);
          setInputText(hit.label);
          return;
        }
      }
      const next = resolveCityKeyFromTypedText(text, value);
      if (next !== value) onChange(next);
      const p = getPlaceByCityKey(next);
      setInputText(p ? formatPlaceLine(p, locale) : text.trim() || text);
    },
    [value, onChange, locale, prependOptions]
  );

  const pickPrepend = useCallback(
    (o: StationPrependOption) => {
      onChange(o.value);
      setInputText(o.label);
      close();
    },
    [onChange, close]
  );

  const pick = useCallback(
    (p: PlaceEntry) => {
      onChange(p.cityKey);
      setInputText(formatPlaceLine(p, locale));
      close();
    },
    [onChange, locale, close]
  );

  const onInputChange = (s: string) => {
    setInputText(s);
    setOpen(true);
    setHighlight(0);
  };

  const scheduleBlurSync = (e: React.FocusEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value;
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => {
      blurTimer.current = null;
      syncFromText(text);
    }, 120);
  };

  const totalRows = prependFiltered.length + suggestions.length;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, Math.max(totalRows - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (highlight < prependFiltered.length && prependFiltered[highlight]) {
        e.preventDefault();
        pickPrepend(prependFiltered[highlight]);
      } else if (suggestions[highlight - prependFiltered.length]) {
        e.preventDefault();
        pick(suggestions[highlight - prependFiltered.length]);
      }
    } else if (e.key === "Escape") {
      close();
    }
  };

  const defaultInputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/20";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        autoComplete="off"
        required={required}
        placeholder={placeholder}
        className={inputClassName ? inputClassName : defaultInputClass}
        value={inputText}
        onChange={(e) => onInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={scheduleBlurSync}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
      />
      {open && totalRows > 0 && menuBox && typeof document !== "undefined"
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              style={{
                position: "fixed",
                top: menuBox.top,
                left: menuBox.left,
                width: menuBox.width,
                zIndex: 9999,
              }}
              className="max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5"
            >
              {prependFiltered.map((o, idx) => (
                <li key={`prepend-${o.value}`} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={idx === highlight}
                    className={`flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm ${
                      idx === highlight ? "bg-[#0F766E]/10" : "hover:bg-slate-50"
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickPrepend(o)}
                  >
                    <span className="font-medium text-slate-900">{o.label}</span>
                    {o.sublabel ? (
                      <span className="text-xs text-slate-500">{o.sublabel}</span>
                    ) : null}
                  </button>
                </li>
              ))}
              {suggestions.map((p, idx) => {
                const row = prependFiltered.length + idx;
                return (
                  <li key={p.cityKey} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={row === highlight}
                      className={`flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm ${
                        row === highlight ? "bg-[#0F766E]/10" : "hover:bg-slate-50"
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(p)}
                    >
                      <span className="font-medium text-slate-900">{placePrimaryLabel(p, locale)}</span>
                      <span className="text-xs text-slate-500">{placeWilayaLabel(p, locale)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body
          )
        : null}
    </div>
  );
}
