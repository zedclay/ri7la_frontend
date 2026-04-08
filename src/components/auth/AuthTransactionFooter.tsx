import { Link } from "@/i18n/navigation";

type Variant = "signup" | "login";

export function AuthTransactionFooter({ variant }: { variant: Variant }) {
  if (variant === "signup") {
    return (
      <footer className="w-full border-t border-slate-100 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 md:flex-row">
          <div className="font-headline text-lg font-bold text-primary-container">Ri7la</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-slate-400 transition-colors hover:text-primary-container"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-slate-400 transition-colors hover:text-primary-container"
            >
              Terms of Service
            </Link>
            <Link
              href="/help"
              className="text-xs text-slate-400 transition-colors hover:text-primary-container"
            >
              Help Center
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Ri7la Transport. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-4 bg-surface-container-low px-8 py-6 md:flex-row">
      <p className="text-xs text-on-surface-variant">
        © {new Date().getFullYear()} Ri7la. All rights reserved.
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        <Link
          href="/privacy"
          className="text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          Terms of Service
        </Link>
        <Link
          href="/help"
          className="text-xs text-on-surface-variant transition-colors hover:text-primary"
        >
          Contact Support
        </Link>
      </div>
    </footer>
  );
}
