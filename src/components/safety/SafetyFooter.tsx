import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function SafetyFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 pb-8 pt-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4 md:px-12 lg:grid-cols-6">
        <div className="col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <img src="/saafir-icon.svg" alt="" className="h-9 w-9" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-7 w-auto" />
          </div>
          <p className="mb-6 font-body text-sm leading-relaxed text-slate-500">
            Saafir Algérie : Votre compagnon de route pour des voyages sûrs, abordables et confortables
            à travers toutes les wilayas.
          </p>
        </div>
        <div>
          <h5 className="mb-4 font-headline text-sm font-bold text-on-surface">Légal</h5>
          <ul className="space-y-3">
            <li>
              <Link
                href="/privacy"
                className="inline-block font-body text-sm text-slate-500 transition-transform hover:translate-x-1 hover:text-primary-container"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="inline-block font-body text-sm text-slate-500 transition-transform hover:translate-x-1 hover:text-primary-container"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 font-headline text-sm font-bold text-on-surface">Confiance</h5>
          <ul className="space-y-3">
            <li>
              <Link
                href="/safety"
                className="inline-block font-body text-sm font-bold text-primary-container transition-transform hover:translate-x-1"
              >
                Safety Guidelines
              </Link>
            </li>
            <li>
              <Link
                href="/driver/onboarding"
                className="inline-block font-body text-sm text-slate-500 transition-transform hover:translate-x-1 hover:text-primary-container"
              >
                Driver Requirements
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="mb-4 font-headline text-sm font-bold text-on-surface">Support</h5>
          <ul className="space-y-3">
            <li>
              <Link
                href="/help"
                className="inline-block font-body text-sm text-slate-500 transition-transform hover:translate-x-1 hover:text-primary-container"
              >
                Contact Support
              </Link>
            </li>
            <li>
              <Link
                href="/press"
                className="inline-block font-body text-sm text-slate-500 transition-transform hover:translate-x-1 hover:text-primary-container"
              >
                Press Kit
              </Link>
            </li>
          </ul>
        </div>
        <div id="app-download">
          <h5 className="mb-4 font-headline text-sm font-bold text-on-surface">App</h5>
          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-on-surface p-2 text-white transition-colors hover:bg-surface-tint"
          >
            <MaterialIcon name="phone_iphone" className="!text-lg" />
            <span className="text-left text-[10px] font-bold uppercase leading-tight">
              Download for
              <br />
              iOS
            </span>
          </button>
        </div>
      </div>
      <div className="mx-auto mt-16 max-w-7xl border-t border-slate-200 px-6 pt-8 text-center md:px-12">
        <p className="font-body text-xs text-slate-400">
          © {new Date().getFullYear()} Saafir Algeria. All rights reserved. Your safety is our
          priority.
        </p>
      </div>
    </footer>
  );
}
