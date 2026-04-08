import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export async function PartnerCTA() {
  const t = await getTranslations("common");

  return (
    <section className="bg-surface-container-low px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-primary p-10 text-on-primary">
          <div className="absolute -bottom-10 -end-10 h-48 w-48 rounded-full bg-primary-container/30" />
          <div className="relative z-10">
            <MaterialIcon
              name="directions_car"
              filled
              className="mb-6 !text-5xl text-on-primary opacity-80"
            />
            <h3 className="mb-4 font-headline text-3xl font-bold">{t("partnerDriverTitle")}</h3>
            <p className="mb-10 max-w-sm leading-relaxed text-on-primary/80">{t("partnerDriverBody")}</p>
            <Link
              href="/driver/trips/new"
              className="inline-block rounded-full bg-white px-8 py-3 font-bold text-primary transition-colors hover:bg-surface-container-lowest active:scale-95"
            >
              {t("partnerDriverCta")}
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-surface-container-highest p-10 text-on-surface">
          <div className="absolute -bottom-10 -end-10 h-48 w-48 rounded-full bg-outline-variant/30" />
          <div className="relative z-10">
            <MaterialIcon
              name="train"
              filled
              className="mb-6 !text-5xl text-primary-container"
            />
            <h3 className="mb-4 font-headline text-3xl font-bold">{t("partnerModesTitle")}</h3>
            <p className="mb-10 max-w-sm leading-relaxed text-on-surface-variant">{t("partnerModesBody")}</p>
            <Link
              href="/search"
              className="gradient-primary inline-block rounded-full px-8 py-3 font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
            >
              {t("explore")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
