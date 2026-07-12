import { Plus, Calendar, Megaphone } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="flex gap-4">
      <button className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm h-16 flex items-center justify-center hover:bg-slate-50 transition-colors">
        <div className="w-10 h-10 rounded-full border border-blue-100 text-blue-600 flex items-center justify-center">
           <Plus className="w-5 h-5" />
        </div>
      </button>
      <button className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm h-16 flex items-center justify-center hover:bg-slate-50 transition-colors">
        <div className="w-10 h-10 rounded-full border border-blue-100 text-blue-600 flex items-center justify-center">
           <Calendar className="w-5 h-5" />
        </div>
      </button>
      <button className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm h-16 flex items-center justify-center hover:bg-slate-50 transition-colors">
        <div className="w-10 h-10 rounded-full border border-blue-100 text-blue-600 flex items-center justify-center">
           <Megaphone className="w-5 h-5" />
        </div>
      </button>
    </div>
  );
}
