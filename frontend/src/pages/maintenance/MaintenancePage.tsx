import { useEffect, useState } from "react";
import { Plus, Filter } from "lucide-react";
import MaintenanceColumn from "./MaintenanceColumn";
import NewTicketModal from "./NewTicketModal";
import { api } from "../../api/client";
import type { MaintenanceRequest, MaintenanceStatus } from "../../types";

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      const data = await api.getMaintenanceRequests();
      setTickets(data);
    } catch (error) {
      console.error("Failed to load maintenance tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getTicketsByStatus = (status: MaintenanceStatus) => 
    tickets.filter((t) => t.status === status);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time tracking of asset repair and health status.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Kanban Board Area */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500">Loading pipeline...</div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-6 h-full pb-4 min-w-max">
            <MaintenanceColumn 
              title="PENDING" 
              tickets={getTicketsByStatus("Pending")} 
              color="bg-slate-400" 
            />
            <MaintenanceColumn 
              title="APPROVED" 
              tickets={getTicketsByStatus("Approved")} 
              color="bg-blue-500" 
            />
            <MaintenanceColumn 
              title="TECHNICIAN ASSIGNED" 
              tickets={getTicketsByStatus("TechnicianAssigned")} 
              color="bg-indigo-500" 
            />
            <MaintenanceColumn 
              title="IN PROGRESS" 
              tickets={getTicketsByStatus("InProgress")} 
              color="bg-amber-500" 
            />
            <MaintenanceColumn 
              title="RESOLVED" 
              tickets={getTicketsByStatus("Resolved")} 
              color="bg-emerald-500" 
            />
          </div>
        </div>
      )}

      <NewTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setIsModalOpen(false);
          fetchTickets();
        }} 
      />
    </div>
  );
}
