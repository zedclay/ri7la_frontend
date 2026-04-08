import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

export default async function BusPreviewCheckoutPage() {
  const locale = await getLocale();
  redirect({ href: "/passenger/checkout/bk-rx-9283-lz/details", locale });
}
