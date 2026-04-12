import { Suspense } from "react";

import { AdminBookingsClient } from "@/components/admin/AdminBookingsClient";

export default function AdminBookingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-on-surface-variant">Loading…</div>}>
      <AdminBookingsClient />
    </Suspense>
  );
}

