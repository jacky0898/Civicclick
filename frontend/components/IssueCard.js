const STATUS_STYLES = {
  Reported:      'bg-yellow-100 text-yellow-800',
  Assigned:      'bg-blue-100 text-blue-800',
  'In Progress': 'bg-purple-100 text-purple-800',
  Resolved:      'bg-green-100 text-green-800',
  Verified:      'bg-emerald-100 text-emerald-800',
};

// Priority — first match wins, fallback = Minor Issue
const PRIORITY_RULES = [
  { words: ['unsafe', 'danger', 'dark', 'broken', 'accident', 'hazard', 'fire', 'flood', 'collapse', 'lighting'],
    label: '🔴 Unsafe for Tourists', cls: 'bg-red-50 text-red-700 border border-red-200' },
  { words: ['garbage', 'waste', 'pothole', 'crack', 'leak', 'noise', 'blocked', 'dirty', 'problem', 'issue'],
    label: '🟡 Needs Attention', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
];
const PRIORITY_DEFAULT = { label: '🟢 Minor Issue', cls: 'bg-green-50 text-green-700 border border-green-200' };

// Location context — first match wins, fallback = Local Area
const LOCATION_RULES = [
  { words: ['beach', 'coast', 'sea', 'shore', 'calangute', 'baga', 'anjuna', 'vagator', 'palolem'],
    label: '📍 Near Beach' },
  { words: ['market', 'shop', 'bazaar', 'flea', 'store'],
    label: '📍 Market Area' },
  { words: ['hotel', 'hostel', 'resort', 'tourist', 'visitor', 'heritage', 'monument', 'attraction'],
    label: '📍 Tourist Zone' },
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

  // GeoJSON stores [longitude, latitude] — swap for Google Maps (lat, lng)
  const coords = Array.isArray(location?.coordinates) ? location.coordinates : [];
  const lng = typeof coords[0] === 'number' ? coords[0] : null;
  const lat = typeof coords[1] === 'number' ? coords[1] : null;
  const hasCoords = lat !== null && lng !== null;

  const badgeClass = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700';
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      {/* Header row: status + priority + date + ID */}
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {status}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priority.cls}`}>
            {priority.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {dateStr && <span className="text-xs text-gray-400">{dateStr}</span>}
          {_id && (
            <button onClick={copyId} title="Copy Issue ID" className="text-xs text-gray-300 hover:text-gray-500 transition-colors font-mono">
              #{String(_id).slice(-6)}
            </button>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-800 text-base mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{description}</p>
      )}

      {/* Location context + map link */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">{locationLabel}</span>
        {hasCoords && (
          <>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-400">
              {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
            </span>
            <button
              onClick={openMap}
              className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors font-medium"
              title="Open in Google Maps"
            >
              View on Map ↗
            </button>
          </>
        )}
      </div>

      {imageUrl && (
        <img src={imageUrl} alt={title || 'Issue photo'} loading="lazy" className="w-full h-40 object-cover rounded-lg mt-2" />
      )}

      {actions && (
        <div className="mt-3 flex gap-2 flex-wrap">{actions}</div>
      )}
    </div>
  );
}
