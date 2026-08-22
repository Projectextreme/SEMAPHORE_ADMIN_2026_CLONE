import { 
  Search, 
  FileSpreadsheet, 
  CreditCard, 
  Calendar, 
  Building2, 
  Users, 
  Sparkles, 
  Plus, 
  RotateCcw 
} from 'lucide-react';
import './EmptyState.css';

export const EmptyState = ({
  type = 'search',
  title = 'No records found',
  description = 'Try adjusting your search criteria or filter settings to find what you are looking for.',
  primaryAction = null,
  secondaryAction = null,
  compact = false
}) => {
  const renderIllustration = () => {
    switch (type) {
      case 'search':
        return (
          <div className="empty-graphic-wrapper graphic-search">
            <div className="empty-halo glow-cyan"></div>
            <svg className="empty-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="svg-orbit" />
              <circle cx="80" cy="80" r="50" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeWidth="1.5" className="svg-inner-ring" />
              <circle cx="70" cy="70" r="26" stroke="var(--primary)" strokeWidth="3" fill="var(--bg-card)" />
              <line x1="89" y1="89" x2="114" y2="114" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
              <circle cx="70" cy="70" r="14" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="45" cy="50" r="2.5" fill="var(--cyan)" className="svg-particle p1" />
              <circle cx="115" cy="55" r="3.5" fill="var(--primary)" className="svg-particle p2" />
              <circle cx="60" cy="115" r="2.5" fill="var(--success)" className="svg-particle p3" />
            </svg>
            <div className="empty-center-icon">
              <Search size={22} className="icon-main" />
            </div>
          </div>
        );

      case 'registrations':
        return (
          <div className="empty-graphic-wrapper graphic-registrations">
            <div className="empty-halo glow-indigo"></div>
            <svg className="empty-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 4" className="svg-orbit" />
              <rect x="42" y="36" width="76" height="88" rx="12" fill="currentColor" fillOpacity="0.04" stroke="var(--primary)" strokeWidth="2" />
              <line x1="56" y1="56" x2="104" y2="56" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="56" y1="72" x2="96" y2="72" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" />
              <line x1="56" y1="88" x2="88" y2="88" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" />
              <circle cx="118" cy="118" r="18" fill="var(--bg-card)" stroke="var(--cyan)" strokeWidth="2" />
              <circle cx="118" cy="118" r="7" fill="var(--cyan)" />
            </svg>
            <div className="empty-center-icon">
              <FileSpreadsheet size={24} className="icon-main text-primary" />
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="empty-graphic-wrapper graphic-payments">
            <div className="empty-halo glow-emerald"></div>
            <svg className="empty-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" className="svg-orbit" />
              <rect x="35" y="45" width="90" height="64" rx="10" fill="currentColor" fillOpacity="0.05" stroke="var(--success)" strokeWidth="2" />
              <line x1="35" y1="62" x2="125" y2="62" stroke="var(--success)" strokeWidth="3" />
              <rect x="46" y="80" width="22" height="14" rx="3" fill="var(--warning)" fillOpacity="0.6" />
              <circle cx="110" cy="87" r="6" stroke="var(--cyan)" strokeWidth="2" />
            </svg>
            <div className="empty-center-icon">
              <CreditCard size={24} className="icon-main text-success" />
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="empty-graphic-wrapper graphic-events">
            <div className="empty-halo glow-violet"></div>
            <svg className="empty-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" className="svg-orbit" />
              <rect x="40" y="42" width="80" height="76" rx="12" fill="currentColor" fillOpacity="0.05" stroke="var(--purple)" strokeWidth="2" />
              <line x1="40" y1="62" x2="120" y2="62" stroke="var(--purple)" strokeWidth="2" />
              <line x1="58" y1="34" x2="58" y2="44" stroke="var(--purple)" strokeWidth="3" strokeLinecap="round" />
              <line x1="102" y1="34" x2="102" y2="44" stroke="var(--purple)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="64" cy="80" r="4" fill="var(--primary)" />
              <circle cx="80" cy="80" r="4" fill="var(--cyan)" />
              <circle cx="96" cy="80" r="4" fill="var(--success)" />
              <circle cx="64" cy="96" r="4" fill="var(--warning)" />
              <circle cx="80" cy="96" r="4" fill="var(--primary)" />
            </svg>
            <div className="empty-center-icon">
              <Calendar size={24} className="icon-main text-purple" />
            </div>
          </div>
        );

      case 'colleges':
        return (
          <div className="empty-graphic-wrapper graphic-colleges">
            <div className="empty-halo glow-amber"></div>
            <svg className="empty-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" className="svg-orbit" />
              <path d="M80 38L124 58V66H36V58L80 38Z" fill="currentColor" fillOpacity="0.08" stroke="var(--warning)" strokeWidth="2" />
              <rect x="46" y="66" width="12" height="42" fill="currentColor" fillOpacity="0.05" stroke="var(--warning)" strokeWidth="1.5" />
              <rect x="74" y="66" width="12" height="42" fill="currentColor" fillOpacity="0.05" stroke="var(--warning)" strokeWidth="1.5" />
              <rect x="102" y="66" width="12" height="42" fill="currentColor" fillOpacity="0.05" stroke="var(--warning)" strokeWidth="1.5" />
              <rect x="32" y="108" width="96" height="10" rx="3" fill="var(--warning)" fillOpacity="0.3" stroke="var(--warning)" strokeWidth="1.5" />
            </svg>
            <div className="empty-center-icon">
              <Building2 size={24} className="icon-main text-warning" />
            </div>
          </div>
        );

      case 'users':
      default:
        return (
          <div className="empty-graphic-wrapper graphic-users">
            <div className="empty-halo glow-cyan"></div>
            <svg className="empty-svg" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="80" r="68" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="svg-orbit" />
              <circle cx="80" cy="62" r="20" fill="currentColor" fillOpacity="0.06" stroke="var(--cyan)" strokeWidth="2" />
              <path d="M48 116C48 98 62 88 80 88C98 88 112 98 112 116" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <div className="empty-center-icon">
              <Users size={24} className="icon-main text-cyan" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`empty-state-card ${compact ? 'empty-compact' : ''}`}>
      {renderIllustration()}
      <div className="empty-text-wrap">
        <h3 className="empty-title">{title}</h3>
        <p className="empty-description">{description}</p>
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="empty-actions-row">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="btn btn-primary empty-btn"
              disabled={primaryAction.loading}
            >
              {primaryAction.icon || <Plus size={15} />}
              <span>{primaryAction.label}</span>
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="btn btn-secondary empty-btn"
              disabled={secondaryAction.loading}
            >
              {secondaryAction.icon || <RotateCcw size={14} />}
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
