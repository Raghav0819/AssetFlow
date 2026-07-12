import { useState, useEffect, useCallback } from "react";
import type { Asset, Category } from "../../types";
import { api } from "../../api/client";
import AssetList from "./AssetList";
import AssetDetailPanel from "./AssetDetailPanel";
import RegisterAssetModal from "./RegisterAssetModal";

type QuickFilter = "all" | "it-hardware" | "mobile" | "active" | "maintenance";

export default function AssetDirectory() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      // Build filter params based on quick filter
      const filters: { status?: string; category_id?: string; q?: string } = {};
      if (searchQuery) filters.q = searchQuery;

      switch (quickFilter) {
        case "it-hardware":
          filters.category_id = "cat-1";
          break;
        case "mobile":
          filters.category_id = "cat-4";
          break;
        case "active":
          filters.status = "Allocated";
          break;
        case "maintenance":
          filters.status = "UnderMaintenance";
          break;
      }

      const [assetResult, catResult] = await Promise.all([
        api.getAssets(filters),
        api.getCategories(),
      ]);
      setAssets(assetResult.items);
      setCategories(catResult);
    } catch (err) {
      console.error("Failed to fetch assets", err);
    } finally {
      setLoading(false);
    }
  }, [quickFilter, searchQuery]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleAssetCreated = () => {
    fetchAssets();
    setShowRegisterModal(false);
  };

  const quickFilters: { key: QuickFilter; label: string }[] = [
    { key: "all", label: "All Assets" },
    { key: "it-hardware", label: "IT Hardware" },
    { key: "mobile", label: "Mobile Devices" },
    { key: "active", label: "Active Only" },
    { key: "maintenance", label: "Maintenance Due" },
  ];

  const totalAssets = assets.length;

  return (
    <div className="flex flex-col h-full -m-8">
      {/* Page Header */}
      <div className="px-8 pt-7 pb-4 bg-white border-b border-slate-100">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Asset Directory
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage and track {totalAssets.toLocaleString()} enterprise resources
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filters button */}
            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            {/* Register Asset button */}
            <button
              onClick={() => setShowRegisterModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-600/15 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Register Asset
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Quick Filters:</span>
          {quickFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setQuickFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                quickFilter === f.key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Asset Table */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${selectedAsset ? "" : ""}`}>
          <AssetList
            assets={assets}
            categories={categories}
            loading={loading}
            selectedAssetId={selectedAsset?.id ?? null}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalCount={totalAssets}
          />
        </div>

        {/* Detail Panel */}
        {selectedAsset && (
          <AssetDetailPanel
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        )}
      </div>

      {/* Register Asset Modal */}
      {showRegisterModal && (
        <RegisterAssetModal
          categories={categories}
          onClose={() => setShowRegisterModal(false)}
          onCreated={handleAssetCreated}
        />
      )}
    </div>
  );
}
