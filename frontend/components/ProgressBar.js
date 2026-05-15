import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function ProgressBar() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Stable handler refs so we can remove the exact same function
    const start = () => {
      clearInterval(timerRef.current);
      setVisible(true);
      setProgress(0);
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 80) {
            clearInterval(timerRef.current);
            return p;
          }
          return p + Math.random() * 15;
        });
      }, 120);
    };

    const done = () => {
      clearInterval(timerRef.current);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError', done);

    return () => {
      clearInterval(timerRef.current);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError', done);
    };
  // Empty dep array — router.events is stable, we only want to bind once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent pointer-events-none">
      <div
        className="h-full bg-blue-500 shadow-sm"
        style={{
          width: `${progress}%`,
          boxShadow: '0 0 8px rgba(59,130,246,0.7)',
          opacity: progress >= 100 ? 0 : 1,
          transition: progress >= 100
            ? 'width 0.2s ease-out, opacity 0.3s ease 0.1s'
            : 'width 0.3s ease-out',
        }}
      />
    </div>
  );
}
