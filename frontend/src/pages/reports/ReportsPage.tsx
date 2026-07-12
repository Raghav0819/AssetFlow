import { useEffect, useState } from "react";
import { Download, Table, Calendar } from "lucide-react";
import { api } from "../../api/client";
import type { 
  MostUsedAssetReport, 
  RetirementReport, 
  DeptUtilizationReport, 
  IdleReport, 
  MaintenanceFreqReport 
} from "../../types";

import MostUsedAssets from "../../components/reports/MostUsedAssets";
import NearingRetirement from "../../components/reports/NearingRetirement";
import DeptUtilizationChart from "../../components/reports/DeptUtilizationChart";
import IdleAssetsDonut from "../../components/reports/IdleAssetsDonut";
import MaintenanceFrequencyChart from "../../components/reports/MaintenanceFrequencyChart";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  
  const [utilization, setUtilization] = useState<{ most_used: MostUsedAssetReport[], by_dept: DeptUtilizationReport[] } | null>(null);
  const [retirement, setRetirement] = useState<RetirementReport[]>([]);
  const [idle, setIdle] = useState<IdleReport | null>(null);
  const [maintenanceFreq, setMaintenanceFreq] = useState<MaintenanceFreqReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [utilData, retData, idleData, maintData] = await Promise.all([
          api.getReportUtilization(),
          api.getReportRetirement(),
          api.getReportIdleAssets(),
          api.getReportMaintenanceFrequency()
        ]);
        
        setUtilization(utilData);
        setRetirement(retData);
        setIdle(idleData);
        setMaintenanceFreq(maintData);
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  const handlePdfExport = () => {
    window.print();
  };

  const handleExcelExport = () => {
    alert("Excel export functionality would typically trigger a backend generation job or use a library like xlsx.");
  };

  if (loading) return <div className="p-8 flex justify-center text-slate-500">Loading reports...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time performance metrics across all enterprise assets.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handlePdfExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            PDF Export
          </button>
          <button onClick={handleExcelExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors shadow-sm">
            <Table className="w-4 h-4" />
            Excel Sheet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Top Row: Most Used & Nearing Retirement */}
        <div className="xl:col-span-1">
          {utilization && <MostUsedAssets data={utilization.most_used} />}
        </div>
        
        <div className="xl:col-span-2">
           <NearingRetirement data={retirement} />
        </div>

        {/* Middle Row: Dept Utilization & Idle Assets */}
        <div className="xl:col-span-2">
          {utilization && <DeptUtilizationChart data={utilization.by_dept} />}
        </div>
        
        <div className="xl:col-span-1">
          {idle && <IdleAssetsDonut data={idle} />}
        </div>

        {/* Bottom Row: Maintenance Frequency */}
        <div className="xl:col-span-3">
          <MaintenanceFrequencyChart data={maintenanceFreq} />
        </div>
        
      </div>
    </div>
  );
}
