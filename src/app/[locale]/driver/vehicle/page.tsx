"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getCurrentDemoUser, updateCurrentDemoUser } from "@/lib/demoSession";
import { useTranslations } from "next-intl";

function readFilesAsDataUrls(files: FileList): Promise<string[]> {
  const arr = Array.from(files);
  return Promise.all(
    arr.map(
      (f) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(f);
        }),
    ),
  ).then((urls) => urls.filter(Boolean));
}

export default function DriverVehicleInfoPage() {
  const t = useTranslations("common");
  const me = getCurrentDemoUser();
  const [carMake, setCarMake] = useState(() => me?.carMake ?? "Dacia");
  const [carModel, setCarModel] = useState(() => me?.carModel ?? "Logan");
  const [carColor, setCarColor] = useState(() => me?.carColor ?? "White");
  const [plateNumber, setPlateNumber] = useState(() => me?.plateNumber ?? "01234 122 16");
  const [carImageUrls, setCarImageUrls] = useState<string[]>(() => {
    if (me?.carImageUrls?.length) return [...me.carImageUrls];
    if (me?.carImageUrl) return [me.carImageUrl];
    return [];
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const persistVehicle = useCallback((urls: string[]) => {
    updateCurrentDemoUser({
      carMake: carMake.trim() || undefined,
      carModel: carModel.trim() || undefined,
      carColor: carColor.trim() || undefined,
      plateNumber: plateNumber.trim() || undefined,
      carImageUrls: urls.length ? urls : undefined,
      carImageUrl: urls[0] ?? undefined,
    });
  }, [carMake, carModel, carColor, plateNumber]);

  const previewUrl = useMemo(() => {
    if (carImageUrls.length > 0) return carImageUrls[Math.min(activeIndex, carImageUrls.length - 1)]!;
    return "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80";
  }, [carImageUrls, activeIndex]);

  function addImagesFromFiles(files: FileList | null) {
    if (!files?.length) return;
    void readFilesAsDataUrls(files).then((urls) => {
      setCarImageUrls((prev) => {
        const next = [...prev, ...urls];
        persistVehicle(next);
        return next;
      });
      setActiveIndex((i) => i);
    });
  }

  function removeImage(index: number) {
    setCarImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      persistVehicle(next);
      setActiveIndex((ai) => Math.min(ai, Math.max(0, next.length - 1)));
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">{t("vehicleInfoTitle")}</h1>
        <p className="mt-1 text-on-surface-variant">
          {t("vehicleInfoSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">{t("vehiclePrimary")}</div>
            <button
              type="button"
              className="text-xs font-bold text-primary underline underline-offset-4"
              onClick={() => persistVehicle(carImageUrls)}
            >
              {t("save")}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-surface-container-low">
            <div className="relative h-52 overflow-hidden bg-surface-container-low sm:h-64">
              <Image src={previewUrl} alt="Car" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              {carImageUrls.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    className="absolute start-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:scale-95"
                    onClick={() => setActiveIndex((i) => (i - 1 + carImageUrls.length) % carImageUrls.length)}
                  >
                    <MaterialIcon name="chevron_left" className="!text-2xl rtl:rotate-180" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm active:scale-95"
                    onClick={() => setActiveIndex((i) => (i + 1) % carImageUrls.length)}
                  >
                    <MaterialIcon name="chevron_right" className="!text-2xl rtl:rotate-180" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {carImageUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Photo ${i + 1}`}
                        aria-current={i === activeIndex}
                        className={`h-2 w-2 rounded-full ${i === activeIndex ? "bg-white" : "bg-white/40"}`}
                        onClick={() => setActiveIndex(i)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("vehicleMake")}</div>
                  <input
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-white/70 px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t("vehicleMakePlaceholder")}
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("vehicleModel")}</div>
                  <input
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-white/70 px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t("vehicleModelPlaceholder")}
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("vehicleColor")}</div>
                  <input
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-white/70 px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder={t("vehicleColorPlaceholder")}
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Plate</div>
                  <input
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-white/70 px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="01234 122 16"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white/60 px-4 py-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Vehicle photos</div>
                <p className="mt-1 text-xs text-on-surface-variant">Add several images (exterior, interior, plates). Stored in this browser session.</p>
                <label className="mt-3 flex cursor-pointer flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      addImagesFromFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-on-primary shadow-md active:scale-95">
                    <MaterialIcon name="add_a_photo" className="!text-xl" />
                    Add photos
                  </span>
                </label>
                {carImageUrls.length > 0 ? (
                  <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {carImageUrls.map((url, index) => (
                      <li key={`${index}-${url.slice(0, 24)}`} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-low">
                        <button
                          type="button"
                          className="relative h-full w-full"
                          onClick={() => setActiveIndex(index)}
                        >
                          <Image src={url} alt="" fill className="object-cover" sizes="200px" unoptimized />
                        </button>
                        <button
                          type="button"
                          aria-label="Remove photo"
                          className="absolute end-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95"
                          onClick={() => removeImage(index)}
                        >
                          <MaterialIcon name="close" className="!text-lg" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-xs font-medium text-on-surface-variant">No photos yet — use “Add photos”.</p>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  { label: "Plate", value: plateNumber || "—", icon: "numbers" },
                  { label: "Seats", value: "4", icon: "event_seat" },
                  { label: "Luggage", value: "Medium", icon: "luggage" },
                ].map((i) => (
                  <div key={i.label} className="rounded-xl bg-white/60 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      {i.label}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm font-extrabold text-on-surface">
                      {i.value}
                      <MaterialIcon name={i.icon} className="!text-xl text-outline" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 text-sm font-extrabold text-on-surface">Documents</div>
            <div className="space-y-3">
              {[
                { title: "Insurance", status: "Renewal soon", pill: "bg-tertiary-fixed/60 text-on-tertiary-fixed" },
                { title: "Registration", status: "Approved", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
              ].map((d) => (
                <div key={d.title} className="flex items-center justify-between rounded-2xl bg-surface-container-low p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                      <MaterialIcon name="description" className="!text-2xl text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-on-surface">{d.title}</div>
                      <div className="text-xs text-on-surface-variant">Tap to upload/update</div>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${d.pill}`}>{d.status}</span>
                </div>
              ))}
            </div>
            <button type="button" className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10">
              Upload Document
            </button>
          </div>

          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="text-sm font-extrabold">Tip</div>
            <div className="mt-2 text-sm text-white/80">
              Clear vehicle photos and valid insurance improve trust and booking rate.
            </div>
            <label className="mt-4 inline-flex cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95">
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addImagesFromFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              Add photos
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
