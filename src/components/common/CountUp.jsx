import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to animate numbers with high performance requestAnimationFrame
 * Easing: Quartic Out for a snappy, luxurious deceleration curve
 */
export const useCountUp = ({
  end = 0,
  start = 0,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  enabled = true
}) => {
  const [displayValue, setDisplayValue] = useState(
    `${prefix}${start.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  );
  
  const endNum = typeof end === 'number' ? end : parseFloat(String(end).replace(/[^0-9.-]/g, '')) || 0;
  const startNum = typeof start === 'number' ? start : parseFloat(String(start).replace(/[^0-9.-]/g, '')) || 0;
  
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      const formatted = endNum.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      setDisplayValue(`${prefix}${formatted}${suffix}`);
      return;
    }

    // Easing: easeOutExpo for snappy tech-dashboard feel
    const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const current = startNum + (endNum - startNum) * easedProgress;

      const formatted = current.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });

      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        const finalFormatted = endNum.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
        setDisplayValue(`${prefix}${finalFormatted}${suffix}`);
      }
    };

    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [endNum, startNum, duration, decimals, prefix, suffix, separator, enabled]);

  return displayValue;
};

/**
 * Reusable CountUp Component
 */
export const CountUp = ({
  value = 0,
  start = 0,
  duration = 1200,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  enabled = true
}) => {
  const animatedVal = useCountUp({
    end: value,
    start,
    duration,
    decimals,
    prefix,
    suffix,
    enabled
  });

  return <span className={`count-up-val ${className}`}>{animatedVal}</span>;
};
