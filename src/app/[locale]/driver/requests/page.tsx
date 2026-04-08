import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function DriverRequestsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Requests</h1>
        <p className="mt-1 text-on-surface-variant">
          Approve or reject passenger requests depending on your booking mode.
        </p>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-extrabold text-on-surface">Passenger Requests</div>
          <span className="rounded-full bg-tertiary-fixed/60 px-3 py-1 text-[10px] font-extrabold text-on-tertiary-fixed">
            1 PENDING
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-sm font-extrabold text-on-primary-fixed-variant">
                S
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-extrabold text-on-surface">
                  Sarah K.
                  <span className="flex items-center gap-1 text-xs font-bold text-on-surface-variant">
                    <MaterialIcon name="star" filled className="!text-sm text-amber-500" />
                    5.0
                  </span>
                </div>
                <div className="mt-1 text-xs font-bold text-on-surface-variant">
                  Requested 1 seat • Pickup at Algiers Center
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="text-xs font-bold text-on-surface-variant hover:text-error">
                Reject
              </button>
              <button type="button" className="rounded-full bg-primary px-6 py-2.5 text-xs font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

