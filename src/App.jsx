import { useState } from 'react';
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
import { PaymentApprovals } from './components/payments/PaymentApprovals';
import { RegistrationList } from './components/registrations/RegistrationList';
import { EventManagement } from './components/events/EventManagement';
import { CoordinatorManagement } from './components/coordinators/CoordinatorManagement';
import { SlotManagement } from './components/slots/SlotManagement';
import { CollegeManagement } from './components/colleges/CollegeManagement';
import './App.css';

function AdminPortalContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <span>Verifying Semaphore 2026 Admin Authorization...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileNavOpen(false);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview setActiveTab={handleTabChange} />;
      case 'colleges':
        return <CollegeManagement />;
      case 'admins':
        return <AdminManagement />;
      case 'users':
        return <UserManagement />;
      case 'payments':
        return <PaymentApprovals />;
      case 'registrations':
        return <RegistrationList />;
      case 'events':
        return <EventManagement />;
      case 'coordinators':
        return <CoordinatorManagement />;
      case 'slots':
        return <SlotManagement />;
      default:
        return <DashboardOverview setActiveTab={handleTabChange} />;
    }
  };

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
          activeTab={activeTab} 
          setActiveTab={handleTabChange}
          isMobileNavOpen={isMobileNavOpen}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
        />
        <main className="admin-main-content">
          <div key={activeTab} className="view-transition-container">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AdminPortalContent />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

