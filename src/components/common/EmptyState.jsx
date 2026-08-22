import { 
  Plus, 
  RotateCcw 
} from 'lucide-react';
import {
  AnimatedCyberShield,
  AnimatedPaymentSuccess,
  AnimatedEventTrophy,
  AnimatedLiveRadar,
  AnimatedCloudSync
} from './AnimatedSvg';
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
      case 'registrations':
        return <AnimatedCloudSync size={compact ? 70 : 100} />;

      case 'payments':
        return <AnimatedPaymentSuccess size={compact ? 70 : 100} />;

      case 'events':
        return <AnimatedEventTrophy size={compact ? 70 : 100} />;

      case 'colleges':
      case 'users':
        return <AnimatedCyberShield size={compact ? 70 : 100} />;

      case 'search':
      default:
        return <AnimatedLiveRadar size={compact ? 70 : 100} />;
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
