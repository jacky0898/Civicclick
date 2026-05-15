import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const ROLE_LABEL = {
  citizen:   { label: 'Citizen / Tourist', badge: 'bg-sky-100 text-sky-700' },
  volunteer: { label: 'Local Volunteer',   badge: 'bg-teal-100 text-teal-700' },
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
    <nav
      className="sticky top-0 z-40 border-b border-white/40"
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 2px 16px rgba(14,165,233,0.08), 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' }}
            >
              CC
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight tracking-tight">CivicClick</div>
              <div className="text-[10px] text-sky-500 leading-tight hidden sm:block font-medium">
                Coastal Safety &amp; Tourism Platform
              </div>
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
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(href)
                        ? 'text-white shadow-sm'
                        : 'text-gray-600 hover:text-sky-700 hover:bg-sky-50'
                    }`}
                    style={isActive(href) ? {
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                      boxShadow: '0 2px 8px rgba(14,165,233,0.3)',
                    } : {}}
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
                    className="text-xs text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 px-3 py-1 rounded-xl transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-sky-700 text-sm px-3 py-1.5 rounded-xl hover:bg-sky-50 transition-all duration-200">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-all duration-200 ml-1 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-xl hover:bg-sky-50 transition-colors"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <div className="w-5 space-y-1.5">
              <span className="block h-0.5 bg-gray-600 rounded transition-all" style={{ transform: open ? 'rotate(45deg) translate(0, 8px)' : 'none' }} />
              <span className="block h-0.5 bg-gray-600 rounded transition-all" style={{ opacity: open ? 0 : 1 }} />
              <span className="block h-0.5 bg-gray-600 rounded transition-all" style={{ transform: open ? 'rotate(-45deg) translate(0, -8px)' : 'none' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="sm:hidden border-t border-white/40 px-4 pb-4 pt-2 space-y-1"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)' }}
        >
          {user ? (
            <>
              {NAV_LINKS.filter(({ roles }) => !roles || roles.includes(user.role)).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(href) ? 'text-white' : 'text-gray-600 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                  style={isActive(href) ? { background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' } : {}}
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
              <Link href="/login" className="block px-3 py-2.5 text-sm text-gray-600 hover:bg-sky-50 rounded-xl">Login</Link>
              <Link href="/register" className="block px-3 py-2.5 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-xl">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
