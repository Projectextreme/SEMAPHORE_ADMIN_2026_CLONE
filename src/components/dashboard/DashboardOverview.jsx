import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import {
  Users,
  ShieldCheck,
  CreditCard,
  Calendar,
  ArrowUpRight,
  Award,
  Zap
} from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = ({ setActiveTab }) => {
  const { admin, isSuperAdmin } = useAuth();

  const [stats, setStats] = useState({
    totalAdmins: 3,
    totalUsers: 3,
    pendingPayments: 2,
    approvedPayments: 12,
    activeEvents: 8,
    totalColleges: 5
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const users = await apiService.getAllUsers();

        if (isSuperAdmin) {
          const admins = await apiService.getAllAdmins();

          setStats((prev) => ({
            ...prev,
            totalUsers: users.length,
            totalAdmins: admins.length
          }));
        } else {
          setStats((prev) => ({
            ...prev,
            totalUsers: users.length
          }));
        }
      } catch (err) {
        console.warn('Dashboard stats fallback mode');
      }
    };

    loadStats();
  }, [isSuperAdmin]);

  return (
    <div className="dashboard-container">

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">

          <span className="welcome-badge">
            <Zap size={14} /> Semaphore 2026 Admin Hub
          </span>

          <h2>
            Welcome back, {admin?.name || 'Admin'}!
          </h2>

          <p>
            You are logged in as{' '}
            <strong className="highlight-text">
              {admin?.role}
            </strong>{' '}
            ({admin?.email}). Overview of registration quotas,
            UTR payment verifications, and system admins below.
          </p>

        </div>
      </div>


      {/* KPI Cards Grid */}
      <div className="kpi-grid">

        {/* Total Administrators */}
        <div
          className="kpi-card"
          onClick={() => setActiveTab('admins')}
        >
          <div className="kpi-header">

            <span className="kpi-title">
              Total Administrators
            </span>

            <div className="kpi-icon-wrapper icon-indigo">
              <ShieldCheck size={20} />
            </div>

          </div>

          <div className="kpi-value">
            {stats.totalAdmins}
          </div>

          <div className="kpi-footer">
            <span className="kpi-link">
              GET /api/admin/all
              <ArrowUpRight size={14} />
            </span>
          </div>
        </div>


        {/* Registered Users */}
        <div
          className="kpi-card"
          onClick={() => setActiveTab('users')}
        >
          <div className="kpi-header">

            <span className="kpi-title">
              Registered Users
            </span>

            <div className="kpi-icon-wrapper icon-cyan">
              <Users size={20} />
            </div>

          </div>

          <div className="kpi-value">
            {stats.totalUsers}
          </div>

          <div className="kpi-footer">
            <span className="kpi-link">
              GET /api/admin/users
              <ArrowUpRight size={14} />
            </span>
          </div>
        </div>


        {/* Pending Payments */}
        <div
          className="kpi-card"
          onClick={() => setActiveTab('payments')}
        >
          <div className="kpi-header">

            <span className="kpi-title">
              Pending Payment UTRs
            </span>

            <div className="kpi-icon-wrapper icon-amber">
              <CreditCard size={20} />
            </div>

          </div>

          <div className="kpi-value">
            {stats.pendingPayments}
          </div>

          <div className="kpi-footer warning-text">
            <span>
              Needs Scan & Pay verification
            </span>
          </div>
        </div>


        {/* Active Events */}
        <div
          className="kpi-card"
          onClick={() => setActiveTab('events')}
        >
          <div className="kpi-header">

            <span className="kpi-title">
              Active Fest Events
            </span>

            <div className="kpi-icon-wrapper icon-emerald">
              <Calendar size={20} />
            </div>

          </div>

          <div className="kpi-value">
            {stats.activeEvents}
          </div>

          <div className="kpi-footer">
            <span className="kpi-link">
              Tech & Non-Tech events
            </span>
          </div>
        </div>

      </div>


      {/* Event Registration Summary */}
      <div className="card event-summary-card">

        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={18} />
            Event Registration Summary
          </h3>
        </div>

        <div className="event-summary-table-wrapper">

          <table className="event-summary-table">

            <thead>
              <tr>
                <th>EVENT</th>
                <th>TEAMS REGISTERED</th>
                <th>PARTICIPANTS</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>CodeFest Hackathon</td>
                <td>1</td>
                <td>4</td>
              </tr>

              <tr>
                <td>RoboWars</td>
                <td>1</td>
                <td>3</td>
              </tr>

              <tr>
                <td>WebCrafters</td>
                <td>1</td>
                <td>2</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>


      {/* Quick API Action Launchers */}
      <div className="card api-endpoints-card">

        <div className="card-header">

          <h3 className="card-title">
            <Award size={18} />
            Configured REST API Endpoints Quick Access
          </h3>

        </div>


        <div className="endpoints-grid">

          {/* Login */}
          <div
            className="endpoint-item"
            onClick={() => setActiveTab('admins')}
          >
            <span className="method-badge post-method">
              POST
            </span>

            <div className="endpoint-info">
              <span className="endpoint-path">
                /api/admin/login
              </span>

              <span className="endpoint-desc">
                Admin authentication with JWT generation
              </span>
            </div>
          </div>


          {/* Add Admin */}
          <div
            className="endpoint-item"
            onClick={() => setActiveTab('admins')}
          >
            <span className="method-badge post-method">
              POST
            </span>

            <div className="endpoint-info">
              <span className="endpoint-path">
                /api/admin/addadmin
              </span>

              <span className="endpoint-desc">
                Add new admin (Superadmin authorization)
              </span>
            </div>
          </div>


          {/* Make Admin */}
          <div
            className="endpoint-item"
            onClick={() => setActiveTab('admins')}
          >
            <span className="method-badge put-method">
              PUT
            </span>

            <div className="endpoint-info">
              <span className="endpoint-path">
                /api/admin/makeadmin
              </span>

              <span className="endpoint-desc">
                Update admin role to superadmin
              </span>
            </div>
          </div>


          {/* Current Admin */}
          <div
            className="endpoint-item"
            onClick={() => setActiveTab('admins')}
          >
            <span className="method-badge get-method">
              GET
            </span>

            <div className="endpoint-info">
              <span className="endpoint-path">
                /api/admin/me
              </span>

              <span className="endpoint-desc">
                Fetch current admin profile token details
              </span>
            </div>
          </div>


          {/* Users */}
          <div
            className="endpoint-item"
            onClick={() => setActiveTab('users')}
          >
            <span className="method-badge get-method">
              GET
            </span>

            <div className="endpoint-info">
              <span className="endpoint-path">
                /api/admin/users
              </span>

              <span className="endpoint-desc">
                Retrieve all registered users and colleges
              </span>
            </div>
          </div>


          {/* Edit User */}
          <div
            className="endpoint-item"
            onClick={() => setActiveTab('users')}
          >
            <span className="method-badge put-method">
              PUT
            </span>

            <div className="endpoint-info">
              <span className="endpoint-path">
                /api/admin/users/:id
              </span>

              <span className="endpoint-desc">
                Edit user profile, role or college details
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};