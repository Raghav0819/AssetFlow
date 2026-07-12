import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { MaintenanceTrendData } from "../../types";

export default function MaintenanceTrendsChart({ data }: { data: MaintenanceTrendData[] | null }) {
  if (!data) return <div className="h-full bg-white p-6 border border-slate-100 rounded-2xl animate-pulse"></div>;
  return (
    <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Maintenance Trends</h3>
      </div>
      
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle" 
              wrapperStyle={{ top: -40, fontSize: '12px', fontWeight: 600, color: '#475569' }}
            />
            <Line 
              type="monotone" 
              dataKey="scheduled" 
              name="Scheduled" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="emergency" 
              name="Emergency" 
              stroke="#f43f5e" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
