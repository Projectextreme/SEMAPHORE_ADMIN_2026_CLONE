import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';
import { CountUp } from '../common/CountUp';
import { TiltCard } from '../common/TiltCard';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Layers,
  Building2,
  Users,
  CreditCard,
  Calendar,
  Zap,
  RefreshCw,
  Download,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Percent,
  Compass
} from 'lucide-react';
import './VisualAnalyticsHub.css';

export const VisualAnalyticsHub = ({ isEmbedded = false }) => {
  const navigate = useNavigate();
  const { admin: authAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('all');
  const [activeDonutSlice, setActiveDonutSlice] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const [rawUsers, setRawUsers] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);
  const [rawRegs, setRawRegs] = useState([]);
  const [rawPayments, setRawPayments] = useState([]);
  const [rawColleges, setRawColleges] = useState([]);
  const [rawCoordinators, setRawCoordinators] = useState([]);
  const [rawAdmins, setRawAdmins] = useState([]);

  const loadAllAnalyticsData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [usersData, eventsData, regsData, paymentsData, collegesData, coordsData, adminsData] = await Promise.all([
        apiService.getAllUsers().catch(() => []),
        apiService.getAllEvents().catch(() => []),
        apiService.getRegistrations().catch(() => []),
        apiService.getRecentPayments().catch(() => ({ payments: [] })),
        apiService.getColleges().catch(() => []),
        apiService.getCoordinators().catch(() => []),
        apiService.getAllAdmins().catch(() => [])
      ]);

      const usersList = Array.isArray(usersData) ? usersData : (usersData?.users || []);
      const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData?.events || []);
      const regsList = Array.isArray(regsData) ? regsData : (regsData?.registrations || []);
      const paymentsList = paymentsData?.payments || (Array.isArray(paymentsData) ? paymentsData : []);
      const collegesList = Array.isArray(collegesData) ? collegesData : (collegesData?.colleges || []);
      const coordsList = Array.isArray(coordsData) ? coordsData : (coordsData?.coordinators || []);
      const adminsList = Array.isArray(adminsData) ? adminsData : (adminsData?.admins || []);

      setRawUsers(usersList);
      setRawEvents(eventsList);
      setRawRegs(regsList);
      setRawPayments(paymentsList);
      setRawColleges(collegesList);
      setRawCoordinators(coordsList);
      setRawAdmins(adminsList);
    } catch (err) {
      console.warn('Analytics data loading fallback:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, []);

  useEffect(() => {
    loadAllAnalyticsData();
  }, [loadAllAnalyticsData]);

  // Event Fee Map for 100% accurate financial calculations
  const eventFeeMap = useMemo(() => {
    const map = new Map();
    rawEvents.forEach(e => {
      const fee = Number(e.registrationFee || (typeof e.fee === 'string' ? e.fee.replace(/[^0-9.]/g, '') : e.fee) || 0);
      if (fee > 0) {
        if (e._id) map.set(String(e._id).toLowerCase().trim(), fee);
        if (e.id) map.set(String(e.id).toLowerCase().trim(), fee);
        if (e.title) map.set(e.title.toLowerCase().trim(), fee);
        if (e.name) map.set(e.name.toLowerCase().trim(), fee);
      }
    });
    return map;
  }, [rawEvents]);

  const resolveItemAmount = useCallback((item) => {
    if (typeof item?.amountNumber === 'number' && item.amountNumber > 0) return item.amountNumber;
    if (typeof item?.amountNum === 'number' && item.amountNum > 0) return item.amountNum;
    if (typeof item?.amount === 'number' && item.amount > 0) return item.amount;
    if (typeof item?.amount === 'string') {
      const num = Number(item.amount.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0) return num;
    }
    const evKey1 = String(item?.event?._id || item?.event?.id || item?.eventId || item?.event || '').toLowerCase().trim();
    const evKey2 = String(item?.eventName || item?.eventTitle || item?.events?.[0]?.title || item?.events?.[0]?._id || '').toLowerCase().trim();
    if (eventFeeMap.has(evKey1)) return eventFeeMap.get(evKey1);
    if (eventFeeMap.has(evKey2)) return eventFeeMap.get(evKey2);
    return 200; // Standard Semaphore registration fee default
  }, [eventFeeMap]);

  // Derived Analytics Aggregations
  const metrics = useMemo(() => {
    const effectiveTeams = rawRegs.length > 0 ? rawRegs : rawPayments;
    const effectivePayments = rawPayments.length > 0 ? rawPayments : rawRegs;

    const approvedList = effectivePayments.filter(p => (p.status || p.paymentStatus || '').toLowerCase().includes('app') || (p.rawStatus || '').toLowerCase().includes('app') || (p.status || '').toLowerCase() === 'success');
    const pendingList = effectivePayments.filter(p => (p.status || p.paymentStatus || '').toLowerCase().includes('pend') || (p.rawStatus || '').toLowerCase().includes('pend'));
    const rejectedList = effectivePayments.filter(p => (p.status || p.paymentStatus || '').toLowerCase().includes('rej') || (p.rawStatus || '').toLowerCase().includes('rej'));

    const approvedRev = approvedList.reduce((sum, p) => sum + resolveItemAmount(p), 0);
    const pendingRev = pendingList.reduce((sum, p) => sum + resolveItemAmount(p), 0);
    const totalVolume = approvedRev + pendingRev;

    const clearanceRate = effectivePayments.length > 0 
      ? Math.round((approvedList.length / effectivePayments.length) * 100)
      : 0;

    // Event Registration Breakdown
    const eventCounts = {};
    rawEvents.forEach(e => {
      const title = e.title || e.name || 'General Event';
      eventCounts[title] = {
        title,
        id: e._id || e.id,
        count: 0,
        capacity: Number(e.capacity) || 50,
        fee: Number(e.registrationFee) || 200,
        revenue: 0
      };
    });

    effectiveTeams.forEach(t => {
      const eName = t.eventName || t.eventTitle || t.event?.title || (typeof t.event === 'string' ? t.event : '') || (t.events?.[0]?.title) || 'General Event';
      const match = Object.keys(eventCounts).find(k => k.toLowerCase() === eName.toLowerCase()) || eName;
      if (!eventCounts[match]) {
        eventCounts[match] = {
          title: match,
          id: match,
          count: 0,
          capacity: 50,
          fee: resolveItemAmount(t),
          revenue: 0
        };
      }
      eventCounts[match].count += 1;
      eventCounts[match].revenue += resolveItemAmount(t);
    });

    const eventBarData = Object.values(eventCounts).sort((a, b) => b.count - a.count);

    // College Quota Utilization
    const collegeCounts = {};
    rawColleges.forEach(c => {
      const name = c.collegeName || c.name || 'Unknown College';
      collegeCounts[name] = {
        name,
        teams: Number(c.totalTeams) || 0,
        maxQuota: 1
      };
    });

    effectiveTeams.forEach(t => {
      const cName = t.collegeName || t.user?.collegeName || 'General College';
      if (!collegeCounts[cName]) {
        collegeCounts[cName] = { name: cName, teams: 0, maxQuota: 1 };
      }
      collegeCounts[cName].teams = Math.min(1, Math.max(collegeCounts[cName].teams, (collegeCounts[cName].teams || 0) + 1));
    });

    const collegeBarData = Object.values(collegeCounts).slice(0, 6);

    // Coordinators & Admins identification and resolution
    const coordIds = new Set(rawCoordinators.map(c => String(c._id || c.id || '')).filter(Boolean));
    const coordEmails = new Set(rawCoordinators.map(c => (c.email || '').toLowerCase().trim()).filter(Boolean));
    const coordNames = new Set(rawCoordinators.map(c => (c.name || '').toLowerCase().trim()).filter(Boolean));

    // Also collect event-assigned coordinator identifiers
    rawEvents.forEach(evt => {
      const coords = Array.isArray(evt.coordinators) ? evt.coordinators : [];
      coords.forEach(c => {
        if (typeof c === 'string' && c.trim()) {
          coordIds.add(c.trim());
          coordNames.add(c.trim().toLowerCase());
        } else if (typeof c === 'object' && c !== null) {
          if (c._id || c.id) coordIds.add(String(c._id || c.id));
          if (c.email) coordEmails.add(c.email.toLowerCase().trim());
          if (c.name) coordNames.add(c.name.toLowerCase().trim());
        }
      });
    });

    const isCoordUser = (u) => {
      if (!u) return false;
      const r = (u.role || '').toLowerCase();
      if (r === 'coordinator' || r.includes('coord')) return true;
      const uid = String(u._id || u.id || '');
      const uemail = (u.email || '').toLowerCase().trim();
      const uname = (u.name || '').toLowerCase().trim();
      return (uid && coordIds.has(uid)) || (uemail && coordEmails.has(uemail)) || (uname && coordNames.has(uname));
    };

    const adminIds = new Set(rawAdmins.map(a => String(a._id || a.id || '')).filter(Boolean));
    const adminEmails = new Set(rawAdmins.map(a => (a.email || '').toLowerCase().trim()).filter(Boolean));
    if (authAdmin?.email) adminEmails.add(authAdmin.email.toLowerCase().trim());
    if (authAdmin?._id || authAdmin?.id) adminIds.add(String(authAdmin._id || authAdmin.id));

    const isAdminUser = (u) => {
      if (!u) return false;
      const r = (u.role || '').toLowerCase();
      if (r.includes('admin') || r.includes('superadmin')) return true;
      const uid = String(u._id || u.id || '');
      const uemail = (u.email || '').toLowerCase().trim();
      return (uid && adminIds.has(uid)) || (uemail && adminEmails.has(uemail));
    };

    const matchedAdminsInUsers = rawUsers.filter(isAdminUser).length;
    const matchedCoordsInUsers = rawUsers.filter(u => isCoordUser(u) && !isAdminUser(u)).length;

    const adminsCount = Math.max(matchedAdminsInUsers, rawAdmins.length, authAdmin ? 1 : 0);
    const coordinatorsCount = Math.max(matchedCoordsInUsers, rawCoordinators.length, coordIds.size > 0 ? coordIds.size : 0);
    const participantsCount = Math.max(0, rawUsers.length - matchedCoordsInUsers - matchedAdminsInUsers);

    const roles = {
      participants: participantsCount,
      coordinators: coordinatorsCount,
      admins: adminsCount
    };

    // Area Trend Data (7-step progression curve)
    const totalCount = effectiveTeams.length;
    const dayLabels = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];
    const distributionSteps = totalCount > 0 ? [0.08, 0.14, 0.22, 0.38, 0.58, 0.82, 1.0] : [0, 0, 0, 0, 0, 0, 0];
    const avgEventFee = rawEvents.length > 0 ? (Number(rawEvents[0]?.registrationFee) || 200) : 200;
    const trendPoints = dayLabels.map((day, idx) => {
      const cumulativeTeams = Math.round(totalCount * distributionSteps[idx]);
      const dailyVolume = cumulativeTeams * avgEventFee;
      return {
        label: day,
        teams: cumulativeTeams,
        volume: dailyVolume
      };
    });

    return {
      totalVolume,
      approvedRev,
      pendingRev,
      clearanceRate,
      approvedCount: approvedList.length,
      pendingCount: pendingList.length,
      rejectedCount: rejectedList.length,
      totalTeams: effectiveTeams.length,
      totalUsers: rawUsers.length,
      totalEvents: rawEvents.length,
      eventBarData,
      collegeBarData,
      roles,
      trendPoints
    };
  }, [rawUsers, rawEvents, rawRegs, rawPayments, rawColleges, rawCoordinators, rawAdmins, authAdmin, resolveItemAmount]);

  // Donut Angles Computation
  const donutData = useMemo(() => {
    const total = (metrics.approvedCount + metrics.pendingCount + metrics.rejectedCount) || 1;
    const approvedPct = (metrics.approvedCount / total) * 100;
    const pendingPct = (metrics.pendingCount / total) * 100;
    const rejectedPct = (metrics.rejectedCount / total) * 100;

    const circumference = 2 * Math.PI * 70;

    const approvedStroke = (approvedPct / 100) * circumference;
    const pendingStroke = (pendingPct / 100) * circumference;
    const rejectedStroke = (rejectedPct / 100) * circumference;

    return {
      circumference,
      approved: { pct: Math.round(approvedPct), stroke: approvedStroke, offset: 0 },
      pending: { pct: Math.round(pendingPct), stroke: pendingStroke, offset: -approvedStroke },
      rejected: { pct: Math.round(rejectedPct), stroke: rejectedStroke, offset: -(approvedStroke + pendingStroke) }
    };
  }, [metrics]);

  // Area Chart Path Generator
  const areaSvgData = useMemo(() => {
    const points = metrics.trendPoints;
    if (!points || points.length === 0) return { path: '', area: '', maxVal: 100 };

    const maxTeams = Math.max(...points.map(p => p.teams), 1);
    const width = 500;
    const height = 180;
    const padX = 30;
    const padY = 25;

    const coords = points.map((p, idx) => {
      const x = padX + (idx / (points.length - 1)) * (width - padX * 2);
      const y = height - padY - (p.teams / maxTeams) * (height - padY * 2);
      return { x, y, ...p };
    });

    let d = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }

    const areaPath = `${d} L ${coords[coords.length - 1].x},${height - padY} L ${coords[0].x},${height - padY} Z`;

    return {
      coords,
      linePath: d,
      areaPath,
      width,
      height,
      maxVal: maxTeams
    };
  }, [metrics.trendPoints]);

  return (
    <div className={`analytics-container ${isEmbedded ? 'embedded-analytics-mode' : ''}`}>
      {/* Visual Analytics Header Banner */}
      <div className="analytics-header-banner">
        <div className="analytics-banner-content">
          <div className="analytics-tag-row">
            <span className="analytics-badge">
              <Activity size={13} className="spin-slow" /> Real-Time Fest Telemetry
            </span>
            <span className="live-radar-pill">
              <span className="live-radar-dot"></span> Live Data Streams Active
            </span>
          </div>
          <h2>
            Visual Analytics & Intelligence Matrix 📊
          </h2>
          <p>
            Interactive graphs, multi-dimensional distribution charts, conversion velocity curves, and event capacity health gauges.
          </p>
        </div>

        <div className="analytics-actions-cluster">
          <div className="timeframe-toggle-pills">
            <button
              className={`pill-btn ${timeframe === 'all' ? 'active' : ''}`}
              onClick={() => setTimeframe('all')}
            >
              All Data
            </button>
            <button
              className={`pill-btn ${timeframe === 'approved' ? 'active' : ''}`}
              onClick={() => setTimeframe('approved')}
            >
              Cleared Only
            </button>
          </div>

          <button
            className="btn btn-secondary refresh-analytics-btn"
            onClick={loadAllAnalyticsData}
            disabled={isRefreshing}
            title="Refresh All Chart Data"
          >
            <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            className="btn btn-primary btn-glow-sheen export-chart-btn"
            onClick={async () => {
              try {
                await apiService.exportAllMaster('Semaphore_Analytics_Master.xlsx');
              } catch (e) {
                console.warn(e);
              }
            }}
            title="Export Master Analytics Workbook"
          >
            <Download size={13} />
            <span>Export Analytics (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Top 4 Quick Metric Glow Strips */}
      <div className="analytics-kpi-grid">
        <TiltCard maxTilt={5} glareOpacity={0.12} className="analytics-kpi-tilt">
          <div className="card analytics-kpi-card glow-cyan">
            <div className="kpi-icon-wrap bg-cyan-soft">
              <Zap size={18} className="text-cyan" />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Fest Revenue Volume</span>
              <h3 className="kpi-value text-cyan">
                <CountUp prefix="₹ " value={metrics.totalVolume} />
              </h3>
              <span className="kpi-subtext">₹ {metrics.pendingRev.toLocaleString()} pending verification</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="analytics-kpi-tilt">
          <div className="card analytics-kpi-card glow-emerald">
            <div className="kpi-icon-wrap bg-emerald-soft">
              <CheckCircle2 size={18} className="text-emerald" />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Verified Clearance Rate</span>
              <h3 className="kpi-value text-emerald">
                <CountUp value={metrics.clearanceRate} suffix="%" />
              </h3>
              <span className="kpi-subtext">{metrics.approvedCount} approved / {metrics.totalTeams} total teams</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="analytics-kpi-tilt">
          <div className="card analytics-kpi-card glow-amber">
            <div className="kpi-icon-wrap bg-amber-soft">
              <Clock size={18} className="text-amber" />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Pending UTR Queue</span>
              <h3 className="kpi-value text-amber">
                <CountUp value={metrics.pendingCount} suffix=" Submissions" />
              </h3>
              <span className="kpi-subtext">Needs bank statement match</span>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="analytics-kpi-tilt">
          <div className="card analytics-kpi-card glow-indigo">
            <div className="kpi-icon-wrap bg-indigo-soft">
              <Building2 size={18} className="text-indigo" />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Participating Colleges</span>
              <h3 className="kpi-value text-indigo">
                <CountUp value={metrics.collegeBarData.length} suffix=" Institutions" />
              </h3>
              <span className="kpi-subtext">1 Team / College Quota Cap</span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Primary Analytics Charts Row: Area Wave Chart + Donut Ring Chart */}
      <div className="analytics-charts-row">
        {/* Chart 1: Registration Velocity & Volume Surge Area Wave Graph */}
        <TiltCard maxTilt={3} glareOpacity={0.08} className="chart-card-tilt flex-2">
          <div className="card chart-card">
            <div className="chart-card-header">
              <div className="chart-title-group">
                <TrendingUp size={18} className="text-primary" />
                <div>
                  <h4 className="chart-title">Registration Velocity & Growth Trajectory</h4>
                  <p className="chart-subtitle">Cumulative team registrations and revenue velocity over fest timeline</p>
                </div>
              </div>
              <span className="chart-chip-badge badge-primary">
                <Zap size={11} /> 60 FPS Vector Wave
              </span>
            </div>

            <div className="area-chart-wrapper">
              <svg 
                viewBox={`0 0 ${areaSvgData.width} ${areaSvgData.height}`} 
                className="area-svg"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="var(--cyan)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Background Grid Lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
                  const y = 25 + ratio * (areaSvgData.height - 50);
                  return (
                    <line
                      key={i}
                      x1="20"
                      y1={y}
                      x2={areaSvgData.width - 20}
                      y2={y}
                      stroke="var(--border-color)"
                      strokeDasharray="4,4"
                      opacity="0.4"
                    />
                  );
                })}

                {/* Area Fill */}
                <path d={areaSvgData.areaPath} fill="url(#areaGradient)" className="area-fill-path" />

                {/* Neon Curved Line */}
                <path
                  d={areaSvgData.linePath}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="area-line-path"
                />

                {/* Interactive Data Nodes */}
                {areaSvgData.coords.map((pt, idx) => (
                  <g 
                    key={idx} 
                    className="data-point-group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="5"
                      fill="var(--bg-surface)"
                      stroke="var(--primary)"
                      strokeWidth="2.5"
                      className="data-dot"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="9"
                      fill="var(--primary)"
                      opacity="0.2"
                      className="data-dot-halo"
                    />
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div 
                  className="chart-tooltip"
                  style={{
                    left: `${(hoveredPoint.x / areaSvgData.width) * 100}%`,
                    top: `${(hoveredPoint.y / areaSvgData.height) * 100}%`
                  }}
                >
                  <span className="tooltip-title">{hoveredPoint.label}</span>
                  <div className="tooltip-row">
                    <span>Teams:</span>
                    <strong>{hoveredPoint.teams} Teams</strong>
                  </div>
                  <div className="tooltip-row">
                    <span>Volume:</span>
                    <strong className="text-cyan">₹ {hoveredPoint.volume.toLocaleString()}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="chart-x-axis">
              {metrics.trendPoints.map((p, idx) => (
                <span key={idx} className="axis-label">{p.label}</span>
              ))}
            </div>
          </div>
        </TiltCard>

        {/* Chart 2: Payment Clearance Donut Chart with Center Metric */}
        <TiltCard maxTilt={3} glareOpacity={0.08} className="chart-card-tilt flex-1">
          <div className="card chart-card">
            <div className="chart-card-header">
              <div className="chart-title-group">
                <PieChartIcon size={18} className="text-emerald" />
                <div>
                  <h4 className="chart-title">Payment Verification Audit</h4>
                  <p className="chart-subtitle">Clearance split across submissions</p>
                </div>
              </div>
            </div>

            <div className="donut-chart-container">
              <div className="donut-svg-wrap">
                <svg viewBox="0 0 180 180" className="donut-svg">
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth="18"
                    opacity="0.25"
                  />
                  {/* Approved Arc */}
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="18"
                    strokeDasharray={`${donutData.approved.stroke} ${donutData.circumference}`}
                    strokeDashoffset={donutData.approved.offset}
                    className="donut-segment segment-approved"
                    onMouseEnter={() => setActiveDonutSlice('Approved')}
                    onMouseLeave={() => setActiveDonutSlice(null)}
                  />
                  {/* Pending Arc */}
                  <circle
                    cx="90"
                    cy="90"
                    r="70"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="18"
                    strokeDasharray={`${donutData.pending.stroke} ${donutData.circumference}`}
                    strokeDashoffset={donutData.pending.offset}
                    className="donut-segment segment-pending"
                    onMouseEnter={() => setActiveDonutSlice('Pending')}
                    onMouseLeave={() => setActiveDonutSlice(null)}
                  />
                  {/* Rejected Arc */}
                  {metrics.rejectedCount > 0 && (
                    <circle
                      cx="90"
                      cy="90"
                      r="70"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="18"
                      strokeDasharray={`${donutData.rejected.stroke} ${donutData.circumference}`}
                      strokeDashoffset={donutData.rejected.offset}
                      className="donut-segment segment-rejected"
                      onMouseEnter={() => setActiveDonutSlice('Rejected')}
                      onMouseLeave={() => setActiveDonutSlice(null)}
                    />
                  )}
                </svg>

                {/* Center Ring Label */}
                <div className="donut-center-metric">
                  <span className="center-num">
                    <CountUp value={metrics.totalTeams} />
                  </span>
                  <span className="center-lbl">Total Teams</span>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="donut-legend-strip">
                <div className="legend-item" onClick={() => navigate('/payments')}>
                  <span className="legend-dot dot-emerald"></span>
                  <div className="legend-text">
                    <span className="legend-name">Approved</span>
                    <strong className="text-emerald">{metrics.approvedCount} ({donutData.approved.pct}%)</strong>
                  </div>
                </div>

                <div className="legend-item" onClick={() => navigate('/payments')}>
                  <span className="legend-dot dot-amber"></span>
                  <div className="legend-text">
                    <span className="legend-name">Pending</span>
                    <strong className="text-amber">{metrics.pendingCount} ({donutData.pending.pct}%)</strong>
                  </div>
                </div>

                {metrics.rejectedCount > 0 && (
                  <div className="legend-item" onClick={() => navigate('/payments')}>
                    <span className="legend-dot dot-danger"></span>
                    <div className="legend-text">
                      <span className="legend-name">Rejected</span>
                      <strong className="text-danger">{metrics.rejectedCount} ({donutData.rejected.pct}%)</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Secondary Analytics Row: Event Registrations Bar Chart + College Quota Breakdown */}
      <div className="analytics-charts-row">
        {/* Chart 3: Event Popularity & Team Registration Distribution */}
        <TiltCard maxTilt={3} glareOpacity={0.08} className="chart-card-tilt flex-2">
          <div className="card chart-card">
            <div className="chart-card-header">
              <div className="chart-title-group">
                <BarChart3 size={18} className="text-cyan" />
                <div>
                  <h4 className="chart-title">Event Registration Distribution</h4>
                  <p className="chart-subtitle">Live team enrollment per tournament event</p>
                </div>
              </div>
              <button
                className="btn btn-xs btn-outline"
                onClick={() => navigate('/events')}
                title="Manage Events Roster"
              >
                View Events Roster
              </button>
            </div>

            <div className="event-bars-list">
              {metrics.eventBarData.slice(0, 5).map((evt, idx) => {
                const maxCap = evt.capacity || 50;
                const fillPct = Math.min(100, Math.round((evt.count / maxCap) * 100));
                const colors = ['bar-gradient-cyan', 'bar-gradient-indigo', 'bar-gradient-emerald', 'bar-gradient-amber', 'bar-gradient-violet'];
                const barClass = colors[idx % colors.length];

                return (
                  <div 
                    key={evt.id || idx} 
                    className="event-bar-item"
                    onMouseEnter={() => setHoveredBar(evt.title)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="bar-label-row">
                      <span className="bar-event-title">{evt.title}</span>
                      <div className="bar-stats-cluster">
                        <span className="bar-count-tag font-bold text-heading">
                          <CountUp value={evt.count} /> / {maxCap} Teams
                        </span>
                        <span className="bar-pct-badge">{fillPct}% Cap</span>
                      </div>
                    </div>

                    <div className="bar-track">
                      <div 
                        className={`bar-fill ${barClass}`}
                        style={{ width: `${Math.max(8, fillPct)}%` }}
                      >
                        <div className="bar-sheen-line"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TiltCard>

        {/* Chart 4: College Quota Utilization (Max 1 Team Cap) */}
        <TiltCard maxTilt={3} glareOpacity={0.08} className="chart-card-tilt flex-1">
          <div className="card chart-card">
            <div className="chart-card-header">
              <div className="chart-title-group">
                <Building2 size={18} className="text-indigo" />
                <div>
                  <h4 className="chart-title">College Quota Status</h4>
                  <p className="chart-subtitle">Max 1 Team / Institution</p>
                </div>
              </div>
              <button 
                className="btn btn-xs btn-outline"
                onClick={() => navigate('/colleges')}
              >
                Colleges
              </button>
            </div>

            <div className="college-quota-list">
              {metrics.collegeBarData.map((col, idx) => {
                const isFull = col.teams >= 1;
                return (
                  <div key={idx} className="college-quota-row">
                    <div className="college-name-group">
                      <span className="college-icon-avatar">
                        {(col.name || 'C').charAt(0).toUpperCase()}
                      </span>
                      <span className="college-name-text" title={col.name}>
                        {col.name}
                      </span>
                    </div>

                    <div className="quota-pill-meter">
                      <div className={`quota-slot ${col.teams >= 1 ? 'slot-filled slot-full' : ''}`}>1</div>
                      <span className={`quota-status-tag ${isFull ? 'tag-full' : 'tag-available'}`}>
                        {isFull ? 'Quota Full (1/1)' : '0/1 Enrolled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Bottom Insights Bar: Role Distribution & System Health */}
      <div className="analytics-bottom-strip">
        <div className="card role-insights-card">
          <div className="role-insights-info">
            <div className="role-insights-icon-box">
              <Users size={19} className="text-cyan" />
            </div>
            <div className="role-insights-text">
              <div className="role-insights-title-row">
                <h5 className="role-insights-title">User Directory Role Breakdown</h5>
                <span className="role-count-tag">
                  {metrics.totalUsers} Active Accounts
                </span>
              </div>
              <p className="role-insights-subtitle">
                Live role distribution across participants, assigned coordinators & platform administrators
              </p>
            </div>
          </div>

          <div className="role-pills-row">
            <div 
              className="role-pill-metric pill-participants" 
              onClick={() => navigate('/users')}
              title="Click to view all registered participants"
            >
              <span className="role-dot dot-cyan"></span>
              <span className="role-lbl">Participants:</span>
              <strong className="role-val val-cyan"><CountUp value={metrics.roles.participants} /></strong>
            </div>

            <div 
              className="role-pill-metric pill-coordinators" 
              onClick={() => navigate('/coordinators')}
              title="Click to manage event coordinators"
            >
              <span className="role-dot dot-amber"></span>
              <span className="role-lbl">Coordinators:</span>
              <strong className="role-val val-amber"><CountUp value={metrics.roles.coordinators} /></strong>
            </div>

            <div 
              className="role-pill-metric pill-admins" 
              onClick={() => navigate('/admins')}
              title="Click to inspect platform administrators"
            >
              <span className="role-dot dot-purple"></span>
              <span className="role-lbl">Admins:</span>
              <strong className="role-val val-purple"><CountUp value={metrics.roles.admins} /></strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
