import { useState, useEffect } from 'react';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';

const MEDALS = ['🥇', '🥈', '🥉'];
const TOP_COLORS = ['from-yellow-50 to-yellow-100 border-yellow-200', 'from-gray-50 to-gray-100 border-gray-200', 'from-orange-50 to-orange-100 border-orange-200'];

export default function Leaderboard() {
  useAuth({ requireAuth: false }); // no redirect — leaderboard is public
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
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resolve an issue = <span className="font-semibold text-green-600">+10 pts</span>
            &nbsp;·&nbsp;
            Verify an issue = <span className="font-semibold text-blue-600">+5 pts</span>
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && entries.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <div className="text-5xl mb-3">🏅</div>
            <p className="text-gray-500 font-medium">No entries yet</p>
            <p className="text-sm text-gray-400 mt-1">Resolve issues to appear on the leaderboard.</p>
          </div>
        )}

        {/* Top 3 podium cards */}
        {!loading && entries.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {entries.slice(0, 3).map((entry, i) => (
              <div key={String(entry.userId)} className={`bg-gradient-to-b ${TOP_COLORS[i]} border rounded-xl p-4 text-center`}>
                <div className="text-3xl mb-1">{MEDALS[i]}</div>
                <div className="font-semibold text-gray-800 text-sm truncate">{entry.name}</div>
                <div className="text-lg font-bold text-gray-700 mt-1">{entry.totalPoints}</div>
                <div className="text-xs text-gray-400">pts</div>
              </div>
            ))}
          </div>
        )}

        {/* Full ranked list */}
        {!loading && entries.map((entry, i) => (
          <div
            key={String(entry.userId)}
            className={`flex items-center gap-4 bg-white rounded-xl border px-4 py-3 mb-2 shadow-sm ${i < 3 ? 'border-yellow-100' : 'border-gray-100'}`}
          >
            <span className="w-8 text-center text-lg font-bold text-gray-400">
              {MEDALS[i] || `#${i + 1}`}
            </span>
            <span className="flex-1 font-medium text-gray-700">{entry.name}</span>
            <span className="font-bold text-green-600">{entry.totalPoints} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
