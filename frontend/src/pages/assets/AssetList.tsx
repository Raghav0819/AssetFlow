import type { Asset, AssetStatus, Category } from "../../types";

interface AssetListProps {
  assets: Asset[];
  categories: Category[];
  loading: boolean;
  selectedAssetId: string | null;
  onSelectAsset: (asset: Asset) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
}

const STATUS_CONFIG: Record<AssetStatus, { label: string; bg: string; text: string; dot: string }> = {
  Available: { label: "Available", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Allocated: { label: "Deployed", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Reserved: { label: "In Storage", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  UnderMaintenance: { label: "Maintenance", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  Lost: { label: "Lost/Missing", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  Retired: { label: "Retired", bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  Disposed: { label: "Disposed", bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
};

export default function AssetList({
  assets,
  loading,
  selectedAssetId,
  onSelectAsset,
  searchQuery,
  onSearchChange,
  totalCount,
}: AssetListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search bar inside list area */}
      <div className="px-6 pt-4 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search assets, serial numbers, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 px-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24">Asset Tag</th>
              <th className="py-3 px-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="py-3 px-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">Category</th>
              <th className="py-3 px-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">Status</th>
              <th className="py-3 px-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-40">Location</th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    No assets found
                  </div>
                </td>
              </tr>
            ) : (
              assets.map((asset) => {
                const statusCfg = STATUS_CONFIG[asset.status] || STATUS_CONFIG.Available;
                const isSelected = selectedAssetId === asset.id;
                return (
                  <tr
                    key={asset.id}
                    onClick={() => onSelectAsset(asset)}
                    className={`border-b border-slate-50 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-brand-50/60"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <span className="text-sm font-semibold text-brand-600">{asset.asset_tag}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {/* Tiny thumbnail placeholder */}
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{asset.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-sm text-slate-600">
                      {asset.category_name || "—"}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-sm text-slate-600">
                      {asset.location}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
        <p className="text-xs text-slate-400">
          Showing 1 to {assets.length} of {totalCount.toLocaleString()} assets
        </p>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
