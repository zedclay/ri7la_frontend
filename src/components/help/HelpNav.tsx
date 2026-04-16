import { Link } from "@/i18n/navigation";

const links = [
  { href: "/search", label: "Trips" },
  { href: "/search", label: "Routes" },
  { href: "/help#categories", label: "Passes" },
  { href: "/help", label: "Support", active: true },
];

export function HelpNav() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 font-headline shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary-container"
          >
            <img src="/saafir-icon.svg" alt="" className="h-8 w-8" />
            <img src="/saafir-wordmark.svg" alt="Saafir" className="h-6 w-auto" />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  item.active
                    ? "border-b-2 border-primary-container font-semibold text-primary-container transition-all duration-300"
                    : "text-slate-500 transition-all duration-300 hover:text-primary-container"
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="rounded-full px-6 py-2 font-semibold text-primary transition-all hover:bg-surface-container-low"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="ambient-shadow rounded-full bg-gradient-to-br from-primary to-primary-container px-6 py-2 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
