import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function AdminPaymentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Payments</h1>
          <p className="mt-1 text-on-surface-variant">
            Track transactions, refunds, disputes and payout status.
          </p>
        </div>
        <button type="button" className="rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { title: "Volume (24h)", value: "2,481,000 DZD", icon: "payments" },
          { title: "Refunds (24h)", value: "64,200 DZD", icon: "undo" },
          { title: "Disputes", value: "12", icon: "gavel" },
          { title: "Flagged", value: "2", icon: "report" },
        ].map((k) => (
          <div key={k.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-low">
              <MaterialIcon name={k.icon} className="!text-2xl text-primary" />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{k.title}</div>
            <div className="mt-2 text-2xl font-extrabold text-on-surface">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-extrabold text-on-surface">Transaction Review</div>
          <div className="flex flex-wrap gap-2">
            {["All", "Captured", "Refunded", "Failed", "Flagged"].map((t) => (
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
            <div>Txn</div>
            <div className="col-span-2">Booking</div>
            <div>Method</div>
            <div>Status</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Action</div>
          </div>
          {[
            { id: "TXN-88210", ref: "RX-9283-LZ", user: "Amine R.", method: "EDAHABIA", status: "CAPTURED", pill: "bg-primary-fixed/40 text-on-primary-fixed-variant", amount: "1,250 DZD" },
            { id: "TXN-88212", ref: "HX-1102-AA", user: "Yacine K.", method: "CIB", status: "FLAGGED", pill: "bg-tertiary-fixed/60 text-on-tertiary-fixed", amount: "2,450 DZD" },
            { id: "TXN-88214", ref: "QZ-1120-KL", user: "Meriem A.", method: "BANK", status: "REFUNDED", pill: "bg-error-container text-on-error-container", amount: "1,800 DZD" },
          ].map((t) => (
            <div key={t.id} className="grid grid-cols-7 items-center border-t border-outline-variant/10 px-4 py-4 text-sm">
              <div className="font-extrabold text-primary-container">{t.id}</div>
              <div className="col-span-2">
                <div className="font-extrabold text-on-surface">{t.ref}</div>
                <div className="text-[10px] font-bold text-on-surface-variant">{t.user}</div>
              </div>
              <div className="text-xs font-extrabold text-on-surface">{t.method}</div>
              <div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold ${t.pill}`}>{t.status}</span>
              </div>
              <div className="text-right font-extrabold text-on-surface">{t.amount}</div>
              <div className="text-right">
                <button type="button" className="rounded-full bg-surface-container-low px-4 py-2 text-xs font-extrabold text-on-surface active:scale-95">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

