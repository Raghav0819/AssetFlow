import { useState, useRef, useEffect } from "react";
import type { Asset } from "../../types";
import { api } from "../../api/client";

interface AssetSearchPanelProps {
  onSelectAsset: (asset: Asset | null) => void;
  selectedAsset: Asset | null;
}

export default function AssetSearchPanel({ onSelectAsset, selectedAsset }: AssetSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Asset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 1) {
      try {
        const { items } = await api.getAssets({ q: val });
        setResults(items);
        setIsOpen(true);
      } catch (err) {
        console.error("Failed to search assets", err);
      }
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (asset: Asset) => {
    onSelectAsset(asset);
    setQuery("");
    setIsOpen(false);
  };

  const statusColors: Record<string, string> = {
    Allocated: "text-amber-500 bg-amber-500",
    Available: "text-emerald-500 bg-emerald-500",
    Reserved: "text-violet-500 bg-violet-500",
    Lost: "text-red-500 bg-red-500",
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 className="text-base font-bold text-gray-900">Asset Search</h2>
      </div>

      <div className="relative mb-6" ref={containerRef}>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Asset Identifier / Serial</label>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by tag, name..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 bg-slate-50 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100/50 transition-all"
        />
        {isOpen && results.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {results.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleSelect(asset)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors flex flex-col"
              >
                <span className="text-sm font-bold text-gray-900">{asset.asset_tag} - {asset.name}</span>
                <span className="text-xs text-slate-500 mt-0.5">S/N: {asset.serial_number}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedAsset ? (
        <div className="p-4 bg-brand-50/50 rounded-xl border border-brand-100 flex gap-4 mt-auto">
          <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
             <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{selectedAsset.name}</h3>
            <p className="text-xs text-slate-500 mb-2">S/N: {selectedAsset.serial_number}</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${statusColors[selectedAsset.status] || "bg-slate-500"}`} />
              <span className={`text-xs font-bold ${statusColors[selectedAsset.status] ? statusColors[selectedAsset.status].split(" ")[0] : "text-slate-500"}`}>
                {selectedAsset.status}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-auto flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
           <p className="text-xs font-semibold text-slate-400">No asset selected</p>
        </div>
      )}
    </div>
  );
}
