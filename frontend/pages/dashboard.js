import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import IssueCard from '../components/IssueCard';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import useProgress from '../hooks/useProgress';
import api from '../lib/api';

const DEFAULT_LAT = 15.2993;
const DEFAULT_LNG = 74.1240;
const DEFAULT_RADIUS = 10000;

const STATUSES = ['All', 'Reported', 'Assigned', 'In Progress', 'Resolved', 'Verified'];

const STAT_CONFIG = [
  { label: 'Total Issues',  key: 'total',        grad: 'from-sky-50 to-sky-100',    border: 'border-sky-200',    text: 'text-sky-700',    icon: '📋' },
  { label: 'Reported',      key: 'Reported',      grad: 'from-red-50 to-red-100',    border: 'border-red-200',    text: 'text-red-600',    icon: '🚨' },
  { label: 'In Progress',   key: 'In Progress',   grad: 'from-amber-50 to-amber-100',border: 'border-amber-200',  text: 'text-amber-600',  icon: '🔧' },
  { label: 'Resolved',      key: 'Resolved',      grad: 'from-teal-50 to-teal-100',  border: 'border-teal-200',   text: 'text-teal-600',   icon: '✅' },
];

const PROGRESS_COLORS = {
  Reported:      'bg-red-400',
  Assigned:      'bg-sky-400',
  'In Progress': 'bg-amber-400',
  Resolved:      'bg-teal-400',
  Verified:      'bg-emerald-500',
};

const GOA_LAT = 15.2993;
const GOA_LNG = 74.1240;

