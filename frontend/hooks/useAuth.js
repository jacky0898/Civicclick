import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Centralised auth hook.
 * - Only runs on the client (localStorage is SSR-safe)
 * - Reads token on mount, checks expiry, redirects if needed
 * - Returns { user, ready } — ready=false until the check completes
 */
export default function useAuth({ requireAuth = true } = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Guard: localStorage is only available in the browser
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');

    if (!token) {
      if (requireAuth) router.replace('/login');
      setReady(true);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // Token expired — clear and redirect
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        if (requireAuth) router.replace('/login');
        setReady(true);
        return;
      }

      setUser(payload);
    } catch {
      // Malformed token — clear and redirect
      localStorage.removeItem('token');
      if (requireAuth) router.replace('/login');
    }

    setReady(true);
  // Run once on mount only — router.replace is stable, requireAuth is a prop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, ready };
}
