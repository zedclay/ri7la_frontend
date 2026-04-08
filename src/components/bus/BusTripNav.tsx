import { Link } from "@/i18n/navigation";

const nav = [
  { href: "/search", label: "Trips", active: true },
  { href: "/search", label: "Destinations" },
  { href: "/help", label: "Offers" },
  { href: "/passenger/bookings", label: "My Bookings" },
];

export function BusTripNav() {
  return (
    <header className="fixed top-0 z-50 flex h-20 w-full max-w-full items-center justify-between border-b border-slate-100/50 bg-white/80 px-6 shadow-sm backdrop-blur-xl md:px-8">
      <div className="flex items-center gap-8 md:gap-12">
        <Link
          href="/"
          className="font-headline text-2xl font-bold tracking-tight text-primary"
        >
          Ri7la
        </Link>
        <nav className="hidden gap-8 font-headline text-sm font-semibold md:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                item.active
                  ? "border-b-2 border-primary-container pb-1 text-primary-container"
                  : "text-slate-600 transition-colors duration-300 hover:text-primary-container"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/help"
          className="rounded-lg px-4 py-2 font-headline text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Support
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full bg-primary px-6 py-2.5 font-headline text-sm font-semibold text-on-primary transition-transform active:scale-95"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}
