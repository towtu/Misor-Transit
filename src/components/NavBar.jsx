'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/bookings', label: 'My Trips', auth: true },
  { href: '/staff', label: 'Staff Panel', roles: ['STAFF'] },
  { href: '/admin', label: 'Admin', roles: ['ADMIN'] },
];

export default function NavBar() {
  const { user, loading, setAuth, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((data) => setAuth(data.user, token))
        .catch(() => {
          localStorage.removeItem('token');
          useAuthStore.getState().setLoading(false);
        });
    } else {
      useAuthStore.getState().setLoading(false);
    }
  }, [setAuth]);

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    logout();
  };

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.auth && !user) return false;
    if (link.roles && (!user || !link.roles.includes(user.role))) return false;
    return true;
  });

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gradient-brand text-white sticky top-0 z-[500] shadow-lg shadow-blue-950/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-4 4v3m-6 0h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm-2 0h2m12 0h2M7 21h.01M17 21h.01" />
            </svg>
          </div>
          <span className="text-sm font-extrabold tracking-[0.12em] uppercase">MisOrTransit</span>
        </Link>

        {/* Desktop center nav - glassmorphism pill */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center bg-white/10 rounded-full p-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-full ${
                  isActive(link.href)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {user.firstName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{user.firstName} {user.lastName}</p>
                  <p className="text-[10px] text-blue-300 leading-tight capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-blue-200 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-white text-blue-950 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1 animate-fade-in">
          {loading ? null : user ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-blue-500/30 border-2 border-blue-400 flex items-center justify-center text-sm font-bold">
                  {user.firstName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-blue-300">{user.email}</p>
                </div>
              </div>
              {visibleLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href) ? 'bg-blue-600/30 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-blue-300 hover:bg-white/10 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-bold bg-white/10 text-center transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
