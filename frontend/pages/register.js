import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Toast from '../components/Toast';
import api from '../lib/api';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'citizen' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setToast({ message: 'Account created! Redirecting to login...', type: 'success' });
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || err.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-sky-100 rounded-xl px-4 py-3 text-sm bg-white/80 focus:outline-none focus:border-sky-400 transition-all duration-200 placeholder-gray-400';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #f0fdfa 0%, #e0f2fe 50%, #f0f9ff 100%)' }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="absolute top-16 right-16 w-56 h-56 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }} />
      <div className="absolute bottom-16 left-16 w-40 h-40 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />

      <div
        className="relative w-full max-w-sm rounded-3xl p-8"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 8px 40px rgba(20,184,166,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <div className="text-center mb-7">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' }}
          >
            CC
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Join CivicClick</h1>
          <p className="text-sm text-teal-500 mt-1 font-medium">Help keep Goa safe &amp; clean</p>
          <p className="text-xs text-gray-400 mt-0.5">Create your free account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} className={inputClass} placeholder="Min 8 characters" />
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { r: 'citizen',   icon: '🏖️', title: 'Citizen / Tourist', sub: 'Report issues' },
                { r: 'volunteer', icon: '🙋', title: 'Local Volunteer',   sub: 'Resolve issues' },
              ].map(({ r, icon, title, sub }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={`py-3 px-3 rounded-xl text-left transition-all duration-200 border-2 ${
                    form.role === r
                      ? 'border-sky-400 bg-sky-50'
                      : 'border-gray-100 bg-white hover:border-sky-200 hover:bg-sky-50/50'
                  }`}
                >
                  <div className="text-lg mb-0.5">{icon}</div>
                  <div className="text-xs font-bold text-gray-800">{title}</div>
                  <div className="text-[10px] text-gray-400">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 mt-1 hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)',
              boxShadow: '0 4px 16px rgba(20,184,166,0.35)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline">Sign in</Link>
        </p>

        <div className="mt-6 -mx-8 -mb-8 overflow-hidden rounded-b-3xl opacity-25">
          <svg viewBox="0 0 400 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C80,0 160,40 240,20 C320,0 360,30 400,20 L400,40 L0,40 Z" fill="#14b8a6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
