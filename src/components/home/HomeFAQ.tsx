import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function HomeFAQ() {
  const t = await getTranslations("common");

  const faqs = [
    { q: t("faq1q"), a: t("faq1a") },
    { q: t("faq2q"), a: t("faq2a") },
    { q: t("faq3q"), a: t("faq3a") },
  ];

  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center font-headline text-3xl font-bold text-on-surface">
          {t("faqTitle")}
        </h2>
        <div className="space-y-4">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group subtle-shadow cursor-pointer rounded-lg bg-surface-container-lowest p-6 open:cursor-default"
            >
              <summary className="list-none marker:content-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-on-surface">{item.q}</span>
                  <MaterialIcon
                    name="expand_more"
                    className="!text-2xl text-outline transition-colors group-open:rotate-180 group-hover:text-primary"
                  />
                </div>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/help"
            className="font-bold text-primary underline decoration-primary/30 underline-offset-2 transition-all hover:decoration-primary"
          >
            {t("faqHelpLink")}
          </Link>
        </div>
      </div>
    </section>
  );
}
