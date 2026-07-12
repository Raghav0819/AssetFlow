import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import OrgSetup from "./pages/org-setup/OrgSetup";
import AssetDirectory from "./pages/assets/AssetDirectory";
import AllocationPage from "./pages/allocations/AllocationPage";
import BookingPage from "./pages/bookings/BookingPage";
import MaintenancePage from "./pages/maintenance/MaintenancePage";
import AuditListPage from "./pages/audit/AuditListPage";
import AuditDetailPage from "./pages/audit/AuditDetailPage";
import ReportsPage from "./pages/reports/ReportsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Private Layout-wrapped Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/org-setup" element={<OrgSetup />} />
          <Route path="/assets" element={<AssetDirectory />} />
          <Route path="/allocation" element={<AllocationPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/audit" element={<AuditListPage />} />
          <Route path="/audit/:id" element={<AuditDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {/* Fallbacks inside Auth Layout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Default Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

