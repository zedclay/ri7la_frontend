import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PartnerCTA } from "@/components/home/PartnerCTA";
import { PopularRoutes } from "@/components/home/PopularRoutes";
import { SearchWidget } from "@/components/home/SearchWidget";
import { TravelModes } from "@/components/home/TravelModes";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ar" ? "ar_DZ" : "fr_DZ",
    },
  };
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 pt-24">
        <HomeHero />
        <SearchWidget />
        <TravelModes />
        <HowItWorks />
        <PopularRoutes />
        <PartnerCTA />
        <HomeFAQ />
      </main>
      <PublicFooter />
    </div>
  );
}
