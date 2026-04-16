import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AuthTransactionFooter } from "./AuthTransactionFooter";
import { LoginForm } from "./LoginForm";
import { useTranslations } from "next-intl";

const BUS_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC91OoK2KWmtL6vymbTKHK4HSEcoXGVRUYs2SHNLE2Ss4dBlfNs-jyoWAB8rTdS4OTnutswIZvX0YzgMrggcAfqtTe7X4ranbT-wtZpydB5qWY_aw8NPyEoQYcysr-EI_rZAryZrys8CJ0r3li5E5WI700KGS2vYmAZu-e7bjQ9sTF6wfXRBp9IOw3ied_FZn1PmEBag3aV8PZMAeqkQf3_ImINUtnvs2fTGiM6iAroQkFDmwWVF_1sOpC34bsE6nk1k-qbLHRzhjdd";

type Props = {
  showAuthError?: boolean;
};

export function LoginView({ showAuthError = false }: Props) {
  const t = useTranslations("common");
  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <section className="relative hidden min-h-[min(100vh,900px)] w-full md:flex md:w-1/2 lg:w-3/5">
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                "linear-gradient(rgba(0, 83, 91, 0.4), rgba(0, 31, 35, 0.8))",
            }}
          />
          <Image
            src={BUS_HERO_IMAGE}
            alt=""
            fill
            className="object-cover"
            sizes="60vw"
            priority
          />
          <div className="relative z-20 flex h-full w-full flex-col justify-between p-12 lg:p-20">
            <Link href="/" className="flex w-fit items-center gap-2 text-white">
              <img src="/saafir-icon.svg" alt="" className="h-10 w-10" />
              <img src="/saafir-wordmark.svg" alt="Saafir" className="h-8 w-auto" />
            </Link>
            <div className="max-w-xl">
              <h2 className="mb-6 font-headline text-5xl font-bold leading-tight text-white lg:text-6xl">
                {t("loginHeroTitle")}
              </h2>
              <p className="max-w-md font-body text-xl leading-relaxed text-white/90">
                {t("loginHeroSubtitle")}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="h-1 w-12 rounded-full bg-white" />
              <div className="h-1 w-4 rounded-full bg-white/30" />
              <div className="h-1 w-4 rounded-full bg-white/30" />
            </div>
          </div>
        </section>

        <section className="flex w-full flex-1 items-center justify-center bg-surface p-6 sm:p-12 lg:w-2/5 lg:p-24">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center md:hidden">
              <Link href="/" className="flex items-center gap-2">
                <img src="/saafir-icon.svg" alt="" className="h-9 w-9" />
                <img src="/saafir-wordmark.svg" alt="Saafir" className="h-7 w-auto" />
              </Link>
            </div>
            <Suspense>
              <LoginForm showError={showAuthError} />
            </Suspense>
          </div>
        </section>
      </main>
      <AuthTransactionFooter variant="login" />
    </>
  );
}
