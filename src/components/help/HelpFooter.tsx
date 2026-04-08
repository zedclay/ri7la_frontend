import { Link } from "@/i18n/navigation";

const links = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/help", label: "Contact Us" },
  { href: "/careers", label: "Careers" },
];

export function HelpFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 font-body text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between space-y-4 px-8 py-12 md:flex-row md:space-y-0">
        <div className="flex flex-col items-center space-y-2 md:items-start">
          <span className="font-headline text-lg font-bold text-primary-container">Ri7la</span>
          <p>© {new Date().getFullYear()} Ri7la. Your Premium Digital Concierge.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-primary-container"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
