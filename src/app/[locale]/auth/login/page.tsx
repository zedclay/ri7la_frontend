import type { Metadata } from "next";
import { LoginView } from "@/components/auth/LoginView";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: `${t("loginTitle")} — Ri7la`,
    description: t("metaLoginDescription"),
  };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const showAuthError = params.error === "invalid";

  return <LoginView showAuthError={showAuthError} />;
}
