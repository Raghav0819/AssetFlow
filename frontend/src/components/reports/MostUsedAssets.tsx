import { TrendingUp } from "lucide-react";
import type { MostUsedAssetReport } from "../../types";

export default function MostUsedAssets({ data }: { data: MostUsedAssetReport[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </div>
        <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          +12% ↑
        </div>
      </div>
      
      <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">Most Used Assets</h3>
      
      <div className="space-y-5 flex-1">
        {data.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`} alt={item.name} className="w-full h-full object-cover opacity-80" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                <p className="text-[10px] text-slate-500">{item.department}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-blue-600">{item.hours} hrs</span>
          </div>
        ))}
      </div>
    </div>
  );
}
