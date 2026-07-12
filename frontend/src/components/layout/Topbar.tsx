import { useAuth } from "../../auth/AuthContext";

export default function Topbar() {
  const { userName, role } = useAuth();

  return (
    <header className="h-16 border-b border-slate-100 bg-white px-8 flex items-center justify-between sticky top-0 z-40 shrink-0">
      {/* Global Search Bar */}
      <div className="w-96 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Global search assets, employees, tags..."
          className="w-full pl-10 pr-4 py-2 border border-slate-150 rounded-full text-sm text-gray-900 placeholder-slate-400 bg-slate-50/50 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100/50 transition-all duration-150"
        />
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-5">
        {/* Notification Bell */}
        <button className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification Badge */}
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent-rose border-2 border-white rounded-full" />
        </button>

        {/* Help Center Icon */}
        <button className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-100" />

        {/* User profile dropdown trigger */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 leading-tight">{userName || "Alexander Pierce"}</p>
            <p className="text-[11px] font-semibold text-slate-400 leading-none mt-0.5">
              {role === "Admin" ? "System Admin" : role || "Employee"}
            </p>
          </div>
          {/* Circular avatar */}
          <div className="w-10 h-10 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center font-bold text-brand-700 text-sm overflow-hidden select-none">
            {/* Show avatar image placeholder using generate_image if needed, or simply render user's initials */}
            {(userName || "AP").split(" ").map(w => w[0]).join("").toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
