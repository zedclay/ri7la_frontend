import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { mockReviews } from "@/lib/mockData";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export const metadata: Metadata = {
  title: "Avis — Saafir",
  description: "Avis et retours des voyageurs Saafir (MVP).",
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-tertiary">
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialIcon key={i} name="star" filled={i <= rating} className="!text-sm" />
      ))}
    </div>
  );
}

export default async function ReviewsPage() {
  const t = await getTranslations("reviews");

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PublicHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-20 pt-28 md:px-8 md:pt-32">
        <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Avis voyageurs
        </h1>
        <p
          role="status"
          className="mb-6 rounded-xl border border-amber-700/25 bg-amber-500/15 px-4 py-3 text-sm font-semibold text-amber-950 dark:text-amber-100"
        >
          {t("demoBanner")}
        </p>
        <p className="mb-10 max-w-2xl text-on-surface-variant">
          Les retours des passagers et conducteurs renforcent la confiance et améliorent la qualité du service.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mockReviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-fixed-variant">
                  {r.authorName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-on-surface">{r.authorName}</div>
                  <div className="text-[10px] font-medium text-on-surface-variant">{r.createdAtLabel}</div>
                </div>
                <div className="ml-auto">
                  <Stars rating={r.rating} />
                </div>
              </div>
              <p className="text-sm italic text-on-surface-variant">{r.comment}</p>
            </div>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
