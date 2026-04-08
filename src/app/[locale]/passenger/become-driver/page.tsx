"use client";

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getCurrentDemoUser, setDemoSession, updateCurrentDemoUser } from "@/lib/demoSession";

export default function BecomeDriverPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl bg-primary-container p-10 text-white shadow-sm">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-widest">
          <MaterialIcon name="verified_user" className="!text-lg" />
          Become a Driver
        </div>
        <h1 className="font-headline text-4xl font-extrabold tracking-tight">Publish trips across Algeria</h1>
        <p className="mt-3 max-w-2xl text-white/80">
          Complete verification, add your vehicle, then publish routes. You&apos;ll receive booking requests and messages from passengers.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-white px-7 py-3 text-sm font-extrabold text-primary-container active:scale-95"
            onClick={() => {
              const me = getCurrentDemoUser();
              if (me) {
                updateCurrentDemoUser({ role: "driver", driverOnboardingCompleted: false });
                setDemoSession({ role: "driver", phone: me.phone, identifier: me.phone });
              } else {
                setDemoSession({ role: "driver" });
              }
              router.push("/driver/onboarding");
            }}
          >
            Start Driver Onboarding
          </button>
          <Link
            href="/help"
            className="rounded-full bg-white/10 px-7 py-3 text-sm font-extrabold text-white active:scale-95"
          >
            Learn More
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { icon: "badge", title: "Identity Verification", desc: "Upload your ID and driver license." },
          { icon: "directions_car", title: "Vehicle Info", desc: "Add car details and insurance." },
          { icon: "route", title: "Publish Trips", desc: "Set pickup/drop-off and pricing." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low">
              <MaterialIcon name={c.icon} className="!text-2xl text-primary" />
            </div>
            <div className="text-sm font-extrabold text-on-surface">{c.title}</div>
            <p className="mt-1 text-sm text-on-surface-variant">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
