import { useState, useEffect } from "react";
import type { Asset, Employee, TransferRequest, Allocation } from "../../types";
import { api } from "../../api/client";

import AssetSearchPanel from "./AssetSearchPanel";
import ConflictAlertPanel from "./ConflictAlertPanel";
import TransferRequestPanel from "./TransferRequestPanel";
import ActiveRequestWorkflow from "./ActiveRequestWorkflow";
import AllocationHistory from "./AllocationHistory";

export default function AllocationPage() {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [history, setHistory] = useState<Allocation[]>([]);
  const [activeRequest, setActiveRequest] = useState<TransferRequest | null>(null);

  useEffect(() => {
    // Load initial data for the page
    const loadData = async () => {
      try {
        const [empData, allocData, transferData] = await Promise.all([
          api.getEmployees(),
          api.getAllocations(),
          api.getTransfers(),
        ]);
        setEmployees(empData);
        setHistory(allocData);
        
        // Find an active request if any exists (for demo purposes just pick the first Requested)
        const active = transferData.find(t => t.status === "Requested");
        if (active) {
          setActiveRequest(active);
          
          // Optionally auto-select the asset for that request to populate the screen
          try {
            const asset = await api.getAssetById(active.asset_id);
            setSelectedAsset(asset);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error("Failed to load allocation page data", err);
      }
    };
    loadData();
  }, []);

  const handleTransferSuccess = async () => {
    // Refresh history and active requests, and re-fetch selected asset to get updated status
    if (selectedAsset) {
      const asset = await api.getAssetById(selectedAsset.id);
      setSelectedAsset(asset);
    }
    const [allocData, transferData] = await Promise.all([
      api.getAllocations(),
      api.getTransfers(),
    ]);
    setHistory(allocData);
    const active = transferData.find(t => t.status === "Requested");
    setActiveRequest(active || null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 relative animate-scale-in">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[500px] bg-gradient-to-br from-brand-50/50 via-white to-transparent blur-3xl -z-10 rounded-bl-[100px] pointer-events-none" />

      {/* Header */}
      <div className="px-10 pt-8 pb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Allocation & Transfer</h1>
          <p className="text-sm text-slate-500 mt-1">Manage lifecycle movement for organizational assets.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer">
            Bulk Import
          </button>
          <button className="px-5 py-2.5 bg-brand-600 border border-transparent rounded-xl text-sm font-semibold text-white shadow-md shadow-brand-600/15 hover:bg-brand-700 transition-colors cursor-pointer">
            New Allocation
          </button>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
          
          {/* Top Row: Search, Alert, Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[340px]">
            <AssetSearchPanel 
              selectedAsset={selectedAsset} 
              onSelectAsset={setSelectedAsset} 
            />
            <ConflictAlertPanel 
              selectedAsset={selectedAsset} 
            />
            <TransferRequestPanel 
              selectedAsset={selectedAsset} 
              employees={employees} 
              onSuccess={handleTransferSuccess} 
            />
          </div>

          {/* Middle Row: Workflow Tracker */}
          <ActiveRequestWorkflow activeRequest={activeRequest} />

          {/* Bottom Row: History Table */}
          <AllocationHistory history={history} />
          
        </div>
      </div>
    </div>
  );
}
