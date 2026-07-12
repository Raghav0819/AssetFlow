import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ClipboardCheck, Calendar, ChevronRight } from "lucide-react";
import CreateAuditModal from "./CreateAuditModal";
import { api } from "../../api/client";
import type { AuditCycle } from "../../types";

export default function AuditListPage() {
  const [cycles, setCycles] = useState<AuditCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCycles = async () => {
    try {
      const data = await api.getAudits();
      setCycles(data);
    } catch (e) {
      console.error("Failed to load audit cycles", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCycles(); }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-100 text-blue-700";
      case "Planned": return "bg-amber-100 text-amber-700";
      case "Closed": return "bg-slate-100 text-slate-500";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  const getProgress = (c: AuditCycle) => {
    const total = c.total_items || 0;
    if (total === 0) return 0;
    const reviewed = (c.verified_count || 0) + (c.missing_count || 0) + (c.damaged_count || 0);
    return Math.round((reviewed / total) * 100);
  };

  if (loading) return <div className="p-8 flex justify-center text-slate-500">Loading audits...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asset Audits</h1>
          <p className="text-sm text-slate-500 mt-1">Manage inventory verification cycles and track audit progress.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Audit
        </button>
      </div>

      {cycles.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No audit cycles yet</p>
          <p className="text-sm mt-1">Create your first audit cycle to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cycles.map(c => {
            const progress = getProgress(c);
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/audit/${c.id}`)}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-6"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      {c.department_name || "All Departments"} Audit
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {c.start_date} — {c.end_date}
                    </span>
                    <span>{c.total_items} assets</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-bold text-slate-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateAuditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchCycles(); }}
      />
    </div>
  );
}
