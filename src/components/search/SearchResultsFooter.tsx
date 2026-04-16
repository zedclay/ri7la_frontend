import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function SearchResultsFooter() {
  return (
    <footer className="mt-auto w-full border-t border-primary-container/10 bg-surface-container-low font-body text-sm leading-relaxed">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 py-16 md:grid-cols-2 md:px-12 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src="/saafir-icon.svg" alt="" className="h-9 w-9" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-7 w-auto" />
          </div>
          <p className="text-on-surface-variant">
            Connecting Algeria, one journey at a time. Safe, reliable, and accessible
            transportation for everyone.
          </p>
        </div>
        <div className="space-y-4">
          <h6 className="font-bold text-primary-container">Company</h6>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-on-surface-variant transition-colors hover:text-primary-container">
                About Saafir
              </Link>
            </li>
            <li>
              <Link href="/help" className="text-on-surface-variant transition-colors hover:text-primary-container">
                Carpool Rules
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-on-surface-variant transition-colors hover:text-primary-container">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h6 className="font-bold text-primary-container">Providers</h6>
          <ul className="space-y-2">
            <li>
              <Link href="/help" className="text-on-surface-variant transition-colors hover:text-primary-container">
                Bus & Train (Official)
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-on-surface-variant transition-colors hover:text-primary-container">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h6 className="font-bold text-primary-container">Support</h6>
          <ul className="space-y-2">
            <li>
              <Link href="/help" className="text-on-surface-variant transition-colors hover:text-primary-container">
                Contact Support
              </Link>
            </li>
            <li className="mt-4 flex items-center gap-2">
              <MaterialIcon name="phone_in_talk" className="!text-xl text-primary" />
              <span className="font-bold text-on-surface">+213 (0) 23 45 67 89</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-outline-variant/10 px-8 py-8 md:flex-row md:px-12">
        <p className="text-xs text-on-surface-variant">
          © {new Date().getFullYear()} Saafir Algeria. Moving together, better.
        </p>
        <div className="flex gap-6 text-primary">
          <MaterialIcon name="public" className="!text-xl cursor-pointer hover:opacity-80" />
          <MaterialIcon name="share" className="!text-xl cursor-pointer hover:opacity-80" />
          <MaterialIcon name="travel_explore" className="!text-xl cursor-pointer hover:opacity-80" />
        </div>
      </div>
    </footer>
  );
}
