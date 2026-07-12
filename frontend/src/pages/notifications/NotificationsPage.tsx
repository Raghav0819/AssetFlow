import { useEffect, useState } from "react";
import { Check, Filter, History } from "lucide-react";
import { api } from "../../api/client";
import type { AppNotification } from "../../types";
import NotificationItem from "../../components/notifications/NotificationItem";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error("Failed to mark all read", e);
    }
  };

  const filtered = notifications.filter(n => {
    if (activeTab === "All") return true;
    if (activeTab === "Alerts") return n.type === "alert" || n.type === "ai";
    if (activeTab === "Approvals") return n.type === "maintenance"; // Mapping maintenance to approvals for demo
    if (activeTab === "Bookings") return n.type === "booking";
    return true;
  });

  const getDayGroup = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 86400000) return "TODAY";
    if (diff < 172800000) return "YESTERDAY";
    return "OLDER";
  };

  const grouped = filtered.reduce((acc, curr) => {
    const group = getDayGroup(curr.created_at);
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, AppNotification[]>);

  if (loading) return <div className="p-8 flex justify-center text-slate-500">Loading notifications...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-screen pb-20">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated on your enterprise asset lifecycle and approvals.</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold text-sm transition-colors shadow-sm"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 mb-8 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex gap-2">
            {["All", "Alerts", "Approvals", "Bookings"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {["TODAY", "YESTERDAY", "OLDER"].map(group => {
          if (!grouped[group] || grouped[group].length === 0) return null;
          return (
            <div key={group}>
              <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4 pl-1">
                {group}
              </h3>
              <div className="space-y-4">
                {grouped[group].map(notif => (
                  <NotificationItem key={notif.id} notification={notif} onRead={handleMarkRead} />
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">No notifications found.</div>
        )}
      </div>

      <div className="mt-12 text-center">
        <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 font-semibold text-sm rounded-full hover:bg-slate-200 transition-colors">
          View Historical Activity
          <History className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
