import { Link } from "@/i18n/navigation";

const links = [
  { href: "/search", label: "Find a Ride" },
  { href: "/driver/trips/new", label: "Offer a Trip" },
  { href: "/help", label: "Help" },
];

export function CarpoolTripNav() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 shadow-[0_12px_32px_-4px_rgba(0,83,91,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary-container"
        >
          <img src="/saafir-icon.svg" alt="" className="h-8 w-8" />
          <img src="/saafir-wordmark.svg" alt="Saafir" className="h-6 w-auto" />
        </Link>
        <nav className="hidden items-center gap-8 font-headline font-semibold tracking-tight md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-slate-600 transition-colors hover:text-primary-container"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-full px-5 py-2 font-semibold text-slate-600 transition-all hover:bg-slate-50"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="scale-95 rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-2 font-semibold text-white transition-transform active:opacity-80"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
