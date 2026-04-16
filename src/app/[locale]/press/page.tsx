import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Presse — Saafir",
  description: "Ressources presse et contact média pour Saafir.",
};

export default function PressPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-20 pt-28 md:px-8 md:pt-32">
        <div className="rounded-3xl bg-surface-container-lowest p-10 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-tertiary-fixed/40">
            <MaterialIcon name="newspaper" className="!text-3xl text-tertiary" />
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            Presse
          </h1>
          <p className="mt-4 max-w-2xl text-on-surface-variant">
            Cette page est une version MVP. Les ressources presse (logos, screenshots, kit média) seront publiées ici.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-surface-container-low p-6">
              <div className="text-sm font-extrabold text-on-surface">Contact média</div>
              <p className="mt-2 text-sm text-on-surface-variant">
                Pour interviews, communiqués et partenariats, contactez-nous via le support.
              </p>
              <Link
                href="/help"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-on-primary shadow-lg shadow-primary/10 active:scale-95"
              >
                Contact Support
                <MaterialIcon name="arrow_forward" className="!text-lg" />
              </Link>
            </div>

            <div className="rounded-2xl bg-primary-container p-6 text-white">
              <div className="text-sm font-extrabold">Brand assets</div>
              <p className="mt-2 text-sm text-white/80">
                Download logos and guidelines (coming soon).
              </p>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary-container active:scale-95"
              >
                Download
                <MaterialIcon name="download" className="!text-lg" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
