"use client";

import { apiGetJsonData } from "@/lib/api";
import { formatAuditAction } from "@/lib/auditActionLabels";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string | null } | null;
};

type ListResponse = { items: Row[]; total: number };

export function AdminAuditClient() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiGetJsonData<ListResponse>("/api/admin/audit-logs?limit=100");
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="rounded-2xl border border-error-container bg-error-container/20 px-4 py-3 text-sm text-on-error-container">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Audit log</h1>
        <p className="mt-1 text-on-surface-variant">Immutable record of sensitive admin actions.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-lowest">
        <div className="grid grid-cols-12 bg-surface-container-low px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          <div className="col-span-3">When</div>
          <div className="col-span-2">Actor</div>
          <div className="col-span-3">Action</div>
          <div className="col-span-2">Entity</div>
          <div className="col-span-2">IP</div>
        </div>
        {!data ? (
          <div className="px-4 py-8 text-center text-sm text-on-surface-variant">Loading…</div>
        ) : (
          data.items.map((a) => (
            <div key={a.id} className="grid grid-cols-12 border-t border-outline-variant/10 px-4 py-3 text-xs">
              <div className="col-span-3 text-on-surface-variant">{new Date(a.createdAt).toLocaleString()}</div>
              <div className="col-span-2 font-extrabold text-on-surface">{a.actor?.fullName ?? "—"}</div>
              <div className="col-span-3 text-on-surface" title={a.action}>
                <span className="font-extrabold">{formatAuditAction(a.action)}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-on-surface-variant/80">{a.action}</span>
              </div>
              <div className="col-span-2 text-on-surface-variant">
                {a.entityType}
                {a.entityId ? ` ${a.entityId.slice(0, 8)}…` : ""}
              </div>
              <div className="col-span-2 truncate text-on-surface-variant">{a.ip ?? "—"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
