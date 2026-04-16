import type { Metadata } from "next";
import { HelpPageContent } from "@/components/help/HelpPageContent";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "help" });
  return {
    title: `${t("metaTitle")} — Saafir`,
    description: t("metaDescription"),
  };
}

export default function HelpPage() {
  return <HelpPageContent />;
}
