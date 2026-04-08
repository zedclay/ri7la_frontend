import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function DriverDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Welcome back, Karim</h1>
          <p className="mt-1 text-on-surface-variant">
            You have <span className="font-bold text-primary-container">3 new carpool requests</span> waiting for your approval.
          </p>
        </div>
        <Link
          href="/driver/trips/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
        >
          Create New Trip
          <MaterialIcon name="add" className="!text-xl" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-tertiary-fixed/50 p-6 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                <MaterialIcon name="verified_user" className="!text-2xl text-tertiary" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-on-tertiary-fixed">Verification Pending</div>
                <div className="mt-1 text-sm text-on-tertiary-fixed-variant">
                  Your vehicle inspection documents are currently in review. You can still accept carpool requests.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/driver/onboarding"
                className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-tertiary active:scale-95"
              >
                Complete Profile
              </Link>
              <Link
                href="/driver/support"
                className="rounded-full bg-surface-container-low px-5 py-2.5 text-sm font-extrabold text-on-surface active:scale-95"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">Total earnings this week</div>
          <div className="mt-2 text-4xl font-extrabold">45,000 DZD</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            <MaterialIcon name="trending_up" className="!text-lg" />
            +12%
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-bold opacity-90">
            <span>Payout Date: 15 Oct</span>
            <Link href="/driver/earnings" className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-primary-container">
              Details
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Passenger Requests</div>
            <Link href="/driver/requests" className="text-xs font-bold text-primary underline underline-offset-4">
              View all requests
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "Ahmed Yacine", from: "Algiers", to: "Oran", when: "Today, 14:00", seats: "1 Seat", price: "1,200 DZD", rating: "4.8", trips: "12 trips" },
              { name: "Sarah K.", from: "Algiers", to: "Blida", when: "Tomorrow, 08:30", seats: "2 Seats", price: "800 DZD", rating: "5.0", trips: "3 trips" },
            ].map((r) => (
              <div key={r.name} className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant">
                    {r.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-on-surface">
                      {r.name}
                      <span className="text-xs font-bold text-on-surface-variant">
                        {r.rating} • {r.trips}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant">
                      <span className="rounded-full bg-white/60 px-3 py-1">{r.from}</span>
                      <MaterialIcon name="trending_flat" className="!text-lg text-outline" />
                      <span className="rounded-full bg-white/60 px-3 py-1">{r.to}</span>
                      <span className="ml-2">{r.when}</span>
                      <span className="ml-2">{r.seats} • {r.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" className="rounded-full bg-white px-5 py-2 text-xs font-extrabold text-primary-container active:scale-95">
                    Approve
                  </button>
                  <button type="button" className="text-xs font-bold text-on-surface-variant hover:text-error">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 text-sm font-extrabold text-on-surface">Scheduled</div>
            <div className="space-y-3">
              {[
                { title: "Algiers - Constantine", time: "Fri, 13 Oct • 06:00 AM", badge: "Confirmed", badgeStyle: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
                { title: "Annaba - Algiers", time: "Sun, 15 Oct • 22:30 PM", badge: "Draft", badgeStyle: "bg-surface-container-high text-on-surface-variant" },
              ].map((t) => (
                <div key={t.title} className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70">
                    <MaterialIcon name="directions_bus" className="!text-2xl text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-on-surface">{t.title}</div>
                    <div className="mt-1 text-[10px] font-bold text-on-surface-variant">{t.time}</div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-extrabold ${t.badgeStyle}`}>{t.badge}</span>
                </div>
              ))}
            </div>
            <Link
              href="/driver/trips"
              className="mt-4 block w-full rounded-full bg-surface-container-low py-3 text-center text-sm font-extrabold text-on-surface active:scale-95"
            >
              Manage All Trips
            </Link>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Last Route Trace</div>
            <div className="h-24 rounded-xl bg-surface-container-low" />
          </div>
        </div>
      </div>
    </div>
  );
}

