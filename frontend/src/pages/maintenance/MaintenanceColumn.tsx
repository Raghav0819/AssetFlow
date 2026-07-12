import MaintenanceCard from "./MaintenanceCard";
import type { MaintenanceRequest } from "../../types";

interface Props {
  title: string;
  tickets: MaintenanceRequest[];
  color: string;
}

export default function MaintenanceColumn({ title, tickets, color }: Props) {
  return (
    <div className="w-80 shrink-0 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
          <h3 className="font-semibold text-slate-500 tracking-wider text-sm">{title}</h3>
        </div>
        <span className="bg-slate-100 text-blue-600 font-bold text-xs px-2 py-0.5 rounded-md">
          {tickets.length}
        </span>
      </div>
      
      <div className={`flex-1 overflow-y-auto rounded-xl border-t-2 ${color.replace('bg-', 'border-')} pt-3 pb-2 space-y-3`}>
        {tickets.map((ticket) => (
          <MaintenanceCard key={ticket.id} ticket={ticket} />
        ))}
        {tickets.length === 0 && (
          <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
            No tickets
          </div>
        )}
      </div>
    </div>
  );
}
