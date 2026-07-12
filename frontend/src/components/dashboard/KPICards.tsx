import { CheckCircle2, MonitorSmartphone, Wrench, Smartphone } from "lucide-react";

import type { DashboardSummary } from "../../types";

export default function KPICards({ data }: { data: DashboardSummary }) {
  const kpis = [
    {
      label: "AVAILABLE ASSETS",
      value: data.available_assets.toString(),
      icon: <MonitorSmartphone className="w-6 h-6 text-blue-600" />,
      iconColor: "bg-blue-50 text-blue-600",
    },
    {
      label: "ALLOCATED",
      value: data.allocated_assets.toString(),
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      iconColor: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "OVERDUE ALLOC.",
      value: data.overdue_allocations.toString(),
      icon: <Wrench className="w-6 h-6 text-amber-500" />,
      iconColor: "bg-amber-50 text-amber-500",
    },
    {
      label: "ACTIVE BOOKINGS",
      value: data.bookings_today.toString(),
      icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
      iconColor: "bg-indigo-50 text-indigo-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm flex items-center gap-5"
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${kpi.iconColor}`}>
            {kpi.icon}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.label}</span>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {kpi.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
