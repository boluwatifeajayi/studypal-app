import { useState, useEffect } from 'react';

/**
 * Animates a number from 0 to target on mount.
 * @param {number} target - Target value
 * @param {number} duration - Animation duration in ms
 * @param {boolean} enabled - Whether to run the animation
 * @returns {number} Current displayed value
 */
export function useCountUp(target, duration = 600, enabled = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled || target === 0) {
      setValue(target);
      return;
    }
    let start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - (1 - progress) ** 2;
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, enabled]);

  return value;
}
