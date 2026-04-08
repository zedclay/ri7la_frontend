import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const HERO_IMG =
  "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1600&q=80";

export async function HomeHero() {
  const t = await getTranslations("common");

  return (
    <section className="relative overflow-hidden px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="z-10 text-start">
          <h1 className="mb-6 font-headline text-5xl font-bold leading-tight tracking-tight text-on-surface md:text-6xl lg:text-7xl">
            {t("heroTitleBefore")}{" "}
            <span className="text-primary-container">{t("heroTitleHighlight")}</span>{" "}
            {t("heroTitleAfter")}
          </h1>
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-on-surface-variant md:text-xl">
            {t("heroSubtitle")}
          </p>
          <div className="mb-12 flex flex-wrap gap-4">
            <Link
              href="/search"
              className="gradient-primary subtle-shadow group flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-on-primary transition-transform active:scale-95"
            >
              {t("heroCtaPrimary")}
              <MaterialIcon
                name="arrow_forward"
                className="!text-xl transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              />
            </Link>
            <Link
              href="/help"
              className="rounded-full bg-surface-container-highest px-8 py-4 text-lg font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              {t("heroCtaSecondary")}
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 border-t border-outline-variant/20 pt-8">
            <div className="flex items-center gap-2">
              <MaterialIcon name="verified_user" className="!text-2xl text-primary-container" />
              <span className="text-sm font-medium text-on-surface">{t("verifiedProfiles")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MaterialIcon name="lock" className="!text-2xl text-primary-container" />
              <span className="text-sm font-medium text-on-surface">{t("securePayment")}</span>
            </div>
            <div className="flex items-center gap-2">
              <MaterialIcon
                name="confirmation_number"
                className="!text-2xl text-primary-container"
              />
              <span className="text-sm font-medium text-on-surface">{t("digitalTicket")}</span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center lg:h-[600px]">
          <div className="absolute -end-20 -top-20 h-96 w-96 rounded-full bg-primary-fixed/30 blur-3xl" />
          <div className="absolute -bottom-10 -start-10 h-64 w-64 rounded-full bg-tertiary-fixed/20 blur-3xl" />
          <div className="relative z-10 h-[400px] w-full overflow-hidden rounded-xl subtle-shadow">
            <Image
              src={HERO_IMG}
              alt={t("heroImageAlt")}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
