import { DriverOnboardingForm } from "@/components/driver/DriverOnboardingForm";
import { Suspense } from "react";

export default function DriverOnboardingPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-on-surface-variant">Loading…</div>}>
      <DriverOnboardingForm />
    </Suspense>
  );
}
