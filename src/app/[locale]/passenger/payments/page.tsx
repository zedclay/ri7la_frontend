import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function PassengerPaymentsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Payments</h1>
        <p className="mt-1 text-on-surface-variant">
          Manage payment methods and view payment history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low">
              <MaterialIcon name="credit_card" className="!text-2xl text-primary" />
            </div>
            <div className="text-sm font-bold text-on-surface">Saved Cards</div>
          </div>
          <p className="text-sm text-on-surface-variant">Add CIB or bank cards to speed up checkout.</p>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
          >
            Add Payment Method
          </button>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-bold text-on-surface">Recent Transactions</div>
            <button type="button" className="text-xs font-bold text-primary underline underline-offset-4">
              Export
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-outline-variant/10">
            <div className="grid grid-cols-5 bg-surface-container-low px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              <div>Ref</div>
              <div className="col-span-2">Trip</div>
              <div>Status</div>
              <div className="text-right">Amount</div>
            </div>
            <div className="grid grid-cols-5 items-center px-4 py-4 text-sm">
              <div className="font-bold text-primary-container">#TXN-88210</div>
              <div className="col-span-2 text-on-surface">Algiers → Oran</div>
              <div className="inline-flex w-fit rounded-full bg-primary-fixed/40 px-3 py-1 text-[10px] font-bold text-on-primary-fixed-variant">
                Success
              </div>
              <div className="text-right font-extrabold text-on-surface">2,400 DZD</div>
            </div>
            <div className="grid grid-cols-5 items-center border-t border-outline-variant/10 px-4 py-4 text-sm">
              <div className="font-bold text-primary-container">#TXN-88212</div>
              <div className="col-span-2 text-on-surface">Algiers → Constantine</div>
              <div className="inline-flex w-fit rounded-full bg-error-container px-3 py-1 text-[10px] font-bold text-on-error-container">
                Failed
              </div>
              <div className="text-right font-extrabold text-on-surface">4,850 DZD</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

