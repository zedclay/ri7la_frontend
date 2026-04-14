"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

type Slide = {
  src: string;
  alt: string;
  kicker?: string;
  title?: string;
  subtitle?: string;
};

export function HomeHeroSliderClient({
  slides,
  variant = "card",
  className = "",
  autoAdvanceMs = 6500,
}: {
  slides: Slide[];
  variant?: "card" | "fullbleed";
  className?: string;
  autoAdvanceMs?: number;
}) {
  const t = useTranslations("common");
  const safeSlides = useMemo(() => slides.filter((s) => Boolean(s.src)), [slides]);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    if (!autoAdvanceMs) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setIndex((i) => (i + 1) % safeSlides.length);
    }, autoAdvanceMs);
    return () => window.clearInterval(id);
  }, [autoAdvanceMs, safeSlides.length]);

  useEffect(() => {
    if (index < safeSlides.length) return;
    setIndex(0);
  }, [index, safeSlides.length]);

  const canNavigate = safeSlides.length > 1;
  const translate = `translateX(-${index * 100}%)`;
  const wrapperClassName =
    variant === "fullbleed"
      ? `relative z-10 h-full w-full overflow-hidden ${className}`
      : `relative z-10 h-[400px] w-full overflow-hidden rounded-xl subtle-shadow ${className}`;
  const activeSlide = safeSlides[index] ?? safeSlides[0];

  return (
    <div
      className={wrapperClassName.trim()}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onTouchStart={() => {
        pausedRef.current = true;
      }}
      onTouchEnd={() => {
        pausedRef.current = false;
      }}
    >
      <div className="absolute inset-0 bg-surface-container-low" />
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-out"
          style={{ transform: translate }}
        >
          {safeSlides.map((s, i) => (
            <div key={`${s.src}-${i}`} className="relative h-full w-full flex-none">
              <Image src={s.src} alt={s.alt} fill className="object-cover" priority={i === 0} sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {variant === "fullbleed" && activeSlide ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/10" />
          <div className="absolute inset-0">
            <div className="mx-auto flex h-full max-w-7xl items-center px-6">
              <div className="w-full max-w-3xl">
                <div
                  key={`${activeSlide.src}-${index}`}
                  className="rounded-3xl bg-black/25 p-7 text-start text-white backdrop-blur-md ring-1 ring-white/15 md:p-10"
                >
                  {activeSlide.kicker ? (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white">
                      <MaterialIcon name="travel_explore" className="!text-lg" />
                      <span>{activeSlide.kicker}</span>
                    </div>
                  ) : null}
                  {activeSlide.title ? (
                    <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
                      {activeSlide.title}
                    </h1>
                  ) : null}
                  {activeSlide.subtitle ? (
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-xl">
                      {activeSlide.subtitle}
                    </p>
                  ) : null}

                  <div className="pointer-events-auto mt-8 flex flex-wrap gap-4">
                    <Link
                      href="/search"
                      className="gradient-primary subtle-shadow group inline-flex h-12 items-center gap-2 rounded-full px-8 text-base font-semibold text-on-primary transition-transform active:scale-95"
                    >
                      {t("heroCtaPrimary")}
                      <MaterialIcon
                        name="arrow_forward"
                        className="!text-xl transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      />
                    </Link>
                    <Link
                      href="/#comment-ca-marche"
                      className="inline-flex h-12 items-center rounded-full bg-white/15 px-8 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    >
                      {t("heroCtaSecondary")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {canNavigate ? (
        <>
          <button
            type="button"
            aria-label={t("sliderPrev")}
            className="absolute start-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm active:scale-95"
            onClick={() => setIndex((i) => (i - 1 + safeSlides.length) % safeSlides.length)}
          >
            <MaterialIcon name="chevron_left" className="!text-2xl rtl:rotate-180" />
          </button>
          <button
            type="button"
            aria-label={t("sliderNext")}
            className="absolute end-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm active:scale-95"
            onClick={() => setIndex((i) => (i + 1) % safeSlides.length)}
          >
            <MaterialIcon name="chevron_right" className="!text-2xl rtl:rotate-180" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {safeSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t("sliderGoTo", { index: i + 1 })}
                aria-current={i === index}
                className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
