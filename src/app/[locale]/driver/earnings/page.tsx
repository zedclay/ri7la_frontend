import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function DriverEarningsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Earnings Summary</h1>
          <p className="mt-1 text-on-surface-variant">
            Review your financial performance and payout status for October 2023.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-6 py-3 text-sm font-extrabold text-on-surface active:scale-95"
        >
          <MaterialIcon name="download" className="!text-xl" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm md:col-span-1">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">Total earnings</div>
          <div className="mt-2 text-4xl font-extrabold">45,800 DZD</div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            <MaterialIcon name="trending_up" className="!text-lg" />
            +12% from last month
          </div>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Pending payouts</div>
          <div className="mt-2 text-3xl font-extrabold text-on-surface">12,400 DZD</div>
          <span className="mt-3 inline-flex rounded-full bg-tertiary-fixed/60 px-3 py-1 text-[10px] font-extrabold text-on-tertiary-fixed">
            PENDING
          </span>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Paid earnings</div>
          <div className="mt-2 text-3xl font-extrabold text-on-surface">33,400 DZD</div>
          <span className="mt-3 inline-flex rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-extrabold text-on-primary-fixed-variant">
            PAID
          </span>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Payout method</div>
          <div className="text-sm font-extrabold text-on-surface">CCP / Al Barid Bank</div>
          <div className="mt-1 text-xs text-on-surface-variant">Account: **** 4509</div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Last payout</div>
            <div className="text-xs font-extrabold text-on-surface">Oct 12, 2023</div>
          </div>
          <button type="button" className="mt-4 w-full rounded-full bg-surface-container-low py-2.5 text-xs font-extrabold text-on-surface active:scale-95">
            Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-extrabold text-on-surface">Recent Transactions</div>
            <button type="button" className="text-xs font-bold text-primary underline underline-offset-4">
              View All
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-outline-variant/10">
            <div className="grid grid-cols-3 bg-surface-container-low px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <div>Date & trip</div>
              <div>Status</div>
              <div className="text-right">Amount</div>
            </div>
            {[
              { date: "Oct 24, 2023", trip: "Algiers → Oran", status: "Paid", amount: "4,200 DZD", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
              { date: "Oct 23, 2023", trip: "Annaba → Constantine", status: "Pending", amount: "2,850 DZD", pill: "bg-tertiary-fixed/60 text-on-tertiary-fixed" },
              { date: "Oct 21, 2023", trip: "Algiers → Setif", status: "Processing", amount: "3,100 DZD", pill: "bg-surface-container-high text-on-surface-variant" },
              { date: "Oct 19, 2023", trip: "Bejaia → Algiers", status: "Paid", amount: "1,900 DZD", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant" },
            ].map((t) => (
              <div key={t.date + t.trip} className="grid grid-cols-3 items-center border-t border-outline-variant/10 px-4 py-4 text-sm">
                <div>
                  <div className="font-bold text-on-surface">{t.date}</div>
                  <div className="text-[10px] font-bold text-on-surface-variant">{t.trip}</div>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${t.pill}`}>{t.status}</span>
                </div>
                <div className="text-right font-extrabold text-on-surface">{t.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-extrabold text-on-surface">Weekly Activity</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Last 7 days</div>
            </div>
            <div className="h-40 rounded-xl bg-surface-container-low" />
          </div>

          <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
              <MaterialIcon name="auto_graph" className="!text-lg" />
              Tip
            </div>
            <div className="text-lg font-extrabold">Increase your weekend earnings</div>
            <p className="mt-2 text-sm text-white/80">
              Drivers in Algiers center earn up to 30% more on Thursday evenings. Plan your route now.
            </p>
            <button type="button" className="mt-5 rounded-full bg-tertiary-fixed/70 px-6 py-3 text-sm font-extrabold text-on-tertiary-fixed active:scale-95">
              View Demand Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

