import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function DriverTripsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">My Trips</h1>
          <p className="mt-1 text-on-surface-variant">
            Manage your active routes, track passenger occupancy, and monitor upcoming earnings.
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

      <div className="flex flex-wrap items-center gap-3">
        {["Upcoming (3)", "Active (1)", "Completed (142)", "Canceled", "Drafts"].map((t) => (
          <button
            key={t}
            type="button"
            className={
              t.startsWith("Upcoming")
                ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-primary-container"
                : "rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
            }
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs font-bold text-on-surface-variant">
          Sort by: <span className="text-on-surface">Departure Date</span>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <MaterialIcon name="calendar_month" className="!text-lg" />
            Oct 20 - Oct 27
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <MaterialIcon name="place" className="!text-lg" />
            All Routes
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
            <MaterialIcon name="verified" className="!text-lg" />
            Confirmed Status
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
              <MaterialIcon name="navigation" className="!text-lg text-primary" />
              En route to Oran
            </div>
            <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold text-on-primary">
              ACTIVE NOW
            </span>
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-2xl font-extrabold text-on-surface">Algiers</div>
                  <div className="text-xs font-bold text-on-surface-variant">08:30 AM</div>
                </div>
                <div className="flex-1 px-6">
                  <div className="mb-2 flex justify-center text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                    2h 15m left
                  </div>
                  <div className="relative h-1 rounded-full bg-outline-variant/30">
                    <div className="absolute left-0 top-0 h-1 w-2/3 rounded-full bg-primary" />
                    <div className="absolute left-2/3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-tertiary shadow" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-on-surface">Oran</div>
                  <div className="text-xs font-bold text-on-surface-variant">12:45 PM</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Occupancy
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-on-surface">3/4 Seats</div>
                  <div className="mt-2 h-2 rounded-full bg-outline-variant/20">
                    <div className="h-2 w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Est. Earnings
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-primary-container">3,600 DZD</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/driver/requests"
                className="rounded-full bg-surface-container-lowest px-5 py-2.5 text-xs font-extrabold text-on-surface active:scale-95"
              >
                Manage Passengers
              </Link>
              <Link
                href="/driver/trips/demo-algiers-oran"
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            { date: "Oct 25, 2024", from: "Algiers", to: "Constantine", seats: "4/4", revenue: "5,200 DZD", badge: "CONFIRMED", badgeStyle: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
            { date: "Oct 26, 2024", from: "Algiers", to: "Annaba", seats: "1/4", revenue: "1,800 DZD", badge: "PENDING SEATS", badgeStyle: "bg-tertiary-fixed/60 text-on-tertiary-fixed" },
          ].map((t) => (
            <div key={t.date} className="rounded-2xl bg-surface-container-low p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-extrabold text-on-surface">
                  <MaterialIcon name="calendar_today" className="!text-xl text-outline" />
                  {t.date}
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${t.badgeStyle}`}>
                  {t.badge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">From</div>
                  <div className="mt-1 text-lg font-extrabold text-on-surface">{t.from}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">To</div>
                  <div className="mt-1 text-lg font-extrabold text-on-surface">{t.to}</div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs font-bold text-on-surface-variant">
                  Seats <span className="ml-2 text-on-surface">{t.seats}</span>
                </div>
                <div className="text-xs font-bold text-on-surface-variant">
                  Revenue <span className="ml-2 text-primary-container">{t.revenue}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button type="button" className="rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                  Details
                </button>
                <button type="button" className="rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/20 bg-surface-container-low p-10 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high">
                <MaterialIcon name="draft" className="!text-2xl text-outline" />
              </div>
              <div className="text-lg font-extrabold text-on-surface">Unfinished Draft</div>
              <div className="mt-1 text-sm text-on-surface-variant">Algiers to Bejaia • Route details incomplete</div>
              <button type="button" className="mt-4 text-sm font-extrabold text-primary underline underline-offset-4">
                Complete Draft
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-primary-container p-8 text-white shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest opacity-90">This week&apos;s outlook</div>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <div className="text-4xl font-extrabold">12</div>
                <div className="text-xs font-bold opacity-90">Scheduled trips</div>
              </div>
              <div>
                <div className="text-4xl font-extrabold">88%</div>
                <div className="text-xs font-bold opacity-90">Avg. occupancy</div>
              </div>
            </div>
            <div className="mt-6 text-sm font-extrabold">Estimated net revenue</div>
            <div className="mt-1 text-3xl font-extrabold">42,800 DZD</div>
          </div>
        </div>
      </div>
    </div>
  );
}

