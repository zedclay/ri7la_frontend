import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminBookingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Bookings Monitor</h1>
          <p className="mt-1 text-on-surface-variant">
            View booking status, conflicts, cancellations, and operational escalations.
          </p>
        </div>
        <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
          Create Manual Booking
        </button>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-on-surface">
            <MaterialIcon name="filter_alt" className="!text-xl text-primary" />
            Filters
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "Confirmed", "Canceled", "Disputed"].map((t) => (
              <button
                key={t}
                type="button"
                className={
                  t === "All"
                    ? "rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-primary-container"
                    : "rounded-full px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-low"
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant/10">
          <div className="grid grid-cols-7 bg-surface-container-low px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            <div>Booking</div>
            <div className="col-span-2">Trip</div>
            <div>User</div>
            <div>Status</div>
            <div>Payment</div>
            <div className="text-right">Amount</div>
          </div>
          {[
            { ref: "RX-9283-LZ", trip: "Algiers → Oran (Bus)", user: "Amine R.", status: "CONFIRMED", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant", pay: "CAPTURED", amount: "1,250 DZD" },
            { ref: "PX-4421-QR", trip: "Algiers → Constantine (Carpool)", user: "Imane L.", status: "PENDING", pill: "bg-tertiary-fixed/60 text-on-tertiary-fixed", pay: "CASH", amount: "1,200 DZD" },
            { ref: "HX-1102-AA", trip: "Oran → Algiers (Bus)", user: "Yacine K.", status: "DISPUTED", pill: "bg-error-container text-on-error-container", pay: "REFUND REQUEST", amount: "2,450 DZD" },
          ].map((b) => (
            <div key={b.ref} className="grid grid-cols-7 items-center border-t border-outline-variant/10 px-4 py-4 text-sm">
              <div className="font-extrabold text-primary-container">{b.ref}</div>
              <div className="col-span-2 text-on-surface">{b.trip}</div>
              <div className="font-extrabold text-on-surface">{b.user}</div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${b.pill}`}>{b.status}</span>
              </div>
              <div className="text-xs font-extrabold text-on-surface-variant">{b.pay}</div>
              <div className="text-right font-extrabold text-on-surface">{b.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

