import Link from "next/link";

export function PartnerCTA() {
  return (
    <section className="bg-background pb-16 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl bg-primary p-8 text-white shadow-lg sm:p-10">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <CarIcon className="h-6 w-6" />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-semibold sm:text-3xl">
                Devenez conducteur
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90">
                Proposez vos places libres et contribuez aux trajets inter-villes en Algérie.
              </p>
            </div>
            <Link
              href="/driver/trips/new"
              className="mt-8 inline-flex w-fit items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-white/95"
            >
              Publier un trajet
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-[#eef2f6] p-8 shadow-sm sm:p-10">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-primary shadow-sm">
                <BuildingIcon className="h-6 w-6" />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
                Partenaire autocariste
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Gérez vos lignes, flotte et ventes de billets aux côtés de Ri7la.
              </p>
            </div>
            <Link
              href="/operator/onboarding"
              className="mt-8 inline-flex w-fit items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
            >
              Nous rejoindre
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-9m9 0a3 3 0 11-5.196-2.192M4.875 18.75H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25"
      />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
