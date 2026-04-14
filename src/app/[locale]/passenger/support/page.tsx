import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function PassengerSupportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Support</h1>
          <p className="mt-1 text-on-surface-variant">
            Get help with bookings, payments, cancellations, and account issues.
          </p>
        </div>
        <Link
          href="/help"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
        >
          Help Center
          <MaterialIcon name="arrow_forward" className="!text-lg" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { icon: "calendar_month", title: "Booking Help", desc: "Modify, confirm or manage upcoming trips." },
          { icon: "credit_card", title: "Payment Issues", desc: "Invoices, refunds, and secure payment methods." },
          { icon: "refresh", title: "Cancellations", desc: "Cancel routes or request partial credits." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low">
              <MaterialIcon name={c.icon} className="!text-2xl text-primary" />
            </div>
            <div className="text-sm font-bold text-on-surface">{c.title}</div>
            <p className="mt-1 text-sm text-on-surface-variant">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 text-sm font-bold text-on-surface">New Support Request</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Issue type
                </label>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  Select a category
                  <MaterialIcon name="expand_more" className="!text-xl text-outline" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Priority
                </label>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  Standard
                  <MaterialIcon name="expand_more" className="!text-xl text-outline" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Subject
              </label>
              <input
                className="mt-2 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none focus:ring-2 focus:ring-primary md:text-sm"
                placeholder="Brief summary of your issue"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Description
              </label>
              <textarea
                className="mt-2 min-h-32 w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-base text-on-surface outline-none focus:ring-2 focus:ring-primary md:text-sm"
                placeholder="How can our concierge help you?"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-full bg-primary py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
            >
              Submit Request
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-primary-container p-8 text-white shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
            <MaterialIcon name="smart_toy" className="!text-lg" />
            Instant answers
          </div>
          <div className="text-2xl font-extrabold leading-tight">Need help with a trip?</div>
          <p className="mt-2 max-w-md text-white/80">
            Our 24/7 concierge can help solve common booking and payment issues in seconds.
          </p>
          <button
            type="button"
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95"
          >
            Chat with Ri7laBot
          </button>
        </div>
      </div>
    </div>
  );
}
