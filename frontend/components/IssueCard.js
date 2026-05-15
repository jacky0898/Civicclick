const STATUS_STYLES = {
  Reported:      { pill: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
  Assigned:      { pill: 'bg-sky-100 text-sky-700',      dot: 'bg-sky-400' },
  'In Progress': { pill: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  Resolved:      { pill: 'bg-teal-100 text-teal-700',    dot: 'bg-teal-400' },
  Verified:      { pill: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
};

const PRIORITY_RULES = [
  { words: ['unsafe', 'danger', 'dark', 'broken', 'accident', 'hazard', 'fire', 'flood', 'collapse', 'lighting'],
    label: '🔴 Unsafe', cls: 'bg-red-50 text-red-700 border border-red-200' },
  { words: ['garbage', 'waste', 'pothole', 'crack', 'leak', 'noise', 'blocked', 'dirty', 'problem'],
    label: '🟡 Attention', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
];
const PRIORITY_DEFAULT = { label: '🟢 Minor', cls: 'bg-teal-50 text-teal-700 border border-teal-200' };

const LOCATION_RULES = [
  { words: ['beach', 'coast', 'sea', 'shore', 'calangute', 'baga', 'anjuna', 'vagator', 'palolem'],
    label: '🏖️ Near Beach' },
  { words: ['market', 'shop', 'bazaar', 'flea', 'store'],
    label: '🛍️ Market Area' },
  { words: ['hotel', 'hostel', 'resort', 'tourist', 'visitor', 'heritage', 'monument', 'attraction'],
    label: '🗺️ Tourist Zone' },
];
const LOCATION_DEFAULT = '📍 Local Area';

function inferPriority(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase();
  for (const r of PRIORITY_RULES) {
    if (r.words.some((w) => text.includes(w))) return r;
  }
  return PRIORITY_DEFAULT;
}

function inferLocation(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase();
  for (const r of LOCATION_RULES) {
    if (r.words.some((w) => text.includes(w))) return r.label;
  }
  return LOCATION_DEFAULT;
}

export default function IssueCard({ issue, actions }) {
  const { _id, title = '', description = '', status, imageUrl, location, createdAt } = issue || {};

  const coords = Array.isArray(location?.coordinates) ? location.coordinates : [];
  const lng = typeof coords[0] === 'number' ? coords[0] : null;
  const lat = typeof coords[1] === 'number' ? coords[1] : null;
  const hasCoords = lat !== null && lng !== null;

  const statusStyle = STATUS_STYLES[status] || { pill: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  const priority = inferPriority(title, description);
  const locationLabel = inferLocation(title, description);

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const copyId = () => { if (_id) navigator.clipboard?.writeText(_id).catch(() => {}); };

  const openMap = () => {
    if (!hasCoords) return;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="issue-card-hover bg-white rounded-2xl p-5 mb-4 border border-sky-50/80 cursor-default"
      style={{ boxShadow: '0 2px 12px rgba(14,165,233,0.07), 0 1px 3px rgba(0,0,0,0.05)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status badge with dot */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {status}
          </span>
          {/* Priority */}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priority.cls}`}>
            {priority.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {dateStr && <span className="text-xs text-gray-400">{dateStr}</span>}
          {_id && (
            <button
              onClick={copyId}
              title="Copy Issue ID"
              className="text-xs text-gray-300 hover:text-sky-400 transition-colors font-mono"
            >
              #{String(_id).slice(-6)}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-800 text-base mb-1.5 leading-snug">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{description}</p>
      )}

      {/* Location + map */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">{locationLabel}</span>
        {hasCoords && (
          <>
            <span className="text-gray-200 text-xs">·</span>
            <span className="text-xs text-gray-400">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
            <button
              onClick={openMap}
              className="text-xs font-semibold text-sky-500 hover:text-sky-700 hover:underline transition-colors"
              title="Open in Google Maps"
            >
              View on Map ↗
            </button>
          </>
        )}
      </div>

      {/* Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title || 'Issue photo'}
          loading="lazy"
          className="w-full h-44 object-cover rounded-xl mt-1 mb-3"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        />
      )}

      {/* Actions */}
      {actions && (
        <div className="pt-3 border-t border-gray-50 flex gap-2 flex-wrap">{actions}</div>
      )}
    </div>
  );
}
