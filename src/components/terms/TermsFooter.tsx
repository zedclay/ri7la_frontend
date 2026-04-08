import { Link } from "@/i18n/navigation";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms", current: true },
  { href: "/sitemap", label: "Sitemap" },
  { href: "/help", label: "Contact" },
  { href: "/careers", label: "Careers" },
  { href: "/press", label: "Press" },
];

export function TermsFooter() {
  return (
    <footer className="mt-20 w-full border-t border-slate-200 bg-surface-container-low font-body">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 py-12 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="font-headline text-lg font-bold text-primary-container">
            Ri7la
          </span>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Ri7la Technologies. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                l.current
                  ? "text-xs font-medium text-primary-container underline decoration-primary-container underline-offset-4"
                  : "text-xs text-slate-500 transition-colors hover:text-slate-800"
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
