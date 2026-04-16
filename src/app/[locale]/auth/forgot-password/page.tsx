import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié — Saafir",
  description: "Réinitialisez votre mot de passe Saafir ou contactez le support.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />

      <main className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center px-6 pb-20">
        <div className="w-full rounded-2xl bg-surface-container-lowest p-10 shadow-[0_24px_48px_-12px_rgba(0,83,91,0.12)]">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high">
            <MaterialIcon name="history" className="!text-2xl text-primary" />
          </div>

          <h1 className="text-center font-headline text-3xl font-extrabold text-on-surface">
            Mot de passe oublié ?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-center text-on-surface-variant">
            Entrez votre adresse e-mail ou votre numéro de téléphone pour recevoir un code de réinitialisation.
          </p>

          <div className="mt-10">
            <ForgotPasswordForm />
            <Link
              href="/auth/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-primary-container hover:underline"
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
            <Link href="/help" className="hover:text-primary">Contact Us</Link>
          </div>
          <div>© {new Date().getFullYear()} Saafir. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
