import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default function PassengerReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Reviews</h1>
        <p className="mt-1 text-on-surface-variant">
          Your reviews and ratings across past journeys.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-primary-container p-6 text-white shadow-sm">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">Average rating</div>
          <div className="mt-2 text-5xl font-extrabold">4.8</div>
          <div className="mt-2 flex items-center gap-1 text-white/90">
            {Array.from({ length: 5 }).map((_, i) => (
              <MaterialIcon key={i} name="star" filled className="!text-xl" />
            ))}
          </div>
          <div className="mt-3 text-sm text-white/80">Based on 12 trips</div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          {[
            { who: "Taharat Transport", text: "Passenger was on time and respectful.", rating: 5, date: "Oct 2024" },
            { who: "Ahmed (Driver)", text: "Good communication and clear meeting point.", rating: 4, date: "Sep 2024" },
          ].map((r) => (
            <div key={r.who + r.date} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-on-surface">{r.who}</div>
                  <div className="text-[10px] font-bold text-on-surface-variant">{r.date}</div>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <MaterialIcon key={i} name="star" filled={i < r.rating} className="!text-sm" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-on-surface-variant">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

