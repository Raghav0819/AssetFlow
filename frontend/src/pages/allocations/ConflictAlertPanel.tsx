import type { Asset } from "../../types";

interface ConflictAlertPanelProps {
  selectedAsset: Asset | null;
}

export default function ConflictAlertPanel({ selectedAsset }: ConflictAlertPanelProps) {
  const hasConflict = selectedAsset?.status === "Allocated" || selectedAsset?.status === "Reserved";

  if (!selectedAsset) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-center justify-center h-full">
        <p className="text-sm font-semibold text-slate-400">Select an asset to view status</p>
      </div>
    );
  }

  if (!hasConflict) {
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <svg className="w-24 h-24 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 z-10 text-emerald-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1 z-10">Available for Allocation</h3>
        <p className="text-sm text-slate-500 text-center z-10 max-w-[200px]">
          This asset is currently in inventory and ready to be assigned.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-amber-200 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg className="w-32 h-32 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 z-10 text-amber-600">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      
      <h3 className="text-base font-bold text-gray-900 mb-2 z-10">Conflict Alert</h3>
      
      <p className="text-sm text-slate-600 text-center mb-4 z-10 font-medium leading-relaxed max-w-[200px]">
        This asset is currently allocated to <br/>
        <span className="font-bold text-gray-900">{selectedAsset.assigned_to || "someone"}</span>.
      </p>

      <div className="mt-auto w-full bg-amber-50 rounded-xl p-4 border border-amber-100 z-10">
        <p className="text-[10px] font-bold text-amber-600 tracking-wider uppercase mb-1.5">Impact Analysis</p>
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          A transfer request will trigger a 24h approval workflow for Dept. Head.
        </p>
      </div>
    </div>
  );
}
