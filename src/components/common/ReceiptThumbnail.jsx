import { useState } from 'react';
import { Receipt, Eye, Sparkles } from 'lucide-react';
import { resolveImageUrl } from '../../services/apiConfig';
import './ReceiptThumbnail.css';

/**
 * Robust Receipt & Proof Thumbnail component.
 * Gracefully handles relative URLs, broken/dummy image links (e.g. example.com),
 * and network load failures without showing ugly browser broken-image icons.
 */
export const ReceiptThumbnail = ({ 
  src, 
  utr, 
  onClick, 
  alt = 'Receipt Proof',
  compact = false 
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveImageUrl(src);

  // If no source provided or URL is known placeholder dummy that cannot resolve
  const isInvalidOrMissing = !resolvedSrc || hasError;

  return (
    <div 
      className={`receipt-thumb-wrapper ${isInvalidOrMissing ? 'thumb-is-placeholder' : 'thumb-has-image'} ${compact ? 'thumb-compact' : ''}`}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(resolvedSrc || null);
        }
      }}
      title={resolvedSrc ? `Click to inspect receipt (${utr || 'Proof'})` : 'No receipt image uploaded'}
    >
      {!isInvalidOrMissing ? (
        <>
          <img 
            src={resolvedSrc} 
            alt={alt} 
            className="receipt-thumb-image"
            onError={() => setHasError(true)}
            loading="lazy"
          />
          <div className="receipt-thumb-overlay">
            <Eye size={14} />
            <span>Zoom</span>
          </div>
        </>
      ) : (
        <div className="receipt-thumb-fallback">
          <div className="fallback-icon-wrap">
            <Receipt size={18} className="fallback-receipt-icon" />
          </div>
          <span className="fallback-lbl-text">
            {resolvedSrc ? 'Receipt Proof' : 'No Receipt'}
          </span>
          {resolvedSrc && (
            <span className="fallback-inspect-hint">
              <Eye size={10} /> Inspect
            </span>
          )}
        </div>
      )}
    </div>
  );
};
