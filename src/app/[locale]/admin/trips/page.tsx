import { Suspense } from "react";

import { AdminTripsClient } from "@/components/admin/AdminTripsClient";

export default function AdminTripsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-on-surface-variant">Loading…</div>}>
      <AdminTripsClient />
    </Suspense>
  );
}

