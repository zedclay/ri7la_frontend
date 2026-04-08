"use client";

import { useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getCurrentDemoUser, updateCurrentDemoUser } from "@/lib/demoSession";

export default function DriverProfilePage() {
  const router = useRouter();
  const me = getCurrentDemoUser();
  const [fullName, setFullName] = useState(() => me?.fullName ?? "");
  const [email, setEmail] = useState(() => me?.email ?? "");

  const avatar = useMemo(() => {
    const phone = me?.phone ?? "";
    if (phone) return phone.slice(-2).toUpperCase();
    return "D";
  }, [me?.phone]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Profile</h1>
        <p className="mt-1 text-on-surface-variant">
          Complete your driver profile after onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-fixed text-2xl font-extrabold text-on-primary-fixed-variant">
            {avatar}
          </div>
          <div className="mt-4 text-center">
            <div className="text-xl font-extrabold text-on-surface">{me?.fullName || "Driver"}</div>
            <div className="text-sm text-on-surface-variant">{me?.phone || ""}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-extrabold text-on-surface">Information</div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              updateCurrentDemoUser({
                fullName: fullName.trim() || undefined,
                email: email.trim() || undefined,
                verified: true,
                profileCompleted: true,
              });
              router.push("/driver");
            }}
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ex: Ahmed Benali"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">Email (optional)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-on-surface outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="driver@ri7la.dz"
              />
            </div>

            <button
              type="submit"
              disabled={!fullName.trim()}
              className="w-full rounded-full bg-primary py-4 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 disabled:opacity-60 active:scale-95"
            >
              Save
            </button>
          </form>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: "verified_user", label: "Identity", value: me?.driverOnboardingCompleted ? "Submitted" : "Missing" },
              { icon: "badge", label: "License", value: me?.driverOnboardingCompleted ? "Submitted" : "Missing" },
              { icon: "shield", label: "Documents", value: me?.driverOnboardingCompleted ? "Submitted" : "Missing" },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl bg-surface-container-low p-5">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
                  <MaterialIcon name={c.icon} className="!text-2xl text-primary" />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{c.label}</div>
                <div className="mt-2 text-lg font-extrabold text-on-surface">{c.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
