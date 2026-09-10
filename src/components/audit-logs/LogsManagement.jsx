import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/apiService';
import { 
  Terminal, 
  RefreshCw, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Database,
  Eye,
  Info,
  Layers
} from 'lucide-react';
import './LogsManagement.css';

export const LogsManagement = () => {
  const { showSuccess, showError } = useToast();
  const PAGE_SIZE_OPTIONS = [10, 50, 100, 200, 500];
  const [pageSize, setPageSize] = useState(50);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    limit: 50,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Fetch logs function (isLoadMore flag determines if appending or resetting)
  const fetchLogs = useCallback(async (pageNumber = 1, isLoadMore = false, customLimit = null) => {
    const limitToUse = customLimit != null ? customLimit : pageSize;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiService.getAdminLogs(pageNumber, limitToUse);
      
      const newLogs = response.logs || [];
      const newPagination = response.pagination || {
        currentPage: pageNumber,
        totalPages: 1,
        totalLogs: newLogs.length,
        limit: limitToUse,
        hasNextPage: false,
        hasPrevPage: false
      };

      if (isLoadMore) {
        setLogs(prevLogs => {
          // Avoid duplicates by _id
          const existingIds = new Set(prevLogs.map(l => l._id));
          const filteredNew = newLogs.filter(l => !existingIds.has(l._id));
          return [...prevLogs, ...filteredNew];
        });
      } else {
        setLogs(newLogs);
      }

      setPagination(newPagination);
    } catch (err) {
      showError(err.message || 'Failed to load transaction logs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize, showError]);

  // Initial load
  useEffect(() => {
    fetchLogs(1, false, pageSize);
  }, [fetchLogs, pageSize]);

  // Auto-refresh timer (every 30 seconds if enabled)
  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLogs(1, false, pageSize);
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchLogs, pageSize]);

  // Handle Page Size change
  const handlePageSizeChange = (newSize) => {
    const sizeNum = Number(newSize);
    if (sizeNum === pageSize) return;
    setPageSize(sizeNum);
    fetchLogs(1, false, sizeNum);
  };

  // Handle Load More button click
  const handleLoadMore = () => {
    if (pagination.hasNextPage && !loadingMore) {
      const nextPage = (pagination.currentPage || 1) + 1;
      fetchLogs(nextPage, true, pageSize);
    }
  };

  // Toggle log details expanded state
  const toggleExpand = (logId) => {
    setExpandedLogId(prev => (prev === logId ? null : logId));
  };

  // Copy JSON content to clipboard
  const handleCopyJSON = (data, id) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedId(id);
      showSuccess('Log payload copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showError('Failed to copy to clipboard');
    }
  };

  // Filter logs locally based on search term & drop-downs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Method filter
      if (selectedMethod !== 'ALL' && log.method !== selectedMethod) {
        return false;
      }

      // Type filter
      if (selectedType !== 'ALL') {
        const typeStr = (log.type || '').toUpperCase();
        if (!typeStr.includes(selectedType)) return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        const status = Number(log.statusCode || 0);
        if (selectedStatus === '2XX' && (status < 200 || status >= 300)) return false;
        if (selectedStatus === '4XX' && (status < 400 || status >= 500)) return false;
        if (selectedStatus === '5XX' && status < 500) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const urlMatch = (log.url || '').toLowerCase().includes(term);
        const methodMatch = (log.method || '').toLowerCase().includes(term);
        const typeMatch = (log.type || '').toLowerCase().includes(term);
        const statusMatch = String(log.statusCode || '').includes(term);
        const userEmailMatch = (log.user?.email || '').toLowerCase().includes(term);
        const userNameMatch = (log.user?.name || '').toLowerCase().includes(term);
        const idMatch = (log._id || '').toLowerCase().includes(term);

        return urlMatch || methodMatch || typeMatch || statusMatch || userEmailMatch || userNameMatch || idMatch;
      }

      return true;
    });
  }, [logs, selectedMethod, selectedType, selectedStatus, searchTerm]);

  // Status code styling badge helper
  const getStatusBadgeClass = (statusCode) => {
    const code = Number(statusCode);
    if (code >= 200 && code < 300) return 'status-2xx';
    if (code >= 300 && code < 400) return 'status-3xx';
    if (code >= 400 && code < 500) return 'status-4xx';
    if (code >= 500) return 'status-5xx';
    return 'status-default';
  };

  // Method badge styling helper
  const getMethodBadgeClass = (method) => {
    switch ((method || '').toUpperCase()) {
      case 'GET': return 'method-get';
      case 'POST': return 'method-post';
      case 'PUT': return 'method-put';
      case 'DELETE': return 'method-delete';
      case 'PATCH': return 'method-patch';
      default: return 'method-default';
    }
  };

  return (
    <div className="logs-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Terminal className="title-icon text-cyan" /> System & Audit Logs
          </h2>
          <p className="page-description">
            Real-time audit stream of server requests, transactions, and security activity. Read-only access for all admins.
          </p>
        </div>

        <div className="header-button-group">
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)} 
            className={`btn ${autoRefresh ? 'btn-success-glow' : 'btn-secondary'}`}
            title={autoRefresh ? 'Auto-refresh active (30s)' : 'Enable auto-refresh'}
          >
            <Clock size={14} className={autoRefresh ? 'spin-icon' : ''} />
            {autoRefresh ? 'Live Syncing' : 'Auto Refresh'}
          </button>
          <button 
            onClick={() => fetchLogs(1, false)} 
            className="btn btn-secondary" 
            disabled={loading}
            title="Refresh Latest Logs"
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Top Stats Banner - Compact view */}
      <div className="logs-stats-grid">
        <div className="stat-card-compact">
          <div className="stat-icon-wrapper cyan">
            <Database size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total System Logs</span>
            <strong className="stat-value">{pagination.totalLogs || logs.length}</strong>
          </div>
        </div>

        <div className="stat-card-compact">
          <div className="stat-icon-wrapper indigo">
            <Layers size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Loaded In Stream</span>
            <strong className="stat-value">{logs.length} <span className="stat-sub">({pagination.currentPage} / {pagination.totalPages || 1} Pgs)</span></strong>
          </div>
        </div>

        <div className="stat-card-compact">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Status Stream</span>
            <strong className="stat-value text-success">
              {logs.filter(l => (l.statusCode || 200) < 400).length} OK
            </strong>
          </div>
        </div>

        <div className="stat-card-compact">
          <div className="stat-icon-wrapper rose">
            <AlertTriangle size={16} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Errors / Warnings</span>
            <strong className="stat-value text-danger">
              {logs.filter(l => (l.statusCode || 200) >= 400).length} Errors
            </strong>
          </div>
        </div>
      </div>

      {/* Compact Controls & Filter Toolbar */}
      <div className="logs-toolbar-card">
        <div className="search-box-wrapper">
          <Search size={15} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by URL, user email, status, log type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="logs-search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>✕</button>
          )}
        </div>

        <div className="filter-group">
          {/* Method Filter */}
          <select 
            value={selectedMethod} 
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="logs-filter-select"
          >
            <option value="ALL">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          {/* Type Filter */}
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="logs-filter-select"
          >
            <option value="ALL">All Types</option>
            <option value="TRANSACTION">Transaction Logs</option>
            <option value="SUCCESS">Success Logs</option>
            <option value="ERROR">Error Logs</option>
          </select>

          {/* Status Filter */}
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="logs-filter-select"
          >
            <option value="ALL">All Statuses</option>
            <option value="2XX">2xx (Success)</option>
            <option value="4XX">4xx (Client Errors)</option>
            <option value="5XX">5xx (Server Errors)</option>
          </select>

          {/* Page Size / Limit Filter */}
          <select 
            value={pageSize} 
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="logs-filter-select logs-limit-select"
            title="Logs per page limit"
          >
            <option value={10}>10 Logs / Page</option>
            <option value={50}>50 Logs / Page (Default)</option>
            <option value={100}>100 Logs / Page</option>
            <option value={200}>200 Logs / Page</option>
            <option value={500}>500 Logs / Page</option>
          </select>
        </div>
      </div>

      {/* Main Logs Table Container - Small/Compact Area */}
      <div className="logs-console-card">
        <div className="console-header">
          <div className="console-title">
            <Terminal size={14} className="text-cyan" />
            <span>Server Audit Output Stream ({pageSize} Logs / Page)</span>
            <span className="badge badge-info-subtle">Read-Only</span>
          </div>
          <div className="console-info-actions">
            {/* Quick Limit Pills */}
            <div className="page-size-pill-group">
              <span className="page-size-label">Limit:</span>
              {PAGE_SIZE_OPTIONS.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`btn-page-size-pill ${pageSize === sz ? 'active' : ''}`}
                  onClick={() => handlePageSizeChange(sz)}
                  title={`Show ${sz} logs per request`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <span className="console-info-text">
              Showing {filteredLogs.length} of {logs.length} loaded records
            </span>
            <button 
              onClick={() => fetchLogs(1, false, pageSize)} 
              className="btn btn-secondary btn-sm"
              disabled={loading}
              title="Refresh Stream (Page 1)"
            >
              <RefreshCw size={13} className={loading ? 'spin-icon' : ''} /> Refresh Stream
            </button>
          </div>
        </div>

        <div className="logs-scroll-viewport">
          {loading && logs.length === 0 ? (
            <div className="logs-loading-skeleton">
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
              <div className="skeleton-row" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="logs-empty-state">
              <Info size={32} className="text-dim" />
              <h4>No logs match your filter criteria</h4>
              <p>Try clearing filters or search keywords to view system logs.</p>
              {(searchTerm || selectedMethod !== 'ALL' || selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedMethod('ALL');
                    setSelectedType('ALL');
                    setSelectedStatus('ALL');
                  }} 
                  className="btn btn-secondary btn-sm"
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="logs-list-table">
              <div className="table-row table-head">
                <div className="col-expand"></div>
                <div className="col-time">Time</div>
                <div className="col-method">Method</div>
                <div className="col-status">Status</div>
                <div className="col-type">Type</div>
                <div className="col-url">Endpoint URL</div>
                <div className="col-user">User / Identity</div>
                <div className="col-duration">Duration</div>
              </div>

              {filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log._id;
                const isError = (log.statusCode || 200) >= 400 || (log.type || '').includes('ERROR');

                return (
                  <div key={log._id || log.createdAt} className={`log-entry-row ${isExpanded ? 'is-expanded' : ''} ${isError ? 'has-error' : ''}`}>
                    <div className="table-row" onClick={() => toggleExpand(log._id)}>
                      <div className="col-expand">
                        {isExpanded ? <ChevronDown size={14} className="text-cyan" /> : <ChevronRight size={14} className="text-dim" />}
                      </div>

                      <div className="col-time" title={log.createdAt}>
                        {log.formattedTime || new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>

                      <div className="col-method">
                        <span className={`method-badge ${getMethodBadgeClass(log.method)}`}>
                          {log.method || 'GET'}
                        </span>
                      </div>

                      <div className="col-status">
                        <span className={`status-pill ${getStatusBadgeClass(log.statusCode)}`}>
                          {log.statusCode || 200}
                        </span>
                      </div>

                      <div className="col-type">
                        <span className={`log-type-tag ${isError ? 'tag-error' : 'tag-success'}`}>
                          {log.type || 'LOG'}
                        </span>
                      </div>

                      <div className="col-url code-font" title={log.url}>
                        {log.url}
                      </div>

                      <div className="col-user">
                        {log.user ? (
                          <span className="user-pill" title={`${log.user.name || ''} (${log.user.email || ''})`}>
                            <User size={11} /> {log.user.name || log.user.email || log.user.id}
                          </span>
                        ) : (
                          <span className="guest-pill">Guest</span>
                        )}
                      </div>

                      <div className="col-duration">
                        {log.duration != null ? `${log.duration}ms` : '-'}
                      </div>
                    </div>

                    {/* Expandable Log Details JSON Viewer */}
                    {isExpanded && (
                      <div className="log-details-drawer">
                        <div className="drawer-header">
                          <div className="drawer-title">
                            <Eye size={13} className="text-cyan" /> Log Payload Inspector & Metadata
                          </div>
                          <div className="drawer-actions">
                            <button 
                              className="btn-copy-json"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyJSON(log, log._id);
                              }}
                              title="Copy JSON to clipboard"
                            >
                              {copiedId === log._id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                              <span>{copiedId === log._id ? 'Copied!' : 'Copy JSON'}</span>
                            </button>
                          </div>
                        </div>

                        <div className="drawer-grid">
                          {/* Metadata block */}
                          <div className="drawer-section">
                            <h5 className="section-subtitle">Request Overview</h5>
                            <div className="meta-pairs">
                              <div className="pair"><span className="p-key">Log Record ID:</span> <code className="p-val">{log._id}</code></div>
                              <div className="pair"><span className="p-key">Timestamp:</span> <span className="p-val">{log.createdAt} ({log.formattedTime})</span></div>
                              <div className="pair"><span className="p-key">Full URL:</span> <code className="p-val">{log.url}</code></div>
                              <div className="pair"><span className="p-key">HTTP Status:</span> <span className="p-val">{log.statusCode}</span></div>
                              <div className="pair"><span className="p-key">Latency:</span> <span className="p-val">{log.duration != null ? `${log.duration} ms` : 'N/A'}</span></div>
                              {log.user && (
                                <div className="pair"><span className="p-key">Initiator User:</span> <span className="p-val">{log.user.name} ({log.user.email}) - Role: {log.user.role || 'user'}</span></div>
                              )}
                            </div>
                          </div>

                          {/* Error Details if any */}
                          {log.errorDetails && (
                            <div className="drawer-section error-section">
                              <h5 className="section-subtitle text-danger"><XCircle size={13} /> Exception & Error Details</h5>
                              <pre className="json-code-block text-danger">
                                {typeof log.errorDetails === 'object' ? JSON.stringify(log.errorDetails, null, 2) : String(log.errorDetails)}
                              </pre>
                            </div>
                          )}

                          {/* Request Body block */}
                          {log.requestBody && Object.keys(log.requestBody).length > 0 && (
                            <div className="drawer-section">
                              <h5 className="section-subtitle">Request Body Payload</h5>
                              <pre className="json-code-block">
                                {JSON.stringify(log.requestBody, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Response Data block */}
                          {log.responseData && (
                            <div className="drawer-section">
                              <h5 className="section-subtitle">Response Data</h5>
                              <pre className="json-code-block">
                                {typeof log.responseData === 'object' ? JSON.stringify(log.responseData, null, 2) : String(log.responseData)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* View More Pagination Footer */}
        <div className="console-footer">
          {pagination.hasNextPage ? (
            <button 
              onClick={handleLoadMore} 
              disabled={loadingMore} 
              className="btn btn-primary btn-glow-sheen btn-view-more"
            >
              {loadingMore ? (
                <>
                  <RefreshCw size={14} className="spin-icon" /> Requesting Server Page {(pagination.currentPage || 1) + 1} ({pageSize} logs)...
                </>
              ) : (
                <>
                  <ChevronDown size={15} /> Load Next {pageSize} Logs (Page {(pagination.currentPage || 1) + 1} of {pagination.totalPages || 1})
                </>
              )}
            </button>
          ) : (
            <div className="all-loaded-message">
              <CheckCircle2 size={14} className="text-success" />
              <span>All {pagination.totalLogs || logs.length} logs loaded (Page {pagination.currentPage || 1} of {pagination.totalPages || 1})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
