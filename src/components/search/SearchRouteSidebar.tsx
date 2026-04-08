import { MaterialIcon } from "@/components/ui/MaterialIcon";

const MAP_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD6HcnNePNLCwlg8aBUIz8ckKMJDikyh_hJnUGVF1WC-d4B1ZV9K3dwrimbqT_ePEbR_TX0l98W3ObPVqh4tnMsBTh6ULRDbavqh-bSbu4MT_xbmql_sXvYKMLs0zgH16TLRE2sQTCGjPhJ3f51iDgGJxE3N4GgFTEqC3skzH_8LIDpb8zpjK-iUEYc52dL1SZdsXtxp3eY03oUSsmJkKfIERkJheG0Enk5qrFzp-LJQ_O3yzT6OpPbIQIqHiakeIjJllCtZPCKRYrD";

type Props = {
  fromShort?: string;
  toShort?: string;
};

export function SearchRouteSidebar({ fromShort = "ALGER", toShort = "ORAN" }: Props) {
  return (
    <aside className="col-span-12 hidden space-y-6 lg:col-span-3 lg:block">
      <div className="overflow-hidden rounded-xl bg-surface-container-low shadow-sm">
        <div className="border-b border-outline-variant/15 bg-surface-container-lowest p-4">
          <h4 className="text-sm font-bold text-on-surface">Route Preview</h4>
          <p className="text-[10px] font-medium text-on-surface-variant">approx. 415 km via A1</p>
        </div>
        <div
          className="relative h-64 bg-surface-dim bg-cover bg-center"
          style={{ backgroundImage: `url('${MAP_BG}')` }}
        >
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute left-1/4 top-1/4">
            <div className="h-3 w-3 rounded-full border-2 border-white bg-primary shadow-lg" />
            <span className="absolute left-0 top-4 whitespace-nowrap rounded bg-white px-2 py-0.5 text-[8px] font-bold shadow">
              {fromShort}
            </span>
          </div>
          <div className="absolute bottom-1/3 right-1/4">
            <div className="h-3 w-3 rounded-full border-2 border-white bg-tertiary shadow-lg" />
            <span className="absolute left-0 top-4 whitespace-nowrap rounded bg-white px-2 py-0.5 text-[8px] font-bold shadow">
              {toShort}
            </span>
          </div>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <path
              d="M100,64 Q200,100 300,170"
              fill="none"
              stroke="#00535b"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          </svg>
        </div>
        <div className="space-y-3 bg-surface-container-lowest p-4">
          <div className="flex items-start gap-3">
            <MaterialIcon name="info" className="!text-sm text-primary mt-0.5" />
            <p className="text-[10px] leading-relaxed text-on-surface-variant">
              Travelers often report smooth traffic on the A1 highway between 9 AM and 2 PM.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-primary/10 bg-primary-container/10 p-6">
        <h5 className="mb-2 text-sm font-bold text-primary">Need a private ride?</h5>
        <p className="mb-4 text-xs text-on-surface-variant">
          You can request a dedicated vehicle for your group.
        </p>
        <button
          type="button"
          className="w-full rounded-lg bg-white py-2 text-[11px] font-extrabold text-primary shadow-sm transition-colors hover:bg-surface-container-low"
        >
          Check Private Options
        </button>
      </div>
    </aside>
  );
}
