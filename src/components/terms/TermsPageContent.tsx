import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { TermsLegalSidebar } from "./TermsLegalSidebar";

const LAST_UPDATED = "Oct 2024";

export function TermsPageContent() {
  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-28 md:px-8 md:pt-32">
      <header className="mb-12 md:mb-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant">
          <MaterialIcon name="update" className="!text-sm" />
          Dernière mise à jour : {LAST_UPDATED}
        </div>
        <h1 className="mb-4 font-headline text-4xl font-extrabold tracking-tight text-primary md:text-5xl lg:text-6xl">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          Bienvenue sur Ri7la. Ces conditions régissent votre utilisation de notre plateforme de
          voyage. En accédant à nos services, vous acceptez ces termes dans leur intégralité.
        </p>
      </header>

      <section className="mb-12">
        <div className="group relative flex flex-col items-center gap-8 overflow-hidden rounded-2xl bg-primary-container p-8 md:flex-row">
          <div className="absolute right-0 top-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-110">
            <MaterialIcon name="verified_user" className="!text-9xl text-white" />
          </div>
          <div className="relative z-10 flex-1">
            <h3 className="mb-2 text-2xl font-bold text-white">
              Note sur la Confiance et la Sécurité
            </h3>
            <p className="font-medium leading-relaxed text-on-primary-container/90">
              Notre priorité absolue est votre sécurité. Chaque trajet sur Ri7la est conçu pour
              offrir une expérience transparente, sécurisée et fiable. Nous nous engageons à
              protéger vos données et à assurer une qualité de service irréprochable auprès de tous
              nos partenaires de transport.
            </p>
          </div>
          <div className="relative z-10 shrink-0">
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
              <div className="mb-2 flex items-center gap-3 text-white">
                <MaterialIcon name="support_agent" />
                <span className="font-bold">Assistance 24/7</span>
              </div>
              <p className="text-xs text-white/80">
                Besoin d&apos;aide ? Notre équipe est disponible en tout temps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-12 md:flex-row md:gap-12">
        <TermsLegalSidebar />
        <article className="flex-1 space-y-16">
          <section id="intro" className="scroll-mt-32">
            <h2 className="mb-6 font-headline text-3xl font-bold text-on-surface">
              1. Introduction
            </h2>
            <div className="max-w-none space-y-4 leading-relaxed text-on-surface-variant">
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (les &quot;Conditions&quot;)
                s&apos;appliquent à l&apos;ensemble des services proposés par Ri7la Technologies,
                y compris via notre site web et nos applications mobiles. En utilisant Ri7la, vous
                reconnaissez avoir pris connaissance de ces conditions et vous engagez à les
                respecter.
              </p>
              <p>
                Ri7la agit en tant que plateforme de mise en relation entre des voyageurs et des
                prestataires de transport. Nous ne sommes pas nous-mêmes un transporteur, mais un
                facilitateur technologique.
              </p>
            </div>
          </section>

          <section id="eligibility" className="scroll-mt-32">
            <h2 className="mb-6 font-headline text-3xl font-bold text-on-surface">
              2. Éligibilité et Inscription
            </h2>
            <div className="space-y-6 rounded-2xl bg-surface-container-low p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary-container/10 p-2">
                  <MaterialIcon name="person" className="!text-xl text-primary" />
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-on-surface">Âge Minimum</h4>
                  <p className="text-sm text-on-surface-variant">
                    Vous devez être âgé d&apos;au moins 18 ans pour créer un compte et effectuer des
                    réservations sur la plateforme Ri7la.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary-container/10 p-2">
                  <MaterialIcon name="verified" className="!text-xl text-primary" />
                </div>
                <div>
                  <h4 className="mb-1 font-bold text-on-surface">Exactitude des Informations</h4>
                  <p className="text-sm text-on-surface-variant">
                    L&apos;utilisateur s&apos;engage à fournir des informations exactes, complètes
                    et à jour lors de son inscription.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="booking" className="scroll-mt-32">
            <h2 className="mb-6 font-headline text-3xl font-bold text-on-surface">
              3. Règles de Réservation
            </h2>
            <div className="space-y-6 leading-relaxed text-on-surface-variant">
              <p>
                Toute réservation effectuée via la plateforme est soumise à la confirmation du
                transporteur partenaire. Une fois confirmée, la réservation constitue un contrat
                direct entre vous et le transporteur.
              </p>
              <ul className="list-none space-y-4 p-0">
                <li className="flex items-start gap-3">
                  <MaterialIcon
                    name="check_circle"
                    className="!text-sm shrink-0 text-primary-container"
                  />
                  <span>Les billets sont nominatifs et non transférables sauf mention contraire.</span>
                </li>
                <li className="flex items-start gap-3">
                  <MaterialIcon
                    name="check_circle"
                    className="!text-sm shrink-0 text-primary-container"
                  />
                  <span>
                    L&apos;heure de départ est indicative et peut varier selon les conditions de
                    circulation.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <MaterialIcon
                    name="check_circle"
                    className="!text-sm shrink-0 text-primary-container"
                  />
                  <span>
                    Le transporteur se réserve le droit de refuser l&apos;embarquement pour des
                    raisons de sécurité.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section id="payments" className="scroll-mt-32">
            <h2 className="mb-6 font-headline text-3xl font-bold text-on-surface">
              4. Tarification et Paiement
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                <h4 className="mb-3 font-bold text-primary">Modes de Paiement</h4>
                <p className="text-sm text-on-surface-variant">
                  Nous acceptons les cartes de crédit/débit majeures, ainsi que les solutions de
                  paiement mobile locales pour plus de flexibilité.
                </p>
              </div>
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
                <h4 className="mb-3 font-bold text-primary">Sécurité des Transactions</h4>
                <p className="text-sm text-on-surface-variant">
                  Toutes les transactions sont chiffrées via des protocoles de sécurité SSL/TLS
                  conformes aux normes bancaires internationales.
                </p>
              </div>
            </div>
          </section>

          <section id="cancel" className="scroll-mt-32">
            <h2 className="mb-6 font-headline text-3xl font-bold text-on-surface">
              5. Politique d&apos;Annulation
            </h2>
            <div className="relative space-y-8 border-l-2 border-primary-container pl-8">
              <div className="relative">
                <span className="absolute -left-[calc(0.5rem+9px)] top-1.5 h-4 w-4 rounded-full bg-primary" />
                <h4 className="mb-2 font-bold text-primary">Plus de 24h avant le départ</h4>
                <p className="text-on-surface-variant">
                  Remboursement intégral (100%) déduction faite des frais de service minimes.
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[calc(0.5rem+9px)] top-1.5 h-4 w-4 rounded-full bg-primary-container" />
                <h4 className="mb-2 font-bold text-primary">Entre 24h et 6h avant le départ</h4>
                <p className="text-on-surface-variant">
                  Remboursement partiel (50%) ou crédit de voyage sur votre compte Ri7la.
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[calc(0.5rem+9px)] top-1.5 h-4 w-4 rounded-full bg-outline-variant" />
                <h4 className="mb-2 font-bold text-primary">Moins de 6h ou non-présentation</h4>
                <p className="text-on-surface-variant">
                  Aucun remboursement ne sera effectué pour les annulations tardives.
                </p>
              </div>
            </div>
          </section>

          <section id="liability" className="scroll-mt-32">
            <h2 className="mb-6 font-headline text-3xl font-bold text-on-surface">
              6. Limitation de Responsabilité
            </h2>
            <div className="rounded-2xl bg-surface-container p-8 italic leading-loose text-on-surface-variant">
              &quot;Ri7la Technologies ne pourra être tenue responsable des dommages indirects,
              y compris les pertes de profits, résultant de l&apos;utilisation de nos services.
              Bien que nous fassions tout notre possible pour assurer la ponctualité de nos
              partenaires, nous ne garantissons pas l&apos;absence de retards dus à des
              circonstances imprévues (force majeure).&quot;
            </div>
          </section>

          <p className="text-sm text-on-surface-variant">
            Une question sur ces conditions ?{" "}
            <Link href="/help" className="font-medium text-primary-container underline">
              Contactez le support
            </Link>
            .
          </p>
        </article>
      </div>
    </main>
  );
}
