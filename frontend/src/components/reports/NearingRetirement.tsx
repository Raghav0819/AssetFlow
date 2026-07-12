import { BellOff } from "lucide-react";
import type { RetirementReport } from "../../types";

export default function NearingRetirement({ data }: { data: RetirementReport[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <BellOff className="w-5 h-5 text-red-500" />
        </div>
        <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          Critical ⚠
        </div>
      </div>
      
      <h3 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">Assets Nearing Retirement</h3>
      
      <div className="space-y-5 flex-1">
        {data.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`} alt={item.name} className="w-full h-full object-cover opacity-80" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
                <p className="text-[10px] text-slate-500">{item.lifespan_reached}% Lifespan Reached</p>
              </div>
            </div>
            <span className="text-sm font-medium text-red-500">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
