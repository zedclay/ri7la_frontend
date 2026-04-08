import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAGuNnB9YQrOn5Kme4rG_yjw6AvCyjQFgkiH3t7Lbj34oykdcq5slrhMvfFzpYSu9kCwRA6XB5H2HaGL8QxT3S1LQNHt3O4lDlDLaBNvYf7JlS8dzlclhkqIIvOmi3z7Jv_gsKCGIv7SqBV6EDOyW9lQnIOC84NNnfCnAVyFjKrwzMEbeq8iZ-6eYE0RNaISh5WKJiZAraPkev0A3F0eIUM_W7DLnSnm46ujp-E01N3Vr7ET_asqZOBY7eHNFajpBefXDLlUJpTjYnw";

const BUS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDdURobMabi0Jgg7o544ICCJQGJXlQc8dD3R7-O6bkGGempTCkElo4oa08oPGPxgPrOjV7N0arEjKWLXufkpFzu_0T89TdGjW8qKCu_KOFXo2xDfpRfqXa9BV0ZR2ebXj3N5R_omNifwf6J9-_Tyx4jCAUEPIXwwD_6R-qxQVZVTFKvfebBmJK6lJ64BE-ESl-18V8MUx28syovpFrCrOFeQC30ozpNGkBuriS8NeStstAOpK3nl25-5cp5UtbeFNIpV00GqHeTJdhB";

const pillars = [
  {
    icon: "badge",
    title: "Chauffeurs Vérifiés",
    desc: "Chaque conducteur passe par un contrôle d'identité rigoureux et une inspection de véhicule avant de rejoindre la plateforme.",
  },
  {
    icon: "lock",
    title: "Paiements Sécurisés",
    desc: "Vos transactions sont protégées par un cryptage SSL de niveau bancaire. Pas de frais cachés, transparence totale.",
  },
  {
    icon: "reviews",
    title: "Notes de la Communauté",
    desc: "Un système de retour d'expérience mutuel honnête pour maintenir les plus hauts standards de service et de respect.",
  },
  {
    icon: "confirmation_number",
    title: "Billets Digitaux",
    desc: "Plus de perte de billets. Votre historique et vos réservations sont accessibles 24/7 sur votre smartphone.",
  },
] as const;

const steps = [
  {
    n: "01",
    title: "Vérification des antécédents",
    desc: "Avant qu'un chauffeur ne puisse accepter son premier passager, nous vérifions ses antécédents judiciaires et la validité de tous ses documents officiels.",
  },
  {
    n: "02",
    title: "Suivi GPS en temps réel",
    desc: "Chaque trajet est surveillé par nos systèmes. Vous pouvez partager votre position en temps réel avec vos proches d'un simple clic.",
  },
  {
    n: "03",
    title: "Assurance voyage intégrée",
    desc: "Nous collaborons avec les meilleurs assureurs locaux pour garantir que vous êtes couvert dès le moment où vous montez dans le véhicule.",
  },
];

