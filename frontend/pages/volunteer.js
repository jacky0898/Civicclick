import { useState, useEffect } from 'react';
import IssueCard from '../components/IssueCard';
import Toast from '../components/Toast';
import useAuth from '../hooks/useAuth';
import useProgress from '../hooks/useProgress';
import api from '../lib/api';

const STATUS_NEXT = {
  Assigned:      'In Progress',
  'In Progress': 'Resolved',
};

export default function Volunteer() {
  const { ready } = useAuth({ requireAuth: true });
  const { progress, active: progressActive, startProgress, doneProgress } = useProgress();
  const [assigned, setAssigned] = useState([]);
  const [issueId, setIssueId] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (ready) fetchAssigned();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const fetchAssigned = async () => {
    setLoading(true);
    startProgress();
    try {
      const res = await api.get('/volunteer/assigned');
      setAssigned(res.data.data || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to load assigned issues', type: 'error' });
    } finally {
      setLoading(false);
      doneProgress();
    }
  };

  const acceptIssue = async () => {
    if (!issueId.trim()) { setToast({ message: 'Please enter an Issue ID', type: 'error' }); return; }
    setAccepting(true);
    try {
      await api.post(`/volunteer/accept/${issueId.trim()}`);
      setToast({ message: '✅ Issue accepted! It is now assigned to you.', type: 'success' });
      setIssueId('');
      fetchAssigned();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to accept issue', type: 'error' });
    } finally {
      setAccepting(false);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    const next = STATUS_NEXT[currentStatus];
    if (!next) { setToast({ message: 'No further transitions available', type: 'info' }); return; }
    if (!window.confirm(`Mark this issue as "${next}"?\n\nThis will update the status and notify the system.`)) return;
    setUpdatingId(id);
    try {
      await api.patch(`/volunteer/status/${id}`, { status: next });
      setToast({ message: `✅ Status updated to "${next}"`, type: 'success' });
      fetchAssigned();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update status', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Hero */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 1440 80" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Resolve Local Issues</h1>
          <p className="text-teal-100 text-sm mt-1.5">
            Help keep Goa safe for citizens and tourists 🌴
          </p>
        </div>
        <div className="relative h-6 -mb-1">
          <svg viewBox="0 0 1440 24" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,12 C360,24 720,0 1080,12 C1260,18 1380,6 1440,12 L1440,24 L0,24 Z" fill="#f0f9ff" />
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Progress strip */}
        {progressActive && (
          <div className="w-full h-0.5 rounded-full mb-5 overflow-hidden bg-teal-100">
            <div className="h-full bg-teal-400 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* Accept Issue */}
        <div
          className="bg-white rounded-2xl p-6 mb-6"
          style={{ boxShadow: '0 2px 12px rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎯</span>
            <h2 className="text-base font-bold text-gray-800">Accept an Issue</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Copy an Issue ID from the dashboard (click the <span className="font-mono bg-gray-100 px-1 rounded">#xxxxxx</span> tag) and paste it below.
          </p>
          <div className="flex gap-2">
            <input
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !accepting && acceptIssue()}
              placeholder="Paste Issue ID here..."
              className="flex-1 border border-teal-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 transition-all bg-teal-50/30"
            />
            <button
              onClick={acceptIssue}
              disabled={accepting}
              className="disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)', boxShadow: '0 3px 12px rgba(20,184,166,0.35)' }}
            >
              {accepting ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Accepting...
                </span>
              ) : 'Accept Issue'}
            </button>
          </div>
        </div>

        {/* Assigned Issues header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              My Assigned Issues
              {!loading && <span className="ml-2 text-sm font-normal text-gray-400">({assigned.length})</span>}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Issues you are responsible for resolving</p>
          </div>
          <button
            onClick={fetchAssigned}
            className="text-xs text-sky-600 hover:text-sky-800 border border-sky-200 hover:border-sky-400 hover:bg-sky-50 px-3 py-1 rounded-xl transition-all duration-200"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: '1px solid rgba(14,165,233,0.08)' }}>
                <div className="flex gap-2 mb-3">
                  <div className="h-5 bg-teal-100 rounded-full w-20" />
                  <div className="h-5 bg-sky-100 rounded-full w-16" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && assigned.length === 0 && (
          <div
            className="text-center py-16 bg-white rounded-2xl"
            style={{ border: '1px solid rgba(20,184,166,0.1)', boxShadow: '0 2px 12px rgba(20,184,166,0.06)' }}
          >
            <div className="text-5xl mb-3">🙌</div>
            <p className="text-gray-700 font-semibold text-lg">No assigned issues yet</p>
            <p className="text-sm text-gray-400 mt-2">Accept an issue above to start helping your community.</p>
          </div>
        )}

        {/* Issue cards */}
        {!loading && assigned.map((issue) => (
          <IssueCard
            key={issue._id}
            issue={issue}
            actions={
              STATUS_NEXT[issue.status] ? (
                <button
                  disabled={updatingId === issue._id}
                  onClick={() => updateStatus(issue._id, issue.status)}
                  className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}
                >
                  {updatingId === issue._id ? (
                    <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating...</>
                  ) : `✓ Mark as ${STATUS_NEXT[issue.status]}`}
                </button>
              ) : (
                <span className="text-xs text-teal-600 font-medium bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
                  ✅ Fully resolved
                </span>
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
