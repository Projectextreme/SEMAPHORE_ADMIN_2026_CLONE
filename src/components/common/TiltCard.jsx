import { useState, useRef, useCallback } from 'react';
import './TiltCard.css';

/**
 * 3D Interactive Perspective Tilt Card with Cursor Spotlight Glare
 */
export const TiltCard = ({
  children,
  className = '',
  maxTilt = 7, // Max tilt in degrees
  perspective = 1000,
  glare = true,
  glareOpacity = 0.15,
  onClick,
  style = {}
}) => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const [glareStyle, setGlareStyle] = useState({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`,
      transition: 'transform 0.08s ease-out'
    });

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlareStyle({
        opacity: glareOpacity,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 70%)`
      });
    }
  }, [maxTilt, perspective, glare, glareOpacity]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px)`,
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });
    setGlareStyle({
      opacity: 0,
      transition: 'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });
  }, [perspective]);

  return (
    <div
      ref={cardRef}
      className={`tilt-card-container ${isHovered ? 'is-tilting' : ''} ${className}`}
      style={{ ...style, ...tiltStyle }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
      {glare && (
        <div 
          className="tilt-card-glare"
          style={glareStyle}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
