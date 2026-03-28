import Image from "next/image";
import Link from "next/link";

export function TravelModes() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-3xl font-semibold text-foreground sm:text-4xl">
          Choisissez votre mode de voyage
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted">
          Économisez en covoiturage ou voyagez au confort en bus — le choix est à vous.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div className="relative aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=900&q=80"
                alt="Covoiturage"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
                Économique
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">Covoiturage</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Partagez les frais avec des conducteurs vérifiés sur des trajets qui vous
                ressemblent.
              </p>
              <Link
                href="/search?mode=carpool"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Trouver un covoiturage
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>

          <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            <div className="relative aspect-[16/10]">
              <Image
                src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=900&q=80"
                alt="Bus"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
                Confortable
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">
                Réservation de bus
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Sièges attribués, horaires clairs et partenaires autocaristes de confiance.
              </p>
              <Link
                href="/search?mode=bus"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Consulter les horaires
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
