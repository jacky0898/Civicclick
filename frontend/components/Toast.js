import { useEffect } from 'react';

const ICONS = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

const COLORS = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error:   'bg-red-50 border-red-400 text-red-800',
  info:    'bg-blue-50 border-blue-400 text-blue-800',
};

/**
 * Usage: <Toast message="..." type="success|error|info" onClose={() => setToast(null)} />
 * Auto-dismisses after 3.5s.
 */
export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-start gap-2 border-l-4 rounded-lg px-4 py-3 shadow-lg max-w-sm text-sm ${COLORS[type]}`}>
      <span>{ICONS[type]}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-base leading-none">×</button>
    </div>
  );
}
