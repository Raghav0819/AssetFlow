import { MoreHorizontal } from "lucide-react";
import type { MaintenanceRequest, Priority } from "../../types";

export default function MaintenanceCard({ ticket }: { ticket: MaintenanceRequest }) {
  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case "High":
        return { text: "! URGENT", color: "text-red-600 font-bold" };
      case "Medium":
        return { text: "! MEDIUM", color: "text-amber-500 font-bold" };
      case "Low":
        return { text: "⊘ NORMAL", color: "text-blue-600 font-medium" };
      default:
        return { text: priority, color: "text-slate-500" };
    }
  };

  const pStyle = getPriorityStyle(ticket.priority);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {ticket.asset_tag}
        </span>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      <h4 className="text-sm font-semibold text-slate-800 mb-1.5 leading-tight">
        {ticket.issue_description.split(".")[0]}
      </h4>
      
      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
        {ticket.issue_description.substring(ticket.issue_description.indexOf(".") + 1).trim() || ticket.issue_description}
      </p>
      
      <div className="flex justify-between items-center mt-auto">
        <span className={`text-[10px] tracking-widest ${pStyle.color}`}>
          {pStyle.text}
        </span>
        
        <div className="flex items-center gap-2">
          {ticket.technician_name && (
            <span className="text-[10px] text-slate-400 font-medium">{ticket.technician_name}</span>
          )}
          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border border-white shrink-0">
            <span className="text-[10px] font-bold text-slate-600">
              {ticket.raised_by_name?.charAt(0) || "U"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
