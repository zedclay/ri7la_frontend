import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe — Saafir",
  description: "Entrez le code de vérification et définissez un nouveau mot de passe.",
};

function OtpBoxes() {
  return (
    <div className="grid grid-cols-6 gap-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <input
          key={i}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit ${i}`}
          className="h-12 w-full rounded-xl border-none bg-surface-container-low text-center text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary"
        />
      ))}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 text-primary-container">
          <img src="/saafir-icon.svg" alt="" className="h-7 w-7" />
          <img src="/saafir-wordmark.svg" alt="Saafir" className="h-5 w-auto" />
        </Link>
        <Link href="/help" className="text-sm font-semibold text-on-surface-variant hover:text-primary">
          Aide
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full rounded-2xl bg-surface-container-lowest p-10 shadow-[0_24px_48px_-12px_rgba(0,83,91,0.12)]">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="h-2 w-10 rounded-full bg-outline-variant/30" />
            <span className="h-2 w-10 rounded-full bg-primary" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
              Étape 2 sur 2
            </span>
          </div>

          <h1 className="text-center font-headline text-3xl font-extrabold text-on-surface">
            Réinitialiser votre mot de passe
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-on-surface-variant">
            Un code a été envoyé à votre e-mail. Entrez-le ci-dessous puis définissez votre nouveau mot de passe.
          </p>

          <div className="mt-10 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-on-surface">Code de vérification</label>
                <button type="button" className="text-xs font-bold text-primary underline underline-offset-4">
                  Renvoyer le code
                </button>
              </div>
              <OtpBoxes />
            </div>

            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-semibold text-on-surface">
                Nouveau mot de passe
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <MaterialIcon name="lock" className="!text-xl text-outline group-focus-within:text-primary" />
                </div>
                <input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  className="block w-full rounded-xl border-none bg-surface-container-low py-3.5 pl-11 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-semibold text-on-surface">
                Confirmer le nouveau mot de passe
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <MaterialIcon name="lock_reset" className="!text-xl text-outline group-focus-within:text-primary" />
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="block w-full rounded-xl border-none bg-surface-container-low py-3.5 pl-11 pr-4 text-on-surface outline-none transition-all placeholder:text-outline focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center rounded-full bg-primary py-4 font-headline font-bold text-on-primary shadow-lg shadow-primary/10 transition-all active:scale-95"
            >
              Sauvegarder le mot de passe
            </Link>
            <Link
              href="/auth/login"
              className="mt-2 flex items-center justify-center gap-2 text-sm font-semibold text-primary-container hover:underline"
            >
              <MaterialIcon name="arrow_back" className="!text-lg" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-outline-variant/10 bg-surface-container-low px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-on-surface-variant md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/saafir-icon.svg" alt="" className="h-7 w-7" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-5 w-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/help" className="hover:text-primary">Help Center</Link>
          </div>
          <div>© {new Date().getFullYear()} Saafir. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
