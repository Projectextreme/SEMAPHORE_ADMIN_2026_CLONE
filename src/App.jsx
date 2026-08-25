import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AdminManagement } from './components/admins/AdminManagement';
import { UserManagement } from './components/users/UserManagement';
import { UserProfileView } from './components/users/UserProfileView';
import { PaymentApprovals } from './components/payments/PaymentApprovals';
import { RegistrationList } from './components/registrations/RegistrationList';
import { EventManagement } from './components/events/EventManagement';
import { CoordinatorManagement } from './components/coordinators/CoordinatorManagement';
import { SlotManagement } from './components/slots/SlotManagement';
import { CollegeManagement } from './components/colleges/CollegeManagement';
import { ReportsHub } from './components/reports/ReportsHub';
import { TeamRulesManagement } from './components/rules/TeamRulesManagement';
import './App.css';


function AdminLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="admin-app-layout">
      {/* Subtle Ambient Background Mesh Lights */}
      <div className="ambient-glow-orb orb-primary" />
      <div className="ambient-glow-orb orb-cyan" />

      <Header 
        isMobileNavOpen={isMobileNavOpen} 
        onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)} 
      />
      <div className="admin-body">
        <Sidebar 
          isMobileNavOpen={isMobileNavOpen}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
        />
        <main className="admin-main-content">
          <div key={location.pathname} className="view-transition-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <span>Verifying Semaphore 2026 Admin Authorization...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <AdminLayout />;
}

function SuperAdminRoute({ children }) {
  const { isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <span>Verifying Semaphore 2026 Admin Authorization...</span>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <span>Verifying Semaphore 2026 Admin Authorization...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Public Auth Route */}
              <Route
                path="/login"
                element={
                  <PublicAuthRoute>
                    <LoginView />
                  </PublicAuthRoute>
                }
              />

              {/* Protected App Routes inside AdminLayout */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardOverview />} />
                <Route path="/colleges" element={<CollegeManagement />} />
                <Route path="/events" element={<EventManagement />} />
                <Route path="/rules" element={<TeamRulesManagement />} />
                <Route path="/team-rules" element={<TeamRulesManagement />} />
                <Route path="/registrations" element={<RegistrationList />} />
                <Route path="/payments" element={<PaymentApprovals />} />
                <Route path="/coordinators" element={<CoordinatorManagement />} />
                <Route path="/slots" element={<SlotManagement />} />
                <Route path="/reports" element={<ReportsHub />} />
                <Route path="/users" element={<UserManagement />} />

                <Route path="/user/:userId" element={<UserProfileView />} />
                <Route
                  path="/admins"
                  element={
                    <SuperAdminRoute>
                      <AdminManagement />
                    </SuperAdminRoute>
                  }
                />
              </Route>

              {/* Fallback Wildcard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <ToastContainer />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}
