import Link from "next/link";

const routes = [
  { from: "Alger", to: "Oran", price: "1 200 DA", carpool: true, bus: true },
  { from: "Alger", to: "Constantine", price: "1 500 DA", carpool: true, bus: true },
  { from: "Oran", to: "Tlemcen", price: "900 DA", carpool: true, bus: false },
];

export function PopularRoutes() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-foreground sm:text-4xl">
              Trajets populaires
            </h2>
            <p className="mt-2 text-muted">À partir des meilleurs tarifs constatés.</p>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <Link
              key={`${r.from}-${r.to}`}
              href={`/search?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {r.from} <span className="text-muted">→</span> {r.to}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-primary">{r.price}</p>
                </div>
                <div className="flex gap-1.5">
                  {r.carpool && (
                    <span
                      className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      title="Covoiturage disponible"
                    >
                      Covoit
                    </span>
                  )}
                  {r.bus && (
                    <span
                      className="rounded-md bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-800"
                      title="Bus disponible"
                    >
                      Bus
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
