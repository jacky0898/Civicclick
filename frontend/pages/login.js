import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Toast from '../components/Toast';
import api from '../lib/api';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const token = res.data?.data?.accessToken || res.data?.token || res.data?.accessToken;
      if (!token) throw new Error('No token received from server');
      if (typeof window !== 'undefined') localStorage.setItem('token', token);
      router.push('/dashboard');
    } catch (err) {
      setToast({ message: err.response?.data?.message || err.message || 'Login failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-sky-100 rounded-xl px-4 py-3 text-sm bg-white/80 focus:outline-none focus:border-sky-400 transition-all duration-200 placeholder-gray-400';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #e0f2fe 0%, #f0fdfa 50%, #f0f9ff 100%)' }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Subtle decorative blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
      <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2dd4bf 0%, transparent 70%)' }} />

      <div
        className="relative w-full max-w-sm rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 8px 40px rgba(14,165,233,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' }}
          >
            CC
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-sm text-sky-500 mt-1 font-medium">Coastal Safety &amp; Tourism Platform</p>
          <p className="text-xs text-gray-400 mt-0.5">Sign in to continue to CivicClick</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 mt-2 hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
              boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          No account?{' '}
          <Link href="/register" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline">
            Create one free
          </Link>
        </p>

        {/* Wave decoration */}
        <div className="mt-6 -mx-8 -mb-8 overflow-hidden rounded-b-3xl opacity-30">
          <svg viewBox="0 0 400 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C100,40 200,0 300,20 C350,30 380,15 400,20 L400,40 L0,40 Z" fill="#0ea5e9" />
          </svg>
        </div>
      </div>
    </div>
  );
}
