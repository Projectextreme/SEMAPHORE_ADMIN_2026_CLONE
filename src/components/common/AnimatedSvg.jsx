import './AnimatedSvg.css';

/**
 * High-performance Animated SVG Illustrations
 * Direct SVG animations with particle dynamics, glow rings, and gradient physics
 */

// 1. Cyber Security Hologram (Login & Role Authorization)
export const AnimatedCyberShield = ({ size = 120, className = '' }) => (
  <div className={`animated-svg-box shield-box ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-anim">
      <defs>
        <linearGradient id="shieldGrad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Outer Rotating Radar Ring */}
      <circle cx="60" cy="60" r="52" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="6 6" className="anim-spin" />
      <circle cx="60" cy="60" r="44" stroke="var(--cyan)" strokeWidth="1" strokeDasharray="3 9" className="anim-spin-reverse" />
      {/* Central Shield */}
      <path
        d="M60 22L88 34V60C88 78 76 93 60 98C44 93 32 78 32 60V34L60 22Z"
        fill="url(#shieldGrad)"
        fillOpacity="0.16"
        stroke="url(#shieldGrad)"
        strokeWidth="2.5"
        className="anim-float"
      />
      {/* Inner Keyhole / Lock */}
      <circle cx="60" cy="52" r="7" fill="var(--cyan)" className="anim-pulse" />
      <path d="M57 56H63L65 72H55L57 56Z" fill="var(--cyan)" />
      {/* Particle Sparks */}
      <circle cx="28" cy="40" r="2" fill="#06b6d4" className="anim-spark-1" />
      <circle cx="92" cy="45" r="2.5" fill="#6366f1" className="anim-spark-2" />
      <circle cx="60" cy="104" r="2" fill="#10b981" className="anim-spark-3" />
    </svg>
  </div>
);

// 2. Payment Verified & Celebration Checkmark
export const AnimatedPaymentSuccess = ({ size = 100, className = '' }) => (
  <div className={`animated-svg-box success-box ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-anim">
      <defs>
        <linearGradient id="emeraldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Expanding Ripple Rings */}
      <circle cx="50" cy="50" r="42" stroke="var(--success)" strokeWidth="1.5" strokeDasharray="4 4" className="anim-spin" />
      <circle cx="50" cy="50" r="32" fill="url(#emeraldGrad)" fillOpacity="0.12" className="anim-ripple" />
      {/* Solid Badge */}
      <circle cx="50" cy="50" r="26" fill="url(#emeraldGrad)" className="anim-pop" />
      {/* Animated Checkmark */}
      <path
        d="M38 50L46 58L63 41"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="anim-draw-check"
      />
      {/* Sparkles */}
      <circle cx="24" cy="30" r="2" fill="#34d399" className="anim-spark-1" />
      <circle cx="76" cy="26" r="2.5" fill="#10b981" className="anim-spark-2" />
      <circle cx="78" cy="70" r="2" fill="#6ee7b7" className="anim-spark-3" />
    </svg>
  </div>
);

// 3. Trophy Winner & Tournament Arena
export const AnimatedEventTrophy = ({ size = 110, className = '' }) => (
  <div className={`animated-svg-box trophy-box ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-anim">
      <defs>
        <linearGradient id="goldGrad" x1="20" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="55" cy="55" r="48" stroke="var(--warning)" strokeWidth="1.5" strokeDasharray="5 5" className="anim-spin" />
      {/* Trophy Body */}
      <path
        d="M35 30H75V52C75 63 66 72 55 72C44 72 35 63 35 52V30Z"
        fill="url(#goldGrad)"
        fillOpacity="0.25"
        stroke="url(#goldGrad)"
        strokeWidth="2.5"
        className="anim-float"
      />
      {/* Handles */}
      <path d="M35 36H24C20 36 18 48 26 52H35" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" />
      <path d="M75 36H86C90 36 92 48 84 52H75" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" />
      {/* Stem & Base */}
      <path d="M51 72H59V84H51V72Z" fill="var(--warning)" />
      <rect x="38" y="84" width="34" height="8" rx="2" fill="var(--warning)" />
      {/* Star */}
      <polygon points="55,38 57,44 63,44 58,48 60,54 55,50 50,54 52,48 47,44 53,44" fill="#ffffff" className="anim-pulse" />
    </svg>
  </div>
);

// 4. Tech Radar / Live Status Pulse
export const AnimatedLiveRadar = ({ size = 90, className = '' }) => (
  <div className={`animated-svg-box radar-box ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-anim">
      <circle cx="45" cy="45" r="38" stroke="var(--primary)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="45" cy="45" r="28" stroke="var(--cyan)" strokeWidth="1" strokeDasharray="4 4" className="anim-spin-reverse" />
      <circle cx="45" cy="45" r="16" fill="var(--primary-light)" fillOpacity="0.4" className="anim-ripple" />
      <circle cx="45" cy="45" r="7" fill="var(--primary)" className="anim-pulse" />
      <line x1="45" y1="45" x2="78" y2="45" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" className="anim-radar-sweep" />
    </svg>
  </div>
);

// 5. Floating Cloud Database & API Sync
export const AnimatedCloudSync = ({ size = 100, className = '' }) => (
  <div className={`animated-svg-box sync-box ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="svg-anim">
      <circle cx="50" cy="50" r="44" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="5 5" className="anim-spin" />
      <path
        d="M32 60C27 60 23 56 23 51C23 46 27 42 32 42C33 34 40 28 48 28C55 28 62 33 64 40C69 40 73 44 73 49C73 54 69 58 64 58H32Z"
        fill="var(--primary-light)"
        stroke="var(--primary)"
        strokeWidth="2"
        className="anim-float"
      />
      <path d="M42 66L50 58L58 66" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="50" y1="58" x2="50" y2="76" stroke="var(--cyan)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);
