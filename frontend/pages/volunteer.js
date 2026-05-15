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
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resolve Local Issues</h1>
          <p className="text-sm text-gray-500 mt-1">
            Help keep your community safe for citizens and tourists
          </p>
        </div>

        {/* API progress strip */}
        {progressActive && (
          <div className="w-full h-0.5 bg-gray-100 rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}

        {/* ── Accept Issue Card ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎯</span>
            <h2 className="text-base font-bold text-gray-800">Accept an Issue</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Copy an Issue ID from the dashboard (click the <span className="font-mono">#xxxxxx</span> tag) and paste it below.
          </p>
          <div className="flex gap-2">
            <input
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !accepting && acceptIssue()}
              placeholder="Paste Issue ID here..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 transition-shadow"
            />
            <button
              onClick={acceptIssue}
              disabled={accepting}
              className="bg-green-600 hover:bg-green-700 active:scale-95 disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
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

        {/* ── Assigned Issues ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              My Assigned Issues
              {!loading && (
                <span className="ml-2 text-sm font-normal text-gray-400">({assigned.length})</span>
              )}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Issues you are responsible for resolving</p>
          </div>
          <button
            onClick={fetchAssigned}
            className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-2 mb-3">
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && assigned.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-3">🙌</div>
            <p className="text-gray-700 font-semibold text-lg">No assigned issues yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Accept an issue above to start helping your community.
            </p>
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
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                  {updatingId === issue._id ? (
                    <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Updating...</>
                  ) : `✓ Mark as ${STATUS_NEXT[issue.status]}`}
                </button>
              ) : (
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
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
