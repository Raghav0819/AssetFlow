import { useEffect, useState } from "react";
import KPICards from "../components/dashboard/KPICards";
import UtilizationChart from "../components/dashboard/UtilizationChart";
import MaintenanceTrendsChart from "../components/dashboard/MaintenanceTrendsChart";
import RecentActivityFeed from "../components/dashboard/RecentActivityFeed";
import QuickActions from "../components/dashboard/QuickActions";
import PendingTransfers from "../components/dashboard/PendingTransfers";
import { api } from "../api/client";
import type { DashboardSummary, UtilizationData, MaintenanceTrendData, ActivityLog, TransferRequest } from "../types";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [utilization, setUtilization] = useState<UtilizationData[] | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceTrendData[] | null>(null);
  const [logs, setLogs] = useState<ActivityLog[] | null>(null);
  const [transfers, setTransfers] = useState<TransferRequest[] | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [sum, util, maint, logList, trans] = await Promise.all([
          api.getDashboardSummary(),
          api.getUtilizationReport(),
          api.getMaintenanceTrends(),
          api.getLogs(),
          api.getTransfers()
        ]);
        setSummary(sum);
        setUtilization(util);
        setMaintenance(maint);
        setLogs(logList);
        setTransfers(trans);
      } catch (e) {
        console.error("Error loading dashboard data", e);
      }
    }
    loadData();
  }, []);

  if (!summary) return <div className="p-8 flex justify-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="p-2 space-y-6 max-w-7xl mx-auto bg-[#f8fafc] min-h-screen">
      <KPICards data={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <UtilizationChart data={utilization} />
          <MaintenanceTrendsChart data={maintenance} />
          
          {/* Bottom Action Row */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-full sm:w-1/3">
              <QuickActions />
            </div>
            <div className="w-full sm:w-2/3">
              <PendingTransfers pendingCount={transfers?.filter(t => t.status === "Requested").length || 0} />
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Content) */}
        <div className="lg:col-span-1">
          <RecentActivityFeed logs={logs} />
        </div>
      </div>
    </div>
  );
}
