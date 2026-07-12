import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Filter, Download, Lock, AlertTriangle, MoreVertical, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { api } from "../../api/client";
import type { AuditCycle, AuditResult } from "../../types";

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cycle, setCycle] = useState<AuditCycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const fetchCycle = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getAuditById(id);
      setCycle(data);
    } catch (e) {
      console.error("Failed to load audit cycle", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchCycle(); }, [fetchCycle]);

  const handleMark = async (assetId: string, result: AuditResult) => {
    if (!id) return;
    const notes = result === "Missing" ? "Asset not found at expected location" : result === "Damaged" ? "Asset found with damage" : null;
    try {
      await api.markAuditItem(id, assetId, result, notes);
      setActiveDropdown(null);
      fetchCycle();
    } catch (e) {
      console.error("Failed to mark item", e);
    }
  };

  const handleClose = async () => {
    if (!id || !window.confirm("Close this audit cycle? Missing assets will be marked as Lost.")) return;
    setClosing(true);
    try {
      await api.closeAudit(id);
      fetchCycle();
    } catch (e) {
      console.error("Failed to close audit", e);
    } finally {
      setClosing(false);
    }
  };

  const handleExportCSV = async () => {
    if (!id) return;
    try {
      const items = await api.getDiscrepancyReport(id);
      if (items.length === 0) {
        alert("No discrepancies found.");
        return;
      }
      const headers = ["Asset ID", "Asset Name", "Location", "Serial Number", "Assigned User", "Status", "Notes"];
      const rows = items.map(i => [
        i.asset_tag || "", i.asset_name || "", i.asset_location || "", i.asset_serial || "",
        i.assigned_user_name || "", i.result, i.notes || ""
      ]);
      const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit_report_${id}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export CSV", e);
    }
  };

  if (loading) return <div className="p-8 flex justify-center text-slate-500">Loading audit details...</div>;
  if (!cycle) return <div className="p-8 flex justify-center text-red-500">Audit cycle not found.</div>;

  const items = cycle.items || [];
  const totalItems = cycle.total_items || 0;
  const reviewed = (cycle.verified_count || 0) + (cycle.missing_count || 0) + (cycle.damaged_count || 0);
  const progress = totalItems > 0 ? Math.round((reviewed / totalItems) * 100) : 0;
  const flaggedCount = (cycle.missing_count || 0) + (cycle.damaged_count || 0);
  const isClosed = cycle.status === "Closed";

  const getResultBadge = (result: AuditResult) => {
    switch (result) {
      case "Verified": return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" />Verified</span>;
      case "Missing": return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-full"><XCircle className="w-3.5 h-3.5" />Missing</span>;
      case "Damaged": return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full"><AlertCircle className="w-3.5 h-3.5" />Damaged</span>;
      default: return <span className="text-xs text-slate-400 font-medium">Pending</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <Link to="/audit" className="hover:text-blue-600 transition-colors">Audits</Link>
            <span>›</span>
            <span className="text-blue-600 font-semibold">
              {isClosed ? "Closed Cycle" : "Active Cycle"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Q3 Audit - {cycle.department_name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Scheduled completion: {new Date(cycle.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • {totalItems} Assets total
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Progress</p>
          <p className="text-3xl font-black text-blue-600">{progress}%</p>
          <div className="w-24 bg-slate-100 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Inventory Checklist Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Inventory Checklist</h2>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-medium">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 tracking-widest uppercase">Asset ID</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 tracking-widest uppercase">Asset Description</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 tracking-widest uppercase">Expected Location</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 tracking-widest uppercase">Assigned User</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 tracking-widest uppercase">Verification Status</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-blue-600">{item.asset_tag}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-800">{item.asset_name}</p>
                    <p className="text-xs text-slate-400">S/N: {item.asset_serial}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.asset_location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-slate-600">{item.assigned_user_name?.charAt(0) || "?"}</span>
                      </div>
                      <span className="text-sm text-slate-700">{item.assigned_user_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getResultBadge(item.result)}</td>
                  <td className="px-6 py-4 text-center relative">
                    {item.result === "Pending" && !isClosed ? (
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          Verify Now
                        </button>
                        {activeDropdown === item.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-20">
                            <button onClick={() => handleMark(item.asset_id, "Verified")} className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 rounded-t-lg">
                              <CheckCircle2 className="w-4 h-4" /> Verified
                            </button>
                            <button onClick={() => handleMark(item.asset_id, "Missing")} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Missing
                            </button>
                            <button onClick={() => handleMark(item.asset_id, "Damaged")} className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2 rounded-b-lg">
                              <AlertCircle className="w-4 h-4" /> Damaged
                            </button>
                          </div>
                        )}
                      </div>
                    ) : !isClosed ? (
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing 1-{items.length} of {totalItems} Assets
        </div>
      </div>

      {/* Bottom Actions */}
      {!isClosed && flaggedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">{flaggedCount} assets flagged</p>
            <p className="text-xs text-red-600">Missing or Damaged assets require manual sign-off before closing cycle.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap"
          >
            View Discrepancies
          </button>
        </div>
      )}

      {!isClosed && (
        <div className="flex justify-end gap-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Generate Audit Report
          </button>
          <button
            onClick={handleClose}
            disabled={closing}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium text-sm transition-colors shadow-sm disabled:opacity-70"
          >
            <Lock className="w-4 h-4" />
            {closing ? "Closing..." : "Close Audit Cycle"}
          </button>
        </div>
      )}

      {isClosed && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
          <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">This audit cycle has been closed.</p>
          <p className="text-xs text-slate-500 mt-1">All missing assets have been marked as Lost.</p>
        </div>
      )}
    </div>
  );
}
