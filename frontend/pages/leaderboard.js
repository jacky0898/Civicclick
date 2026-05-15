import { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_STYLES = [
  'from-yellow-50 to-amber-100 border-amber-200',
  'from-slate-50 to-gray-100 border-gray-200',
  'from-orange-50 to-orange-100 border-orange-200',
];

export default function Leaderboard() {
  useAuth({ requireAuth: false });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/leaderboard')
      .then((res) => setEntries(res.data.data || []))
      .catch((err) => setToast({ message: err.response?.data?.message || 'Failed to load leaderboard', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #0ea5e9 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 80" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">🏆 Leaderboard</h1>
          <p className="text-amber-100 text-sm mt-1.5">
            Top volunteers keeping Goa safe and clean
          </p>
          <div className="flex gap-4 mt-3">
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              Resolve = +10 pts
            </span>
            <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              Verify = +5 pts
            </span>
          </div>
        </div>
        <div className="relative h-6 -mb-1">
          <svg viewBox="0 0 1440 24" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,12 C360,24 720,0 1080,12 C1260,18 1380,6 1440,12 L1440,24 L0,24 Z" fill="#f0f9ff" />
          </svg>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 animate-pulse flex items-center gap-4"
                style={{ border: '1px solid rgba(14,165,233,0.08)' }}>
                <div className="w-8 h-8 bg-sky-100 rounded-full" />
                <div className="flex-1 h-4 bg-gray-100 rounded" />
                <div className="w-16 h-4 bg-teal-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl"
            style={{ border: '1px solid rgba(14,165,233,0.1)', boxShadow: '0 2px 12px rgba(14,165,233,0.06)' }}>
            <div className="text-5xl mb-3">🏅</div>
            <p className="text-gray-600 font-semibold">No entries yet</p>
            <p className="text-sm text-gray-400 mt-1">Resolve issues to appear on the leaderboard.</p>
          </div>
        )}

        {/* Top 3 podium */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {entries.slice(0, 3).map((entry, i) => (
              <div
                key={String(entry.userId)}
                className={`bg-gradient-to-b ${PODIUM_STYLES[i]} border rounded-2xl p-4 text-center`}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="text-3xl mb-1">{MEDALS[i]}</div>
                <div className="font-bold text-gray-800 text-sm truncate">{entry.name}</div>
                <div className="text-xl font-bold text-gray-700 mt-1">{entry.totalPoints}</div>
                <div className="text-xs text-gray-400">pts</div>
              </div>
            ))}
          </div>
        )}

        {/* Full ranked list */}
        {!loading && entries.map((entry, i) => (
          <div
            key={String(entry.userId)}
            className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 mb-2"
            style={{
              border: i < 3 ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(14,165,233,0.08)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            }}
          >
            <span className="w-8 text-center text-lg font-bold text-gray-400">
              {MEDALS[i] || `#${i + 1}`}
            </span>
            <span className="flex-1 font-semibold text-gray-700">{entry.name}</span>
            <span
              className="font-bold text-sm px-3 py-1 rounded-full"
              style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(14,165,233,0.1) 100%)', color: '#0ea5e9' }}
            >
              {entry.totalPoints} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
