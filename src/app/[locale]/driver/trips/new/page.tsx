import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function DriverCreateTripPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Create New Trip</h1>
          <p className="mt-1 text-on-surface-variant">
            Publish a new carpool trip for passengers across Algeria.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full bg-surface-container-low px-6 py-3 text-sm font-extrabold text-on-surface active:scale-95">
            Save as Draft
          </button>
          <button type="button" className="rounded-full bg-tertiary-container px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary/10 active:scale-95">
            Publish Trip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon name="route" className="!text-2xl text-primary" />
              <div className="text-lg font-extrabold text-on-surface">Route Information</div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Departure City</div>
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                  <MaterialIcon name="place" className="!text-xl text-outline" />
                  <input className="w-full border-none bg-transparent text-sm font-semibold text-on-surface outline-none" placeholder="e.g. Algiers" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Destination City</div>
                <div className="mt-2 flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3">
                  <MaterialIcon name="flag" className="!text-xl text-outline" />
                  <input className="w-full border-none bg-transparent text-sm font-semibold text-on-surface outline-none" placeholder="e.g. Oran" />
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pickup & Drop-off Points</div>
                <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <input className="rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Specific pickup (e.g. Place des Martyrs)" />
                  <input className="rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Specific drop-off (e.g. Oran Train Station)" />
                </div>
                <div className="mt-4 h-40 rounded-2xl bg-surface-container-low" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon name="calendar_month" className="!text-2xl text-primary" />
              <div className="text-lg font-extrabold text-on-surface">Schedule & Availability</div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Departure Date</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <input className="w-full border-none bg-transparent text-sm font-semibold text-on-surface outline-none" placeholder="mm/dd/yyyy" />
                  <MaterialIcon name="calendar_today" className="!text-xl text-outline" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Departure Time</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <input className="w-full border-none bg-transparent text-sm font-semibold text-on-surface outline-none" placeholder="--:--" />
                  <MaterialIcon name="schedule" className="!text-xl text-outline" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Available Seats</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <button type="button" className="rounded-lg bg-white/70 px-3 py-1 text-sm font-extrabold text-on-surface active:scale-95">−</button>
                  <div className="text-sm font-extrabold text-on-surface">3</div>
                  <button type="button" className="rounded-lg bg-white/70 px-3 py-1 text-sm font-extrabold text-on-surface active:scale-95">+</button>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Price per Seat (DZD)</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3">
                  <input className="w-full border-none bg-transparent text-sm font-semibold text-on-surface outline-none" placeholder="1200" />
                  <span className="text-xs font-extrabold text-on-surface-variant">DZD</span>
                </div>
                <div className="mt-2 text-[10px] font-bold text-tertiary">
                  Recommended price for this route: 1000 - 1400 DZD
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon name="tune" className="!text-2xl text-primary" />
              <div className="text-lg font-extrabold text-on-surface">Preferences & Logistics</div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-surface-container-low p-6">
                <div className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Trip Rules</div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-on-surface">Luggage Allowance</span>
                    <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-on-surface">
                      Medium <MaterialIcon name="expand_more" className="!text-lg text-outline" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between opacity-60">
                    <span className="text-sm font-bold text-on-surface">Smoking</span>
                    <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-on-surface">No</span>
                  </div>
                  <div className="flex items-center justify-between opacity-60">
                    <span className="text-sm font-bold text-on-surface">Pets</span>
                    <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-extrabold text-on-surface">No</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-container-low p-6">
                <div className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant">Booking Mode</div>
                <div className="mt-4 space-y-3">
                  <button type="button" className="w-full rounded-2xl border border-primary bg-white px-4 py-4 text-left">
                    <div className="text-sm font-extrabold text-on-surface">Instant Booking</div>
                    <div className="text-xs text-on-surface-variant">Passengers book without waiting for approval.</div>
                  </button>
                  <button type="button" className="w-full rounded-2xl border border-outline-variant/20 bg-white/60 px-4 py-4 text-left">
                    <div className="text-sm font-extrabold text-on-surface">Manual Approval</div>
                    <div className="text-xs text-on-surface-variant">You review every request before confirming.</div>
                  </button>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                      <MaterialIcon name="woman" className="!text-xl text-outline" />
                      Women-only trip
                    </div>
                    <button type="button" role="switch" aria-checked={false} className="relative h-5 w-10 rounded-full bg-outline-variant/50">
                      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Driver instructions (optional)</div>
              <textarea className="mt-2 min-h-28 w-full resize-none rounded-2xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Meeting point details, music preferences, or breaks planned..." />
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="text-sm font-extrabold">Trip Summary</div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-start justify-between">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Departure</div>
                <div className="text-right font-extrabold">Algiers</div>
              </div>
              <div className="flex items-start justify-between">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Arrival</div>
                <div className="text-right font-extrabold">Oran</div>
              </div>
              <div className="flex items-start justify-between">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Date</div>
                <div className="text-right font-extrabold">Oct 24, 2023</div>
              </div>
              <div className="flex items-start justify-between">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Time</div>
                <div className="text-right font-extrabold">08:30 AM</div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-white/10 p-5">
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Potential earnings</div>
              <div className="mt-2 text-3xl font-extrabold">3,600 DZD</div>
              <div className="mt-1 text-xs opacity-80">Based on 3 seats at 1,200 DZD each</div>
            </div>
            <button type="button" className="mt-6 w-full rounded-full bg-tertiary-container py-3 text-sm font-extrabold text-white active:scale-95">
              Publish Trip
            </button>
            <button type="button" className="mt-3 w-full rounded-full bg-white/10 py-3 text-sm font-extrabold text-white active:scale-95">
              Save as Draft
            </button>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <MaterialIcon name="shield_with_heart" className="!text-2xl text-primary" />
              <div>
                <div className="text-sm font-extrabold text-on-surface">Trust & Safety</div>
                <div className="mt-1 text-xs text-on-surface-variant">
                  Ensure your vehicle documents are up to date. Respect meeting points and passenger comfort.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <Link href="/driver/trips" className="flex items-center gap-2 text-sm font-bold text-primary underline underline-offset-4">
                <MaterialIcon name="arrow_back" className="!text-lg" />
                Back to Trips
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

