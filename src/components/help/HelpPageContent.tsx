import { Link } from "@/i18n/navigation";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { getTranslations } from "next-intl/server";

export async function HelpPageContent() {
  const t = await getTranslations("help");
  const categories = [
    { icon: "calendar_month", title: t("catBookingTitle"), desc: t("catBookingDesc") },
    { icon: "credit_card", title: t("catPaymentsTitle"), desc: t("catPaymentsDesc") },
    { icon: "directions_car", title: t("catCarpoolTitle"), desc: t("catCarpoolDesc") },
    { icon: "directions_bus", title: t("catBusTitle"), desc: t("catBusDesc") },
    { icon: "refresh", title: t("catRefundsTitle"), desc: t("catRefundsDesc") },
    { icon: "person", title: t("catAccountTitle"), desc: t("catAccountDesc") },
  ] as const;

  const faqs = [
    { q: t("faq1Q"), a: t("faq1A") },
    { q: t("faq2Q"), a: t("faq2A") },
    { q: t("faq3Q"), a: t("faq3A") },
    { q: t("faq4Q"), a: t("faq4A") },
  ] as const;

  return (
    <main className="pt-20">
      <section className="relative overflow-hidden bg-primary-container py-24">
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-48 -top-48 h-96 w-96 rounded-full bg-tertiary-fixed blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-secondary-container blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-6 font-headline text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-on-primary-container opacity-90 md:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="group relative mx-auto max-w-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-6 flex items-center">
              <MaterialIcon
                name="search"
                className="!text-2xl text-outline transition-colors group-focus-within:text-primary"
              />
            </div>
            <label htmlFor="help-search" className="sr-only">
              {t("searchLabel")}
            </label>
            <input
              id="help-search"
              type="search"
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-2xl border-none bg-surface-container-lowest py-6 pl-16 pr-8 text-lg text-on-surface shadow-xl transition-all placeholder:text-outline-variant focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="group ambient-shadow cursor-pointer rounded-xl bg-surface-container-lowest p-8 transition-all duration-300 hover:bg-primary-container"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-white/20">
                <MaterialIcon
                  name={cat.icon}
                  className="!text-2xl text-primary transition-colors group-hover:text-white"
                />
              </div>
              <h3 className="mb-2 text-xl font-bold text-on-surface transition-colors group-hover:text-white">
                {cat.title}
              </h3>
              <p className="text-on-surface-variant transition-colors group-hover:text-on-primary-container">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-12 text-center font-headline text-3xl font-bold text-on-surface">
            {t("faqTitle")}
          </h2>
          <div className="space-y-4">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group ambient-shadow overflow-hidden rounded-xl bg-surface-container-lowest open:shadow-md"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-8 py-6 text-left transition-colors hover:bg-slate-50 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="text-lg font-semibold text-on-surface">{item.q}</span>
                  <MaterialIcon
                    name="expand_more"
                    className="!text-2xl text-outline transition-transform group-open:rotate-180 group-hover:text-primary"
                  />
                </summary>
                <p className="border-t border-outline-variant/20 px-8 pb-6 pt-4 text-sm leading-relaxed text-on-surface-variant">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-24">
        <div className="ambient-shadow relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary-container p-12 md:flex-row">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="mb-4 font-headline text-3xl font-bold text-white">
              {t("contactTitle")}
            </h2>
            <p className="max-w-lg text-lg text-on-primary-container opacity-90">
              {t("contactBody")}
            </p>
          </div>
          <div className="relative z-10">
            <Link
              href="/help#contact"
              className="inline-block rounded-full bg-tertiary px-10 py-4 text-lg font-bold text-white shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
            >
              {t("contactCta")}
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white opacity-5" />
        </div>
      </section>
    </main>
  );
}
