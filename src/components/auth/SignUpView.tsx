import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AuthTransactionFooter } from "./AuthTransactionFooter";
import { SignUpForm } from "./SignUpForm";

const COAST_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB2sU18MYhDHjnPCiA7IAhCezIcG_W9NmC5hsuauVEL_u6TtySDEJXC9R_l2ZG949MjGZMU3gB1tL2sD1yW8T5KbG3qFlsy63EeIxCoPiEIiNSci5cNN3GdbTVNgeW6jE5dJNinpTQgeDaOBw7Uxhfjdtf9JUHEdkkXq1zUl6Lfhx4KuhPOU_bvFJL2F0YdrRLk8zt5wG-cpERIx7Y06_tzHRgMxbn8Pflf0B7AXBSPKtYh3NgPBKgIenxQ50Hn03t0_luf0GJNOQc1";

const trustCards = [
  {
    icon: "verified_user" as const,
    title: "Utilisateurs Vérifiés",
    subtitle: "Sécurité et confiance avant tout",
  },
  {
    icon: "lock" as const,
    title: "Paiement Sécurisé",
    subtitle: "Transactions transparentes et protégées",
  },
  {
    icon: "support_agent" as const,
    title: "Support Local",
    subtitle: "Une équipe à votre écoute 24/7",
  },
];

export function SignUpView() {
  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col md:flex-row">
        <section className="relative hidden min-h-[min(100vh,900px)] w-full overflow-hidden bg-primary-container md:flex md:w-1/2 md:items-center md:justify-center md:p-12">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[#82d3de] blur-[100px]" />
            <div className="absolute bottom-[-5%] left-[-5%] h-[400px] w-[400px] rounded-full bg-tertiary-fixed-dim blur-[100px]" />
          </div>
          <div className="relative z-10 max-w-xl text-white">
            <div className="mb-12">
              <Link href="/" className="mb-8 block font-headline text-3xl font-extrabold tracking-tight text-white">
                Ri7la
              </Link>
              <h1 className="mb-6 font-headline text-4xl font-bold leading-tight md:text-5xl">
                Rejoignez la révolution du voyage en Algérie.
              </h1>
              <p className="mb-10 font-body text-lg leading-relaxed text-white/80 md:text-xl">
                Voyagez en toute confiance, partagez vos trajets et découvrez une nouvelle façon de
                se déplacer à travers le pays.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {trustCards.map((card) => (
                <div
                  key={card.title}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-md"
                >
                  <div className="rounded-lg bg-[#82d3de]/20 p-2">
                    <MaterialIcon name={card.icon} className="!text-2xl text-[#82d3de]" />
                  </div>
                  <div>
                    <p className="font-headline font-semibold">{card.title}</p>
                    <p className="text-sm text-white/60">{card.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 h-1/2 w-3/4 opacity-30">
            <div className="relative h-full w-full">
              <Image
                src={COAST_IMAGE}
                alt=""
                fill
                className="rounded-tl-[100px] object-cover object-bottom"
                sizes="50vw"
                priority
              />
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-surface p-6 md:w-1/2 md:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8 md:hidden">
              <Link href="/" className="font-headline text-2xl font-bold text-primary">
                Ri7la
              </Link>
            </div>
            <div className="mb-10">
              <h2 className="mb-2 font-headline text-3xl font-bold text-on-surface">
                Créer un compte
              </h2>
              <p className="text-on-surface-variant">
                Inscrivez-vous gratuitement et commencez votre voyage.
              </p>
            </div>
            <SignUpForm />
          </div>
        </section>
      </main>
      <AuthTransactionFooter variant="signup" />
    </>
  );
}
