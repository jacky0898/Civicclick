import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import ProgressBar from '../components/ProgressBar';
import api from '../lib/api';

const AUTH_ONLY_ROUTES = ['/login', '/register'];

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [globalToast, setGlobalToast] = useState(null);

  // Redirect logged-in users away from /login and /register.
  // Runs once on mount — router.events handles subsequent navigations.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndRedirect = (pathname) => {
      if (!AUTH_ONLY_ROUTES.includes(pathname)) return;

      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          return;
        }
        router.replace('/dashboard');
      } catch {
        localStorage.removeItem('token');
      }
    };

    // Check on initial load
    checkAndRedirect(router.pathname);

    // Check on every route change (handles browser back/forward)
    const handleRouteChange = (url) => {
      const pathname = url.split('?')[0];
      checkAndRedirect(pathname);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  // Empty dep array — runs once, router.events handles the rest
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global axios error handler — network errors and 5xx only
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        // 401 is already handled in api.js (clears token + redirects)
        if (err.response?.status === 401) return Promise.reject(err);
        if (!err.response) {
          setGlobalToast({ message: 'Network error — check your connection', type: 'error' });
        } else if (err.response.status >= 500) {
          setGlobalToast({ message: 'Server error — please try again later', type: 'error' });
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ProgressBar />
      <Navbar />
      {globalToast && (
        <Toast
          message={globalToast.message}
          type={globalToast.type}
          onClose={() => setGlobalToast(null)}
        />
      )}
      <Component {...pageProps} />
    </>
  );
}
