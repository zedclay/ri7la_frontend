import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const tErr = await getTranslations("errors");
  const t = await getTranslations("common");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-headline text-2xl font-bold text-on-surface">404</h1>
      <p className="max-w-md text-on-surface-variant">{tErr("generic")}</p>
      <Link href="/" className="font-bold text-primary">
        {t("goHome")}
      </Link>
    </div>
  );
}
