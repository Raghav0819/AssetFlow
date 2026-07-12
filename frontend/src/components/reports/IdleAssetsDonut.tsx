import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { IdleReport } from "../../types";

export default function IdleAssetsDonut({ data }: { data: IdleReport }) {
  const chartData = [
    { name: "Active", value: data.active_pct, color: "#4f46e5" }, // Indigo 600
    { name: "Idle", value: data.idle_pct, color: "#6366f1" },     // Indigo 500
    { name: "Repair", value: data.repair_pct, color: "#c7d2fe" }, // Indigo 200
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-[300px]">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">Idle Assets</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Asset availability distribution</p>
      </div>
      
      <div className="flex-1 w-full relative min-h-0 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              stroke="none"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-800">{data.total_idle}</span>
          <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">Total Idle</span>
        </div>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: entry.color }}></div>
            <span className="text-[10px] font-bold text-slate-500">{entry.name} ({entry.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}
