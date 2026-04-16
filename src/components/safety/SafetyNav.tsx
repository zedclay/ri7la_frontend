import { Link } from "@/i18n/navigation";

const links = [
  { href: "/search", label: "Trips" },
  { href: "/safety", label: "Safety", active: true },
  { href: "/help", label: "Support" },
  { href: "/about", label: "About" },
];

export function SafetyNav() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2 text-primary-container">
          <img src="/saafir-icon.svg" alt="" className="h-8 w-8" />
          <img src="/saafir-wordmark.svg" alt="Saafir" className="h-6 w-auto" />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                item.active
                  ? "border-b-2 border-primary-container pb-1 font-headline text-sm font-semibold text-primary-container"
                  : "font-headline text-sm font-semibold text-slate-600 transition-colors hover:text-primary-container"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="hidden rounded-full px-4 py-2 font-headline text-sm font-semibold text-primary-container transition-all hover:bg-slate-50 md:block"
          >
            Sign In
          </Link>
          <Link
            href="/#app-download"
            className="submerged-gradient rounded-full px-6 py-2.5 font-headline text-sm font-semibold text-white shadow-md transition-transform active:scale-95"
          >
            Download App
          </Link>
        </div>
      </div>
    </nav>
  );
}
