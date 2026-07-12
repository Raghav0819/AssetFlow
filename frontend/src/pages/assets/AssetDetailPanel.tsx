import type { Asset, AssetStatus, HistoryEvent } from "../../types";

interface AssetDetailPanelProps {
  asset: Asset;
  onClose: () => void;
}

const STATUS_CONFIG: Record<AssetStatus, { label: string; bg: string; text: string }> = {
  Available: { label: "Available", bg: "bg-emerald-50", text: "text-emerald-700" },
  Allocated: { label: "Deployed", bg: "bg-blue-50", text: "text-blue-700" },
  Reserved: { label: "In Storage", bg: "bg-violet-50", text: "text-violet-700" },
  UnderMaintenance: { label: "Maintenance", bg: "bg-amber-50", text: "text-amber-700" },
  Lost: { label: "Lost/Missing", bg: "bg-red-50", text: "text-red-700" },
  Retired: { label: "Retired", bg: "bg-slate-100", text: "text-slate-600" },
  Disposed: { label: "Disposed", bg: "bg-slate-100", text: "text-slate-500" },
};

// Mock history events matching the screenshot
const MOCK_HISTORY: HistoryEvent[] = [
  {
    id: "h1",
    icon: "deploy",
    title: "Asset Deployed",
    description: "Assigned to Sarah Miller (Product Design) at San Francisco HQ",
    date: "Oct 12, 2025",
  },
  {
    id: "h2",
    icon: "maintenance",
    title: "Scheduled Maintenance",
    description: "Routine hardware diagnostic and software update completed.",
    date: "Sep 05, 2025",
  },
  {
    id: "h3",
    icon: "inventory",
    title: "Added to Inventory",
    description: "Procured via IT Portal. Serial: G329XY12LMR2.",
    date: "Aug 28, 2025",
  },
];

const HISTORY_ICON_CONFIG: Record<string, { bg: string; color: string }> = {
  deploy: { bg: "bg-blue-100", color: "text-blue-600" },
  maintenance: { bg: "bg-amber-100", color: "text-amber-600" },
  inventory: { bg: "bg-slate-100", color: "text-slate-600" },
  transfer: { bg: "bg-violet-100", color: "text-violet-600" },
  audit: { bg: "bg-emerald-100", color: "text-emerald-600" },
};

function HistoryIcon({ type }: { type: string }) {
  const cfg = HISTORY_ICON_CONFIG[type] || HISTORY_ICON_CONFIG.inventory;
  return (
    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
      {type === "deploy" && (
        <svg className={`w-4 h-4 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      {type === "maintenance" && (
        <svg className={`w-4 h-4 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
      {type === "inventory" && (
        <svg className={`w-4 h-4 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )}
      {type === "transfer" && (
        <svg className={`w-4 h-4 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )}
      {type === "audit" && (
        <svg className={`w-4 h-4 ${cfg.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )}
    </div>
  );
}

export default function AssetDetailPanel({ asset, onClose }: AssetDetailPanelProps) {
  const statusCfg = STATUS_CONFIG[asset.status] || STATUS_CONFIG.Available;

  return (
    <div className="w-[380px] bg-white border-l border-slate-100 flex flex-col h-full overflow-y-auto shrink-0 animate-slide-in-right">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1">Asset Details</p>
            <h2 className="text-lg font-bold text-gray-900">{asset.asset_tag}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Asset Photo */}
      <div className="px-6 pt-4 pb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Asset Photo</p>
        <div className="w-full h-40 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs text-slate-400">No photo uploaded</p>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
            <p className="text-sm font-semibold text-gray-900">{asset.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
            <p className="text-sm text-slate-700">{asset.category_name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned To</p>
            <div className="flex items-center gap-2">
              {asset.assigned_to ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600 shrink-0">
                    {asset.assigned_to.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <p className="text-sm text-slate-700">{asset.assigned_to}</p>
                </>
              ) : (
                <p className="text-sm text-slate-400 italic">Unassigned</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="px-6 py-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">History Timeline</p>
          <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-4">
          {MOCK_HISTORY.map((event, index) => (
            <div key={event.id} className="flex gap-3 relative">
              {/* Timeline connector */}
              {index < MOCK_HISTORY.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-px bg-slate-100 -translate-x-1/2" />
              )}
              <HistoryIcon type={event.icon} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{event.title}</p>
                  <p className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">{event.date}</p>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-slate-100 bg-white">
        <div className="flex gap-3 mb-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Transfer
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Maintain
          </button>
        </div>
        <button className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-600/15 transition-all cursor-pointer flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Asset Details
        </button>
      </div>
    </div>
  );
}
