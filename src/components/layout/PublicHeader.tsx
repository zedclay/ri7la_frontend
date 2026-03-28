import Link from "next/link";

const nav = [
  { href: "/", label: "Accueil" },
  { href: "/parcs-bornes", label: "Parcs & Bornes" },
  { href: "/suivi", label: "Suivi" },
  { href: "/help", label: "Aide" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-2xl font-semibold tracking-tight text-foreground"
        >
          Ri7la
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/search"
            className="hidden rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-foreground sm:inline-flex"
            aria-label="Rechercher"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Connexion
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            Inscription
          </Link>
        </div>
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
