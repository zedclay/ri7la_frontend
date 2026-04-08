"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getCurrentDemoUser, updateCurrentDemoUser } from "@/lib/demoSession";

export default function DriverVehicleInfoPage() {
  const me = getCurrentDemoUser();
  const [carMake, setCarMake] = useState(() => me?.carMake ?? "Dacia");
  const [carModel, setCarModel] = useState(() => me?.carModel ?? "Logan");
  const [carColor, setCarColor] = useState(() => me?.carColor ?? "White");
  const [plateNumber, setPlateNumber] = useState(() => me?.plateNumber ?? "01234 122 16");
  const [carImageUrl, setCarImageUrl] = useState(() => me?.carImageUrl ?? "");

  const previewUrl = useMemo(() => {
    if (carImageUrl.trim().length > 0) return carImageUrl.trim();
    return "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1400&q=80";
  }, [carImageUrl]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Vehicle Info</h1>
        <p className="mt-1 text-on-surface-variant">
          Manage your vehicle details, seat capacity, and documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Primary vehicle</div>
            <button
              type="button"
              className="text-xs font-bold text-primary underline underline-offset-4"
              onClick={() => {
                updateCurrentDemoUser({
                  carMake: carMake.trim() || undefined,
                  carModel: carModel.trim() || undefined,
                  carColor: carColor.trim() || undefined,
                  plateNumber: plateNumber.trim() || undefined,
                  carImageUrl: carImageUrl.trim() || undefined,
                });
              }}
            >
              Save
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl bg-surface-container-low">
            <div className="relative h-44 overflow-hidden bg-surface-container-low">
              <Image src={previewUrl} alt="Car" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 900px" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Make</div>
                  <input
                    value={carMake}
                    onChange={(e) => setCarMake(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-white/70 px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Dacia"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Model</div>
                  <input
                    value={carModel}
                    onChange={(e) => setCarModel(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-white/70 px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Logan"
                  />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Color</div>
                  <input
                    value={carColor}
                    onChange={(e) => setCarColor(e.target.value)}
                    className="mt-2 w-full rounded-xl border-none bg-white/70 px-4 py-3 text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="White"
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

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white/60 px-4 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Car image
                  </div>
                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const v = typeof reader.result === "string" ? reader.result : "";
                          if (!v) return;
                          setCarImageUrl(v);
                          updateCurrentDemoUser({ carImageUrl: v });
                        };
                        reader.readAsDataURL(f);
                      }}
                      className="w-full text-xs font-semibold text-on-surface-variant"
                    />
                    <input
                      value={carImageUrl}
                      onChange={(e) => setCarImageUrl(e.target.value)}
                      className="w-full rounded-xl border-none bg-white px-4 py-3 text-xs font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Or paste an image URL"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-white/60 px-4 py-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Preview
                  </div>
                  <div className="mt-3 overflow-hidden rounded-xl bg-white">
                    <div className="relative h-32 w-full">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 600px" unoptimized />
                    </div>
                  </div>
                </div>
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
            <button type="button" className="mt-4 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container">
              Add Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
