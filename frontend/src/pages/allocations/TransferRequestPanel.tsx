import { useState, type FormEvent } from "react";
import type { Asset, Employee } from "../../types";
import { api } from "../../api/client";

interface TransferRequestPanelProps {
  selectedAsset: Asset | null;
  employees: Employee[];
  onSuccess: () => void;
}

export default function TransferRequestPanel({ selectedAsset, employees, onSuccess }: TransferRequestPanelProps) {
  const [toEmployeeId, setToEmployeeId] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<"Standard" | "Urgent">("Standard");
  const [loading, setLoading] = useState(false);

  const isAllocated = selectedAsset?.status === "Allocated" || selectedAsset?.status === "Reserved";
  const fromEmployeeName = selectedAsset?.assigned_to || "Inventory (Available)";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !toEmployeeId) return;
    
    setLoading(true);
    try {
      if (isAllocated) {
        // Create transfer request
        await api.createTransferRequest({
          asset_id: selectedAsset.id,
          requested_to: toEmployeeId,
          reason,
          priority,
        });
      } else {
        // Create direct allocation
        await api.createAllocation({
          asset_id: selectedAsset.id,
          held_by_user_id: toEmployeeId,
          held_by_department_id: null,
          expected_return_date: null,
        });
      }
      // Reset form
      setToEmployeeId("");
      setReason("");
      setPriority("Standard");
      onSuccess();
    } catch (err) {
      console.error("Failed to submit request", err);
      alert("Failed to submit request. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-brand-500/20 rounded-2xl shadow-sm p-6 flex flex-col h-full relative overflow-hidden">
      {/* Decorative background flair */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between mb-5 z-10">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <h2 className="text-base font-bold text-gray-900">
            {isAllocated ? "Transfer Request" : "New Allocation"}
          </h2>
        </div>
        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded uppercase tracking-wider">
          New Entry
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 z-10">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">From Employee</label>
            <div className="w-full px-4 py-2.5 bg-slate-100 border border-transparent rounded-xl flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center shrink-0" />
              <span className="text-sm font-semibold text-slate-500 truncate">{fromEmployeeName}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">To Employee</label>
            <div className="relative">
               <select
                 value={toEmployeeId}
                 onChange={(e) => setToEmployeeId(e.target.value)}
                 disabled={!selectedAsset}
                 required
                 className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-gray-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all appearance-none disabled:bg-slate-50 disabled:cursor-not-allowed"
               >
                 <option value="" disabled>Search employee...</option>
                 {employees.map(emp => (
                   <option key={emp.id} value={emp.id}>{emp.name}</option>
                 ))}
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Transfer Reason</label>
            <input
              type="text"
              placeholder="e.g. Department Change"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!selectedAsset}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-gray-900 placeholder-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100/50 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Priority</label>
            <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-100 rounded-xl">
              <button
                type="button"
                disabled={!selectedAsset}
                onClick={() => setPriority("Standard")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  priority === "Standard"
                    ? "bg-white text-gray-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-gray-700 disabled:opacity-50"
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                disabled={!selectedAsset}
                onClick={() => setPriority("Urgent")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  priority === "Urgent"
                    ? "bg-white text-brand-600 shadow-sm border border-brand-200"
                    : "text-slate-500 hover:text-gray-700 disabled:opacity-50"
                }`}
              >
                Urgent
              </button>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button
            type="submit"
            disabled={!selectedAsset || !toEmployeeId || loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-600/15 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isAllocated ? "Initiate Transfer Protocol" : "Assign Asset"}
          </button>
        </div>
      </form>
    </div>
  );
}
