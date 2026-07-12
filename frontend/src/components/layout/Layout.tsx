import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const { firebaseUser, loading } = useAuth();

  // If session is loading, show a loading placeholder
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <svg className="animate-spin w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-semibold text-slate-500">Loading your profile…</span>
      </div>
    );
  }

  // Route protection: if not logged in, redirect to login page
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
