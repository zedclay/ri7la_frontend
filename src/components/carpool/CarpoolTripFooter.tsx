import { Link } from "@/i18n/navigation";

export function CarpoolTripFooter() {
  return (
    <footer className="w-full bg-surface-container-low pb-8 pt-16">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src="/saafir-icon.svg" alt="" className="h-9 w-9" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-7 w-auto" />
          </div>
          <p className="max-w-sm font-body text-sm text-slate-500">
            Empowering seamless journeys across Algeria through trust-based carpooling and modern
            transportation technology.
          </p>
          <div className="font-body text-sm text-slate-500">
            © {new Date().getFullYear()} Saafir. All rights reserved.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Link
              href="/terms"
              className="block font-body text-sm text-slate-500 underline-offset-4 transition-all hover:text-slate-900 hover:underline hover:decoration-primary"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="block font-body text-sm text-slate-500 underline-offset-4 transition-all hover:text-slate-900 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/help"
              className="block font-body text-sm text-slate-500 underline-offset-4 transition-all hover:text-slate-900 hover:underline"
            >
              Support Center
            </Link>
          </div>
          <div className="space-y-3">
            <Link
              href="/safety"
              className="block font-body text-sm text-slate-500 underline-offset-4 transition-all hover:text-slate-900 hover:underline"
            >
              Safety Guidelines
            </Link>
            <Link
              href="/cookies"
              className="block font-body text-sm text-slate-500 underline-offset-4 transition-all hover:text-slate-900 hover:underline"
            >
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