export function SafetyPageContent() {
  return (
    <main className="pt-24">
      <section className="relative overflow-hidden bg-surface px-6 py-20 lg:py-32">
        <div className="absolute top-0 right-0 -z-10 h-full w-1/2 bg-gradient-to-l from-primary-fixed/20 to-transparent opacity-50 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="z-10">
            <span className="mb-6 inline-block rounded-full bg-secondary-container px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider text-on-secondary-container">
              Engagement de Confiance
            </span>
            <h1 className="mb-6 font-headline text-5xl font-bold leading-[1.1] tracking-tight text-on-surface lg:text-7xl">
              Votre sécurité,
              <br />
              <span className="text-primary-container">notre priorité absolue.</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-on-surface-variant lg:text-xl">
              Chez Ri7la, nous redéfinissons le voyage en Algérie avec une approche centrée sur
              l&apos;humain et une technologie de pointe pour garantir chaque trajet.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/search"
                className="submerged-gradient ambient-shadow rounded-full px-8 py-4 font-headline text-base font-bold text-white transition-all active:scale-95"
              >
                Trouver un trajet
              </Link>
              <Link
                href="#piliers"
                className="rounded-full bg-surface-container-highest px-8 py-4 font-headline text-base font-bold text-on-surface transition-all hover:bg-surface-container-high"
              >
                En savoir plus
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="group relative aspect-square scale-105 rotate-3 overflow-hidden rounded-[2rem] shadow-2xl">
              <Image
                src={HERO_IMG}
                alt="Main sur le volant d&apos;une voiture moderne"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
            </div>
            <div className="ambient-shadow absolute -bottom-6 -left-6 flex max-w-xs items-center gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container">
                <MaterialIcon name="verified_user" filled className="!text-2xl" />
              </div>
              <div>
                <p className="font-headline text-sm font-bold text-on-surface">Certifié Sécurisé</p>
                <p className="font-body text-xs text-on-surface-variant">
                  Vérification multicouche activée
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="piliers" className="scroll-mt-24 bg-surface-container-low py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <h2 className="mb-4 font-headline text-3xl font-bold text-on-surface lg:text-4xl">
              Les Piliers de notre Confiance
            </h2>
            <p className="max-w-2xl text-on-surface-variant">
              Quatre fondements essentiels qui font de Ri7la le choix numéro un pour les voyageurs
              exigeants.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group rounded-xl bg-surface-container-lowest p-8 transition-all hover:bg-white hover:shadow-xl"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container/10 text-primary-container transition-colors group-hover:bg-primary-container group-hover:text-white">
                  <MaterialIcon name={p.icon} className="!text-3xl" />
                </div>
                <h3 className="mb-3 font-headline text-xl font-bold text-on-surface">{p.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-surface-container-lowest py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-20 px-6 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <Image
                src={BUS_IMG}
                alt="Autocar moderne sur une route algérienne"
                width={800}
                height={600}
                className="w-full rounded-[2.5rem] shadow-2xl"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute -right-12 top-12 hidden w-64 rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur-md md:block">
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-error" />
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface">
                    Live GPS Tracking
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full w-[75%] bg-primary-container" />
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="mb-12 font-headline text-3xl font-bold text-on-surface lg:text-4xl">
              Comment nous vous protégeons
            </h2>
            <div className="space-y-12">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-6">
                  <div className="font-headline text-4xl font-black leading-none text-outline-variant/30">
                    {s.n}
                  </div>
                  <div>
                    <h4 className="mb-2 font-headline text-xl font-bold text-on-surface">
                      {s.title}
                    </h4>
                    <p className="leading-relaxed text-on-surface-variant">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex flex-col items-center gap-12 overflow-hidden rounded-[2rem] bg-primary p-8 text-on-primary lg:flex-row lg:p-16">
            <div className="z-10 lg:w-2/3">
              <h2 className="mb-6 font-headline text-3xl font-bold lg:text-4xl">
                Support Dédié 24/7
              </h2>
              <p className="mb-10 max-w-xl text-lg text-on-primary/80">
                Un incident ? Une question ? Notre équipe de concierges numériques est disponible
                jour et nuit pour vous assister, peu importe où vous vous trouvez en Algérie.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/help"
                  className="flex items-center gap-3 rounded-full bg-white px-8 py-4 font-headline font-bold text-primary transition-all hover:bg-primary-fixed"
                >
                  <MaterialIcon name="support_agent" className="!text-xl" />
                  Contacter le support
                </Link>
                <Link
                  href="/help#contact"
                  className="flex items-center gap-3 rounded-full bg-error px-8 py-4 font-headline font-bold text-on-error transition-all active:scale-95"
                >
                  <MaterialIcon name="sos" filled className="!text-xl" />
                  Signaler un incident
                </Link>
              </div>
            </div>
            <div className="z-10 lg:w-1/3">
              <div className="rounded-2xl border border-on-primary/20 bg-on-primary/10 p-8 backdrop-blur-sm">
                <h4 className="mb-4 font-headline font-bold">Fonction SOS Active</h4>
                <p className="mb-6 text-sm leading-relaxed text-on-primary/70">
                  Le bouton SOS intégré à l&apos;application alerte instantanément nos services
                  d&apos;urgence et transmet vos coordonnées précises aux autorités locales si
                  nécessaire.
                </p>
                <div className="flex items-center gap-2 text-tertiary-fixed-dim">
                  <MaterialIcon name="shield_moon" className="!text-xl" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Veille de Nuit Activée
                  </span>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-primary-container opacity-30 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="mb-6 font-headline text-4xl font-bold text-on-surface">
          Prêt à voyager en toute sérénité ?
        </h2>
        <p className="mb-12 text-lg text-on-surface-variant">
          Rejoignez des milliers d&apos;utilisateurs qui font confiance à Ri7la pour leurs
          déplacements quotidiens et leurs aventures à travers le pays.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/search"
            className="submerged-gradient ambient-shadow rounded-full px-10 py-5 font-headline text-lg font-bold text-white transition-all hover:scale-105"
          >
            Trouver mon premier trajet
          </Link>
          <Link
            href="/driver/trips/new"
            className="rounded-full bg-tertiary px-10 py-5 font-headline text-lg font-bold text-on-tertiary transition-all hover:bg-tertiary-container"
          >
            Devenir Chauffeur Partenaire
          </Link>
        </div>
      </section>
    </main>
  );
}
