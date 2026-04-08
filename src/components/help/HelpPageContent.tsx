import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const categories = [
  {
    icon: "calendar_month",
    title: "Booking",
    desc: "Gérez vos réservations, vérifiez vos billets et modifiez vos trajets en quelques clics.",
  },
  {
    icon: "credit_card",
    title: "Payments",
    desc: "Informations sur les modes de paiement, la sécurité et la facturation.",
  },
  {
    icon: "directions_car",
    title: "Carpooling",
    desc: "Tout ce que vous devez savoir pour partager vos trajets en toute confiance.",
  },
  {
    icon: "directions_bus",
    title: "Bus tickets",
    desc: "Horaires, gares routières et conditions de voyage pour nos lignes de bus.",
  },
  {
    icon: "refresh",
    title: "Cancellations & refunds",
    desc: "Comprendre notre politique de remboursement et comment annuler un trajet.",
  },
  {
    icon: "person",
    title: "Account & verification",
    desc: "Gérez votre profil, vos avis et la vérification de votre identité.",
  },
] as const;

const faqs = [
  {
    q: "Comment réserver un trajet ?",
    a: "Recherchez votre départ et destination sur la page d’accueil, choisissez un covoiturage ou un bus, puis suivez les étapes jusqu’au paiement sécurisé.",
  },
  {
    q: "Comment fonctionnent les paiements ?",
    a: "Ri7la accepte la carte, Edahabia, CIB et d’autres moyens selon le trajet. Le montant est indiqué avant validation et vous recevez une confirmation par e-mail.",
  },
  {
    q: "Quelle est la politique d'annulation ?",
    a: "Les conditions dépendent du conducteur ou du transporteur. Consultez les détails sur votre billet ou notre page Politique de remboursement.",
  },
  {
    q: "Puis-je modifier ma réservation après coup ?",
    a: "Selon disponibilité et politique du voyage, vous pouvez parfois modifier la date ou le nombre de passagers depuis Mes réservations ou en contactant le support.",
  },
];

export function HelpPageContent() {
  return (
    <main className="pt-20">
      <section className="relative overflow-hidden bg-primary-container py-24">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-tertiary-fixed blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-secondary-container blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-6 font-headline text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-on-primary-container opacity-90 md:text-xl">
            Trouvez des réponses rapides à vos questions sur le covoiturage et les voyages en bus.
          </p>
          <div className="group relative mx-auto max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
              <MaterialIcon
                name="search"
                className="!text-2xl text-outline transition-colors group-focus-within:text-primary"
              />
            </div>
            <label htmlFor="help-search" className="sr-only">
              Rechercher dans l&apos;aide
            </label>
            <input
              id="help-search"
              type="search"
              placeholder="Rechercher un sujet ou un mot-clé..."
              className="w-full rounded-2xl border-none bg-surface-container-lowest py-6 pl-16 pr-8 text-lg text-on-surface shadow-xl transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="group ambient-shadow cursor-pointer rounded-xl bg-surface-container-lowest p-8 transition-all duration-300 hover:bg-primary-container"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-white/20">
                <MaterialIcon
                  name={cat.icon}
                  className="!text-2xl text-primary transition-colors group-hover:text-white"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold text-on-surface transition-colors group-hover:text-white">
                {cat.title}
              </h3>
              <p className="text-on-surface-variant transition-colors group-hover:text-on-primary-container">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-headline text-3xl font-bold text-on-surface">
            Questions populaires
          </h2>
          <div className="space-y-4">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group ambient-shadow overflow-hidden rounded-xl bg-surface-container-lowest open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-8 py-6 text-left transition-colors hover:bg-slate-50 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="text-lg font-semibold text-on-surface">{item.q}</span>
                  <MaterialIcon
                    name="expand_more"
                    className="!text-2xl text-outline transition-transform group-open:rotate-180 group-hover:text-primary"
                  />
                </summary>
                <p className="border-t border-outline-variant/20 px-8 pb-6 pt-4 text-sm leading-relaxed text-on-surface-variant">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24">
        <div className="ambient-shadow relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-container p-12 md:flex-row">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="mb-4 font-headline text-3xl font-bold text-white">
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>
            <p className="max-w-lg text-lg text-on-primary-container opacity-90">
              Notre équipe de conciergerie digitale est disponible 24/7 pour vous accompagner dans
              votre voyage.
            </p>
          </div>
          <div className="relative z-10">
            <Link
              href="/help#contact"
              className="inline-block rounded-full bg-tertiary px-10 py-4 text-lg font-bold text-white shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
            >
              Contacter le support
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white opacity-5" />
        </div>
      </section>
    </main>
  );
}
