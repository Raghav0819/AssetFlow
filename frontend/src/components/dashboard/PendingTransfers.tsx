export default function PendingTransfers({ pendingCount }: { pendingCount: number }) {
  return (
    <div className="bg-white px-6 py-5 border border-slate-100 rounded-2xl shadow-sm h-full flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
      <h3 className="text-base font-bold text-slate-800">Pending Transfers</h3>
      <div className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
        {pendingCount} New
      </div>
    </div>
  );
}
