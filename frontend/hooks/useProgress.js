import { useState, useRef, useCallback } from 'react';

/**
 * Simulates a percentage progress bar during async operations.
 * Returns { progress, startProgress, doneProgress, ProgressBar }
 *
 * Usage:
 *   const { progress, startProgress, doneProgress } = useProgress();
 *   startProgress();
 *   await fetchData();
 *   doneProgress();
 */
export default function useProgress() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  const startProgress = useCallback(() => {
    setActive(true);
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) { clearInterval(timerRef.current); return p; }
        return p + Math.random() * 12;
      });
    }, 150);
  }, []);

  const doneProgress = useCallback(() => {
    clearInterval(timerRef.current);
    setProgress(100);
    setTimeout(() => {
      setActive(false);
      setProgress(0);
    }, 350);
  }, []);

  return { progress, active, startProgress, doneProgress };
}
