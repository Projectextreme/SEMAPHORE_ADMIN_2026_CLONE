import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import './LottiePlayer.css';

/**
 * Universal Lottie & Animated SVG Player component
 * Supports:
 * - Direct Lottie JSON object via `animationData`
 * - Remote Lottie URL via `src` (e.g. https://assets.lottiefiles.com/... or https://lottie.host/...)
 * - Fallback animated SVG when offline or loading
 */
export const LottiePlayer = ({
  animationData = null,
  src = null,
  loop = true,
  autoplay = true,
  speed = 1,
  width = 120,
  height = 120,
  className = '',
  style = {},
  fallback = null
}) => {
  const [remoteData, setRemoteData] = useState(null);
  const [loading, setLoading] = useState(!!src && !animationData);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (src && !animationData) {
      setLoading(true);
      setError(false);
      fetch(src)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch Lottie animation');
          return res.json();
        })
        .then((data) => {
          setRemoteData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('Lottie fetch fallback:', err);
          setError(true);
          setLoading(false);
        });
    }
  }, [src, animationData]);

  const activeData = animationData || remoteData;

  const containerStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };

  if (activeData && !error) {
    return (
      <div className={`lottie-player-wrapper ${className}`} style={containerStyle}>
        <Lottie
          animationData={activeData}
          loop={loop}
          autoPlay={autoplay}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  // If loading or error, render provided fallback or default animated SVG pulse
  if (fallback) {
    return (
      <div className={`lottie-player-wrapper ${className}`} style={containerStyle}>
        {fallback}
      </div>
    );
  }

  return (
    <div className={`lottie-player-wrapper lottie-fallback-svg ${className}`} style={containerStyle}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeDasharray="180"
          strokeDashoffset="60"
          className="lottie-spin-ring"
        />
        <circle cx="50" cy="50" r="24" fill="var(--primary-light)" fillOpacity="0.3" className="lottie-pulse-core" />
        <circle cx="50" cy="50" r="10" fill="var(--cyan)" />
      </svg>
    </div>
  );
};
