import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ROLE_LABEL = {
  citizen:   { label: 'Citizen / Tourist', badge: 'bg-blue-100 text-blue-700' },
  volunteer: { label: 'Local Volunteer',   badge: 'bg-green-100 text-green-700' },
  admin:     { label: 'Admin',             badge: 'bg-red-100 text-red-700' },
};

function decodeToken(token) {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
}

const NAV_LINKS = [
  { href: '/dashboard',    label: 'Dashboard',    roles: null },
  { href: '/create-issue', label: 'Report Issue', roles: ['citizen'] },
  { href: '/volunteer',    label: 'Volunteer',    roles: ['volunteer', 'admin'] },
  { href: '/leaderboard',  label: 'Leaderboard',  roles: null },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    setUser(token ? decodeToken(token) : null);
    setOpen(false);
  }, [router.pathname]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const isActive = (href) => router.pathname === href;
  const roleInfo = user ? (ROLE_LABEL[user.role] || { label: user.role, badge: 'bg-gray-100 text-gray-700' }) : null;

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
              CC
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight">CivicClick</div>
              <div className="text-[10px] text-gray-400 leading-tight hidden sm:block">Civic &amp; Tourism Safety, Simplified</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {user ? (
              <>
                {NAV_LINKS.filter(({ roles }) => !roles || roles.includes(user.role)).map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(href)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-200">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.badge}`}>
                    {roleInfo.label}
                  </span>
                  <button
                    onClick={logout}
                    className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Login</Link>
                <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ml-1 shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <div className="w-5 space-y-1">
              <span className="block h-0.5 bg-gray-600 transition-all" style={{ transform: open ? 'rotate(45deg) translate(0, 6px)' : 'none' }} />
              <span className="block h-0.5 bg-gray-600 transition-all" style={{ opacity: open ? 0 : 1 }} />
              <span className="block h-0.5 bg-gray-600 transition-all" style={{ transform: open ? 'rotate(-45deg) translate(0, -6px)' : 'none' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1">
          {user ? (
            <>
              {NAV_LINKS.filter(({ roles }) => !roles || roles.includes(user.role)).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(href) ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.badge}`}>{roleInfo.label}</span>
                <button onClick={logout} className="text-xs text-red-500 hover:underline">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Login</Link>
              <Link href="/register" className="block px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
