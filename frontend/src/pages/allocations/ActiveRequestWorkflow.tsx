import type { TransferRequest } from "../../types";

interface ActiveRequestWorkflowProps {
  activeRequest: TransferRequest | null;
}

export default function ActiveRequestWorkflow({ activeRequest }: ActiveRequestWorkflowProps) {
  if (!activeRequest) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 mb-6 flex flex-col h-40 items-center justify-center">
         <p className="text-sm font-semibold text-slate-400">No active transfer workflow</p>
      </div>
    );
  }

  // Stages matching the screenshot
  const stages = [
    { id: "initiated", label: "Initiated", icon: "check", status: "completed" },
    { id: "inventory", label: "Inventory Check", icon: "clipboard", status: "completed" },
    { id: "approval", label: "Dept. Approval", icon: "refresh", status: "active", note: "Pending" },
    { id: "compliance", label: "Compliance", icon: "shield", status: "pending", note: "Waiting..." },
    { id: "handover", label: "Final Handover", icon: "truck", status: "pending", note: "Waiting..." },
  ];

  return (
    <div className="bg-white border border-brand-100 rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-bold text-gray-900">
          Active Request Workflow: <span className="text-brand-600">{activeRequest.id}</span>
        </h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">In Review</span>
        </div>
      </div>

      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-100 -z-10" />

        <div className="flex justify-between">
          {stages.map((stage) => (
            <div key={stage.id} className="flex flex-col items-center w-32 relative">
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white mb-3 shadow-sm transition-colors ${
                  stage.status === "completed"
                    ? "bg-emerald-500 text-white"
                    : stage.status === "active"
                    ? "bg-brand-600 text-white shadow-brand-500/30 shadow-lg"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {stage.icon === "check" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {stage.icon === "clipboard" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                )}
                {stage.icon === "refresh" && (
                  <svg className={`w-4 h-4 ${stage.status === "active" ? "animate-spin-slow" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {stage.icon === "shield" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {stage.icon === "truck" && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                )}
              </div>

              {/* Label */}
              <p className={`text-xs font-bold text-center mb-1 ${
                stage.status === "completed" ? "text-gray-900" :
                stage.status === "active" ? "text-brand-600" : "text-slate-400"
              }`}>
                {stage.label}
              </p>

              {/* Note / Date */}
              {stage.status === "completed" ? (
                <p className="text-[10px] text-slate-500 font-medium text-center">Today, 09:12 AM</p>
              ) : (
                <p className={`text-[10px] font-medium text-center ${stage.status === 'active' ? 'text-brand-400' : 'text-slate-400'}`}>
                  {stage.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
