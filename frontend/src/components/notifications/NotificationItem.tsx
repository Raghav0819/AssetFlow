import { Wrench, Sparkles, AlertTriangle, UserCheck } from "lucide-react";
import type { AppNotification } from "../../types";

interface Props {
  notification: AppNotification;
  onRead: (id: string) => void;
}

export default function NotificationItem({ notification, onRead }: Props) {
  
  const getIcon = () => {
    switch (notification.type) {
      case "assignment":
        return <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><UserCheck className="w-5 h-5" /></div>;
      case "maintenance":
        return <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><Wrench className="w-5 h-5" /></div>;
      case "alert":
        return <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shrink-0"><AlertTriangle className="w-5 h-5" /></div>;
      case "ai":
        return <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shrink-0"><Sparkles className="w-5 h-5" /></div>;
      default:
        return <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0"><UserCheck className="w-5 h-5" /></div>;
    }
  };

  const getBorderColor = () => {
    if (notification.type === "alert" && !notification.read) return "border-l-4 border-l-red-500 border-y border-r border-slate-200";
    if (notification.type === "ai" && !notification.read) return "border border-purple-200 bg-purple-50/30";
    return "border border-slate-200";
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div 
      className={`bg-white rounded-xl p-5 shadow-sm transition-all flex gap-4 ${getBorderColor()} ${!notification.read ? "shadow-md" : ""}`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      {getIcon()}
      
      <div className="flex-1 min-w-0 cursor-default">
        <div className="flex justify-between items-start gap-4 mb-1">
          <h4 className="text-sm font-bold text-slate-900">{notification.title}</h4>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
              {formatTimeAgo(notification.created_at)}
            </span>
            {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
          </div>
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {notification.message}
        </p>

        {/* Custom actions based on mock design */}
        {notification.type === "assignment" && (
          <div className="flex gap-4">
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Asset Details</button>
            <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">Archive</button>
          </div>
        )}

        {notification.type === "maintenance" && notification.assigned_to_name && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-2">
              <img src={`https://ui-avatars.com/api/?name=${notification.assigned_to_name.replace(" ", "+")}&background=random`} alt="Assignee" className="w-5 h-5 rounded-full border border-white" />
              <div className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[8px] font-bold text-slate-500">+2</div>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Assigned to: {notification.assigned_to_name}</span>
          </div>
        )}

        {notification.type === "alert" && (
          <div className="flex gap-4 items-center mt-2">
            <button className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors">
              Contact Borrower
            </button>
            <button className="text-xs font-semibold text-slate-500 hover:text-slate-700">
              Mark Resolved
            </button>
          </div>
        )}

        {notification.type === "ai" && (
          <div className="mt-2">
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Generate Purchase Order →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
