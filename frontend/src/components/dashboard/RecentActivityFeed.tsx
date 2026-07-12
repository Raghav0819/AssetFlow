import { UserPlus, CalendarCheck, Wrench, AlertCircle, Inbox, HelpCircle } from "lucide-react";
import type { ActivityLog } from "../../types";

export default function RecentActivityFeed({ logs }: { logs: ActivityLog[] | null }) {
  if (!logs) return <div className="h-full bg-white p-6 border border-slate-100 rounded-2xl animate-pulse"></div>;

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return { icon: <UserPlus className="w-4 h-4 text-blue-600" />, bg: "bg-blue-100" };
      case "booking": return { icon: <CalendarCheck className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-100" };
      case "maintenance": return { icon: <Wrench className="w-4 h-4 text-amber-600" />, bg: "bg-amber-100" };
      case "alert": return { icon: <AlertCircle className="w-4 h-4 text-red-600" />, bg: "bg-red-100" };
      case "request": return { icon: <Inbox className="w-4 h-4 text-purple-600" />, bg: "bg-purple-100" };
      default: return { icon: <HelpCircle className="w-4 h-4 text-slate-600" />, bg: "bg-slate-100" };
    }
  };

  return (
    <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h3>
      
      <div className="flex-1 overflow-y-auto">
        <div className="relative border-l border-slate-200 ml-3 space-y-8">
          {logs.map((item) => {
            const { icon, bg } = getIcon(item.type);
            return (
              <div key={item.id} className="relative pl-8">
                <div 
                  className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ${bg} ring-4 ring-white`}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
