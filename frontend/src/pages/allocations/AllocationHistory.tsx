import type { Allocation } from "../../types";

interface AllocationHistoryProps {
  history: Allocation[];
}

export default function AllocationHistory({ history }: AllocationHistoryProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-100 flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Active</span>;
      case "Returned":
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />Stocked</span>;
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col flex-1">
      <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-900">Allocation History</h3>
        <button className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
          View Full Archive
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 w-32">Date</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Employee</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Department</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 w-32">Status</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 w-32">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length > 0 ? history.map((alloc) => (
              <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-gray-900">{formatDate(alloc.allocated_at)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-brand-600">
                        {alloc.employee_name?.split(" ").map((n) => n[0]).join("") || "?"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{alloc.employee_name || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600">{alloc.department_name || "N/A"}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(alloc.status)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-500 font-mono">#{alloc.id.split("-")[1] || alloc.id}</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-400">No allocation history available</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
