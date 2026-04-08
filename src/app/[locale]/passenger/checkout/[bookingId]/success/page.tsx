import { notFound } from "next/navigation";
import { RequireDemoRole } from "@/components/auth/RequireDemoRole";
import { CheckoutSuccessClient } from "@/components/checkout/CheckoutSuccessClient";
import { loadCheckoutBooking } from "@/lib/loadCheckoutBooking";

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const booking = await loadCheckoutBooking(bookingId);
  if (!booking) return notFound();

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface-variant">
      <RequireDemoRole role="passenger" requireProfileComplete />
      <CheckoutSuccessClient bookingId={bookingId} booking={booking} />
    </div>
  );
}
