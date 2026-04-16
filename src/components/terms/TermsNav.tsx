import { Link } from "@/i18n/navigation";

const links = [
  { href: "/search", label: "Trips" },
  { href: "/search", label: "Bookings" },
  { href: "/help", label: "Support" },
  { href: "/about", label: "About" },
];

export function TermsNav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 font-headline shadow-sm backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary-container"
        >
          <img src="/saafir-icon.svg" alt="" className="h-8 w-8" />
          <img src="/saafir-wordmark.svg" alt="Saafir" className="h-6 w-auto" />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary-container"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/signup"
            className="submerged-gradient rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-transform active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
