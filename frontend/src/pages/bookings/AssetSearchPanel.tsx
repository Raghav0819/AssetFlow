import { useEffect, useState } from "react";
import type { Asset } from "../../types";
import { api } from "../../api/client";

interface AssetSearchPanelProps {
  selectedAsset: Asset | null;
  onSelectAsset: (asset: Asset | null) => void;
}

export default function AssetSearchPanel({ selectedAsset, onSelectAsset }: AssetSearchPanelProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const result = await api.getAssets({ is_bookable: true as any });
        const bookableAssets = result.items.filter(a => a.is_bookable);
        setAssets(bookableAssets);
        setFilteredAssets(bookableAssets);
      } catch (err) {
        console.error("Failed to load assets", err);
      }
    };
    loadAssets();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = assets.filter(
      a =>
        a.name.toLowerCase().includes(query) ||
        a.asset_tag.toLowerCase().includes(query) ||
        a.serial_number.toLowerCase().includes(query)
    );
    setFilteredAssets(filtered);
  }, [searchQuery, assets]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Find Bookable Asset</h2>
        <input
          type="text"
          placeholder="Search by name, tag, or serial number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">
              {searchQuery ? "No bookable assets match your search" : "No bookable assets available"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => onSelectAsset(asset)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedAsset?.id === asset.id
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{asset.name}</p>
                    <p className="text-xs text-slate-500">{asset.asset_tag}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    asset.status === "Available" 
                      ? "bg-green-100 text-green-700"
                      : asset.status === "Allocated"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {asset.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  <p>Location: {asset.location}</p>
                  <p>Condition: {asset.condition}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <button
            onClick={() => onSelectAsset(null)}
            className="w-full px-3 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}
    </div>
  );
}
