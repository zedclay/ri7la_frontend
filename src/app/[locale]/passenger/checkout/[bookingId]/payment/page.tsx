import { notFound } from "next/navigation";
import { RequireDemoRole } from "@/components/auth/RequireDemoRole";
import { CheckoutPaymentClient } from "@/components/checkout/CheckoutPaymentClient";
import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { loadCheckoutBooking } from "@/lib/loadCheckoutBooking";

export default async function CheckoutPaymentPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await loadCheckoutBooking(bookingId);
  if (!booking) return notFound();

  return (
    <>
      <RequireDemoRole role="passenger" requireProfileComplete />
      <CheckoutShell current="payment" bookingId={bookingId}>
        <CheckoutPaymentClient bookingId={bookingId} booking={booking} />
      </CheckoutShell>
    </>
  );
}
