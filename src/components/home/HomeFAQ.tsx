import Link from "next/link";

const faqs = [
  {
    q: "Comment payer ma réservation ?",
    a: "Vous pouvez régler par carte bancaire, Edahabia, CIB ou, selon les trajets, par virement avec justificatif. Le détail s’affiche avant le paiement.",
  },
  {
    q: "Le service est-il disponible partout en Algérie ?",
    a: "Ri7la couvre progressivement les principales villes et axes inter-villes. La recherche affiche uniquement les trajets disponibles pour vos critères.",
  },
  {
    q: "Puis-je annuler ou modifier ma réservation ?",
    a: "Les conditions d’annulation et de remboursement dépendent du transporteur ou du conducteur. Consultez la politique indiquée sur votre billet.",
  },
];

export function HomeFAQ() {
  return (
    <section className="border-t border-border bg-card py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Questions fréquentes
        </h2>
        <div className="mt-10 space-y-3">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-background px-5 py-1 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none py-4 font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <ChevronIcon className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link href="/help" className="text-sm font-semibold text-primary hover:underline">
            Consulter notre centre d&apos;aide
          </Link>
        </p>
      </div>
    </section>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
