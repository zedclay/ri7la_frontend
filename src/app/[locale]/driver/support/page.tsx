import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function DriverSupportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">Support</h1>
          <p className="mt-1 text-on-surface-variant">
            Get help with onboarding, trip issues, disputes, or payouts.
          </p>
        </div>
        <Link
          href="/help"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
        >
          Help Center
          <MaterialIcon name="arrow_forward" className="!text-lg" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { icon: "verified_user", title: "Onboarding", desc: "Documents, verification, and vehicle setup." },
          { icon: "route", title: "Trips", desc: "Issues with passengers, cancellations, or incidents." },
          { icon: "payments", title: "Payouts", desc: "Bank details, payout schedule, and disputes." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-low">
              <MaterialIcon name={c.icon} className="!text-2xl text-primary" />
            </div>
            <div className="text-sm font-extrabold text-on-surface">{c.title}</div>
            <p className="mt-1 text-sm text-on-surface-variant">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 text-sm font-extrabold text-on-surface">New Support Ticket</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Issue type</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  Select a category
                  <MaterialIcon name="expand_more" className="!text-xl text-outline" />
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Priority</div>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface">
                  Standard
                  <MaterialIcon name="expand_more" className="!text-xl text-outline" />
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</div>
              <input className="mt-2 w-full rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="Brief summary" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Description</div>
              <textarea className="mt-2 min-h-32 w-full resize-none rounded-xl border-none bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary" placeholder="What happened?" />
            </div>
            <button type="button" className="w-full rounded-full bg-primary py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95">
              Submit Request
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-primary-container p-8 text-white shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
            <MaterialIcon name="support_agent" className="!text-lg" />
            Dedicated 24/7
          </div>
          <div className="text-2xl font-extrabold leading-tight">Support Drivers 24/7</div>
          <p className="mt-2 max-w-md text-white/80">
            Encountering issues with a passenger or the route? Our team is here to assist immediately.
          </p>
          <button type="button" className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

