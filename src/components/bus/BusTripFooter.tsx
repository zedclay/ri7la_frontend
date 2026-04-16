import { Link } from "@/i18n/navigation";

const links = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/help", label: "Help Center" },
  { href: "/help", label: "Contact Us" },
  { href: "/careers", label: "Careers" },
];

export function BusTripFooter() {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-6 border-t border-slate-200 bg-slate-50 px-8 py-10 md:flex-row md:px-12">
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-2">
          <img src="/saafir-icon.svg" alt="" className="h-8 w-8" />
          <img src="/saafir-wordmark.svg" alt="Saafir" className="h-6 w-auto" />
        </span>
        <p className="max-w-xs font-body text-sm text-slate-500">
          © {new Date().getFullYear()} Saafir. All rights reserved. The Digital Concierge for modern
          travelers.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="text-sm text-slate-400 underline underline-offset-4 transition-opacity hover:text-slate-600"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
