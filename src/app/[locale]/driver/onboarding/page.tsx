"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { updateCurrentDemoUser } from "@/lib/demoSession";

export default function DriverOnboardingPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Onboarding • Step 4 of 7
          </div>
          <h1 className="mt-2 font-headline text-3xl font-extrabold text-on-surface">Vehicle Details</h1>
          <p className="mt-1 text-on-surface-variant">
            Tell us about the vehicle you&apos;ll be using for Ri7la journeys.
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-extrabold text-on-surface active:scale-95">
            Save Progress
          </button>
          <button
            type="button"
            className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
            onClick={() => {
              updateCurrentDemoUser({ driverOnboardingCompleted: true, profileCompleted: true, verified: true });
              router.push("/driver/profile");
            }}
          >
            Finish Onboarding
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-6">
          {[
            { n: 1, label: "Personal", done: true },
            { n: 2, label: "ID Upload", done: true },
            { n: 3, label: "License", done: true },
            { n: 4, label: "Vehicle", done: false, active: true },
            { n: 5, label: "Documents", done: false },
            { n: 6, label: "Preferences", done: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={
                  s.done
                    ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary"
                    : s.active
                      ? "flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary"
                      : "flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant"
                }
              >
                {s.done ? <MaterialIcon name="check" className="!text-xl" /> : <span className="text-sm font-extrabold">{s.n}</span>}
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Car brand & model</div>
              <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                <input className="w-full border-none bg-transparent text-sm font-semibold text-on-surface outline-none" placeholder="e.g. Dacia Logan" />
                <MaterialIcon name="search" className="!text-xl text-outline" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Manufacturing year</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  2020 <MaterialIcon name="expand_more" className="!text-xl text-outline" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Passenger seats</div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button type="button" className="rounded-xl border border-primary bg-white px-4 py-3 text-left">
                    <div className="text-sm font-extrabold text-on-surface">4</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Standard</div>
                  </button>
                  <button type="button" className="rounded-xl border border-outline-variant/20 bg-white/60 px-4 py-3 text-left">
                    <div className="text-sm font-extrabold text-on-surface">6+</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Van/Large</div>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Vehicle color</div>
              <div className="mt-3 flex items-center gap-3">
                {["bg-white", "bg-slate-900", "bg-red-600", "bg-blue-600", "bg-slate-400"].map((c) => (
                  <button key={c} type="button" className={`h-8 w-8 rounded-full ring-2 ring-outline-variant/30 ${c}`} aria-label="Color" />
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                License plate (Algerian format)
              </div>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <input className="rounded-xl border-none bg-surface-container-low px-4 py-3 text-center text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="12345" />
                <input className="rounded-xl border-none bg-surface-container-low px-4 py-3 text-center text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="120" />
                <input className="rounded-xl border-none bg-surface-container-low px-4 py-3 text-center text-sm font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="16" />
              </div>
              <div className="mt-2 text-[10px] font-bold text-on-surface-variant">
                Format: [Sequence] [Model Code] [Wilaya Code]
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {["Exterior Photo (Required next step)", "Interior Photo (Required next step)"].map((t) => (
                <button key={t} type="button" className="relative h-44 overflow-hidden rounded-2xl bg-surface-container-low">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-primary-container/10" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-primary-container">
                    <MaterialIcon name="photo_camera" className="!text-sm" />
                    {t}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-tertiary-fixed/50 p-6">
                <div className="flex items-start gap-3">
                  <MaterialIcon name="verified_user" className="!text-2xl text-tertiary" />
                  <div>
                    <div className="text-sm font-extrabold text-on-tertiary-fixed">Ri7la Trust Program</div>
                    <div className="mt-1 text-xs text-on-tertiary-fixed-variant">
                      Verified drivers earn more through priority matching and premium routes.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-primary-container p-6 text-white">
                <div className="text-sm font-extrabold">Need help?</div>
                <div className="mt-1 text-xs text-white/80">
                  Our onboarding specialists are available 24/7 in Algiers.
                </div>
                <Link href="/driver/support" className="mt-3 inline-flex text-xs font-extrabold underline underline-offset-4">
                  Contact Driver Support
                </Link>
              </div>
            </div>

            <Link href="/driver" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4">
              <MaterialIcon name="arrow_back" className="!text-lg" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
