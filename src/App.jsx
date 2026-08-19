import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import './App.css';

function AdminPortalContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview setActiveTab={setActiveTab} />;
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
        return <DashboardOverview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="admin-app-layout">
      <Header />
      <div className="admin-body">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="admin-main-content">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminPortalContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