const DEMO_ISSUES = [
  {
    _id: 'demo1',
    title: 'Unsafe lighting near Calangute beach road',
    description: 'Street lights on the coastal road near Calangute beach are broken. Very dangerous for tourists walking at night.',
    status: 'Reported',
    location: { coordinates: [GOA_LNG + 0.01, GOA_LAT + 0.01] },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: 'demo2',
    title: 'Broken walkway near Anjuna tourist area',
    description: 'Cracked pavement near the Anjuna flea market entrance. Several visitors have tripped and fallen.',
    status: 'In Progress',
    location: { coordinates: [GOA_LNG - 0.01, GOA_LAT - 0.01] },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'demo3',
    title: 'Garbage near Baga beach market',
    description: 'Uncollected garbage near the Baga beach market causing health hazards and bad odour for tourists.',
    status: 'Resolved',
    location: { coordinates: [GOA_LNG + 0.02, GOA_LAT - 0.02] },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    _id: 'demo4',
    title: 'Dark street near hostel area in Panaji',
    description: 'No street lighting on the lane behind the popular hostel cluster in Panaji. Unsafe after 9pm.',
    status: 'Assigned',
    location: { coordinates: [GOA_LNG - 0.02, GOA_LAT + 0.02] },
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export default function Dashboard() {
  const { user, ready } = useAuth({ requireAuth: true });
  const { progress, active: progressActive, startProgress, doneProgress } = useProgress();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [touristMode, setTouristMode] = useState(false);

  useEffect(() => {
    if (ready && user) fetchNearby();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const fetchNearby = async () => {
    setLoading(true);
    startProgress();
    try {
      const { lat, lng } = await getLocation();
      const res = await api.get('/issues/nearby', { params: { lat, lng, radius: DEFAULT_RADIUS } });
      const data = res.data.data || [];
      setIssues(data.length > 0 ? data : DEMO_ISSUES);
    } catch {
      setIssues(DEMO_ISSUES);
    } finally {
      setLoading(false);
      doneProgress();
    }
  };

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG })
      );
    });

  const handleDelete = async (id) => {
    if (id.startsWith('demo')) { setToast({ message: 'Demo issues cannot be deleted', type: 'info' }); return; }
    if (!window.confirm('Delete this issue? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/issues/${id}`);
      setIssues((prev) => prev.filter((i) => i._id !== id));
      setToast({ message: 'Issue deleted', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const counts = { total: issues.length };
    STATUSES.slice(1).forEach((s) => { counts[s] = issues.filter((i) => i.status === s).length; });
    return counts;
  }, [issues]);

  const myCount = useMemo(() =>
    user ? issues.filter((i) => i.reporterId === user.id || i.reporterId?._id === user.id).length : 0,
  [issues, user]);

  const visible = useMemo(() => {
    let list = issues;
    if (touristMode) {
      const tw = ['tourist','tourism','beach','heritage','monument','resort','visitor','hotel','attraction','unsafe','danger','hazard','dark','lighting'];
      list = list.filter((i) => {
        const text = `${i.title || ''} ${i.description || ''}`.toLowerCase();
        return tw.some((w) => text.includes(w));
      });
    }
    return list
      .filter((i) => filter === 'All' || i.status === filter)
      .filter((i) => !search || (i.title || '').toLowerCase().includes(search.toLowerCase()));
  }, [issues, filter, search, touristMode]);

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Hero banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 60%, #0284c7 100%)' }}
      >
        {/* Subtle wave overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,60 C360,100 720,20 1080,60 C1260,80 1380,40 1440,60 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </div>
        {/* Bird silhouettes */}
        <div className="absolute top-4 right-12 opacity-20 text-white text-xs tracking-widest select-none">
          〜 〜 〜
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Goa · Coastal Safety</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Local Issues Overview
              </h1>
              <p className="text-sky-100 text-sm mt-1.5 max-w-md">
                Helping tourists and local communities stay safer and cleaner together.
              </p>
              {myCount > 0 && (
                <span className="inline-block mt-2 text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
                  {myCount} issue{myCount > 1 ? 's' : ''} reported by you
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Tourist Mode */}
              <button
                onClick={() => setTouristMode((t) => !t)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  touristMode
                    ? 'bg-white text-sky-600 border-white shadow-md'
                    : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                }`}
              >
                <span className={`w-3 h-3 rounded-full border-2 transition-colors ${touristMode ? 'bg-sky-500 border-sky-500' : 'border-white/60'}`} />
                🗺️ Tourist Mode
              </button>
              <button
                onClick={fetchNearby}
                disabled={loading}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/30 transition-all duration-200"
              >
                {loading ? '⏳' : '🔄'} Refresh
              </button>
            </div>
          </div>

          {touristMode && (
            <div className="mt-3 text-xs text-sky-100 bg-white/10 rounded-xl px-3 py-2 inline-block">
              🏖️ Showing safety-related and tourist-relevant issues only
            </div>
          )}
        </div>

        {/* Wave divider */}
        <div className="relative h-8 -mb-1">
          <svg viewBox="0 0 1440 32" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,16 C360,32 720,0 1080,16 C1260,24 1380,8 1440,16 L1440,32 L0,32 Z" fill="#f0f9ff" />
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Progress strip */}
        {progressActive && (
          <div className="w-full h-0.5 rounded-full mb-5 overflow-hidden bg-sky-100">
            <div className="h-full bg-sky-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Story banner */}
        <div
          className="rounded-2xl px-5 py-3.5 mb-6 text-sm flex items-start gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(20,184,166,0.08) 100%)',
            border: '1px solid rgba(14,165,233,0.15)',
          }}
        >
          <span className="text-xl mt-0.5">🌴</span>
          <p className="text-sky-800 text-sm leading-relaxed">
            Tourists can report unsafe areas, and local volunteers help resolve them —
            <span className="font-semibold"> making Goa safer for everyone.</span>
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {STAT_CONFIG.map(({ label, key, grad, border, text, icon }) => (
            <div
              key={key}
              className={`bg-gradient-to-br ${grad} border ${border} rounded-2xl p-4 hover:scale-[1.03] transition-transform duration-200 cursor-default`}
              style={{ boxShadow: '0 2px 8px rgba(14,165,233,0.08)' }}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className={`text-3xl font-bold ${text}`}>{stats[key] ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>

        {/* Status distribution */}
        {issues.length > 0 && (
          <div
            className="bg-white rounded-2xl p-5 mb-6"
            style={{ boxShadow: '0 2px 12px rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.1)' }}
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Safety Status Distribution</p>
            <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
              {STATUSES.slice(1).map((s) => {
                const pct = (stats[s] / issues.length) * 100;
                return pct > 0 ? (
                  <div key={s} title={`${s}: ${stats[s]}`} className={`${PROGRESS_COLORS[s]} transition-all`} style={{ width: `${pct}%` }} />
                ) : null;
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {STATUSES.slice(1).map((s) => stats[s] > 0 && (
                <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2 h-2 rounded-full ${PROGRESS_COLORS[s]}`} />
                  {s} <span className="font-semibold text-gray-700">({stats[s]})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div
          className="bg-white rounded-2xl p-4 mb-6"
          style={{ boxShadow: '0 2px 12px rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.1)' }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Issues Near You</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="🔍 Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border border-sky-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-sky-400 transition-all bg-sky-50/30"
            />
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                    filter === s
                      ? 'text-white shadow-sm'
                      : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-sky-300 hover:text-sky-600'
                  }`}
                  style={filter === s ? {
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                    boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
                  } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: '1px solid rgba(14,165,233,0.08)' }}>
                <div className="flex gap-2 mb-3">
                  <div className="h-5 bg-sky-100 rounded-full w-20" />
                  <div className="h-5 bg-sky-100 rounded-full w-16" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && visible.length === 0 && (
          <div
            className="text-center py-16 bg-white rounded-2xl"
            style={{ border: '1px solid rgba(14,165,233,0.1)', boxShadow: '0 2px 12px rgba(14,165,233,0.06)' }}
          >
            <div className="text-5xl mb-3">🛡️</div>
            <p className="text-gray-700 font-semibold text-lg">
              {search || filter !== 'All' || touristMode
                ? 'No issues found for your filter'
                : 'No issues reported here — this area is currently safe'}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {search || filter !== 'All' || touristMode
                ? 'Try adjusting your search or filter.'
                : <Link href="/create-issue" className="text-sky-600 hover:underline font-medium">Be the first to report an issue →</Link>
              }
            </p>
          </div>
        )}

        {/* Issue list */}
        {!loading && visible.map((issue) => {
          const isOwner = user && (issue.reporterId === user.id || issue.reporterId?._id === user.id);
          const isDemo = issue._id?.startsWith('demo');
          return (
            <IssueCard
              key={issue._id}
              issue={issue}
              actions={isOwner && issue.status === 'Reported' && !isDemo ? (
                <button
                  onClick={() => handleDelete(issue._id)}
                  disabled={deletingId === issue._id}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all duration-200 disabled:opacity-50"
                >
                  {deletingId === issue._id ? 'Deleting...' : '🗑 Delete'}
                </button>
              ) : null}
            />
          );
        })}
      </div>
    </div>
  );
}
