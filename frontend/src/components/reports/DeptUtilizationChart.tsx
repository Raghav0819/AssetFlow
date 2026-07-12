import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DeptUtilizationReport } from "../../types";

export default function DeptUtilizationChart({ data }: { data: DeptUtilizationReport[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[300px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Utilization by Dept</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Active hours per operational sector</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div>Target</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-200"></div>Actual</div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={4} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="department" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 8, fill: "#94a3b8", fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="target" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
