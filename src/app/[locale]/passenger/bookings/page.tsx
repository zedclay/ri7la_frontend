import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PassengerBookingsList } from "@/components/passenger/PassengerBookingsList";

export default function PassengerBookingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">My Bookings</h1>
          <p className="mt-1 text-on-surface-variant">
            Manage your upcoming journeys and past travel history.
          </p>
        </div>
        <div className="flex gap-2">
          {["Upcoming", "Pending", "Completed", "Canceled"].map((t) => (
            <button
              key={t}
              type="button"
              className={
                t === "Upcoming"
                  ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold text-primary-container"
                  : "rounded-full px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low"
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Transport type
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-on-surface">
              All Types
              <MaterialIcon name="expand_more" className="!text-xl text-outline" />
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Date range
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-on-surface">
              Oct 2024 - Nov 2024
              <MaterialIcon name="calendar_month" className="!text-xl text-outline" />
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Status
            </div>
            <div className="mt-2 flex items-center justify-between text-sm font-semibold text-on-surface">
              All Statuses
              <MaterialIcon name="tune" className="!text-xl text-outline" />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
            >
              <MaterialIcon name="filter_alt" className="!text-xl" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <PassengerBookingsList />
    </div>
  );
}

