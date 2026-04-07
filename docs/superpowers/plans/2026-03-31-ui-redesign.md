# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the entire MisOr Transit app from indigo/purple to a professional teal transit dashboard with sidebar+map layout on home page.

**Architecture:** Pure CSS/className changes across all existing components. No new routes, APIs, or dependencies. The home page gets a structural layout change (sidebar+map split on desktop). All other pages get color/typography/card restyling only.

**Tech Stack:** Next.js 14, React, Tailwind CSS, Leaflet.js, existing inline SVGs

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `tailwind.config.js` | Modify | Add teal color tokens |
| `src/app/globals.css` | Modify | Replace indigo with teal, add grid pattern, add teal pulse |
| `src/app/layout.js` | Modify | Update body bg color |
| `src/components/NavBar.jsx` | Modify | Dark teal header, new wordmark style, teal active states |
| `src/components/map/BusMap.jsx` | Modify | SVG bus markers, teal polyline, grid background, pulse ring |
| `src/components/map/BusCard.jsx` | Modify | Teal accents, shadow cards, capacity bar gradient |
| `src/app/page.js` | Modify | Sidebar+map dashboard layout |
| `src/components/seats/SeatPicker.jsx` | Modify | Teal seat colors |
| `src/components/seats/SeatPickerModal.jsx` | Modify | Teal header, teal buttons, teal step indicators |
| `src/components/booking/BookingCard.jsx` | Modify | Teal fare, teal buttons, shadow cards |
| `src/components/booking/HoldTimer.jsx` | Modify | Minor restyle |
| `src/components/booking/FareDisplay.jsx` | Modify | Teal-tinted card |
| `src/components/auth/LoginForm.jsx` | Modify | Teal focus rings, teal button |
| `src/components/auth/RegisterForm.jsx` | Modify | Teal focus rings, teal buttons, teal type selector |
| `src/app/auth/login/page.js` | Modify | Teal icon, teal shadow |
| `src/app/auth/register/page.js` | Modify | Teal icon, teal shadow |
| `src/app/auth/verify/page.js` | Modify | Teal button, SVG instead of emoji |
| `src/app/bookings/page.js` | Modify | Teal section headers |
| `src/app/booking/[bookingId]/page.js` | Modify | Teal header gradient |
| `src/app/booking/[bookingId]/success/page.js` | Modify | SVG checkmark, teal button |
| `src/app/booking/[bookingId]/cancel/page.js` | Modify | SVG warning, teal button |
| `src/app/admin/page.js` | Modify | Teal tabs, teal buttons |
| `src/components/admin/BusControls.jsx` | Modify | Teal action buttons |
| `src/components/admin/BusManager.jsx` | Modify | Teal button |
| `src/components/admin/VerifyUsers.jsx` | Modify | Teal approve button |

---

### Task 1: Global Design Tokens — Tailwind Config + CSS

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.js`

- [ ] **Step 1: Update tailwind.config.js with teal tokens**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          900: '#0A5C5F',
          800: '#0B6B6F',
          700: '#0D7377',
          600: '#109297',
          500: '#14B8A6',
          400: '#2DD4BF',
          300: '#5EEAD4',
          200: '#99F6E4',
          100: '#CCFBF1',
          50: '#F0FDFA',
        },
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Replace globals.css with teal design system**

Replace the entire `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #F4F6F8;
  --foreground: #1f2937;
  --brand-900: #0A5C5F;
  --brand-700: #0D7377;
  --brand-500: #14B8A6;
  --brand-100: #CCFBF1;
  --brand-50: #F0FDFA;
}

body {
  color: var(--foreground);
  background: var(--background);
}

/* Status indicator pulse - teal */
@keyframes pulse-teal {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.animate-pulse-teal {
  animation: pulse-teal 2s ease-in-out infinite;
}

/* Bus marker radar pulse */
@keyframes radar-ping {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0; }
}

.animate-radar-ping {
  animation: radar-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Slide up from bottom */
@keyframes slide-up {
  from { transform: translateY(100%); opacity: 0.5; }
  to { transform: translateY(0); opacity: 1; }
}

.animate-slide-up {
  animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Fade in and slide up for cards */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
  opacity: 0;
}

/* Stagger delays for grid children */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.1s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.2s; }
.stagger-5 { animation-delay: 0.25s; }
.stagger-6 { animation-delay: 0.3s; }

/* Map fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

/* Shimmer loading skeleton */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-shimmer {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Section heading animation */
@keyframes heading-slide {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-heading {
  animation: heading-slide 0.4s ease-out;
}

/* Countdown timer pulse */
@keyframes timer-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-timer-pulse {
  animation: timer-pulse 1s ease-in-out infinite;
}

/* Teal brand gradient */
.bg-gradient-brand {
  background: linear-gradient(135deg, #0A5C5F 0%, #0D7377 100%);
}

/* Map grid pattern background */
.map-grid-bg {
  background-color: #E5E7EB;
  background-image:
    linear-gradient(rgba(209, 213, 219, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(209, 213, 219, 0.5) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Input focus ring - teal */
.input-field {
  @apply w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white
    focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
    placeholder:text-gray-400 transition-all duration-200;
}

/* Primary button - teal */
.btn-primary {
  @apply bg-brand-700 text-white py-2.5 rounded-xl font-semibold
    hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-700/25 hover:-translate-y-0.5
    active:translate-y-0 active:shadow-md
    transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none;
}

/* Secondary button */
.btn-secondary {
  @apply bg-white text-gray-700 border border-gray-200 py-2.5 rounded-xl font-medium
    hover:bg-gray-50 hover:border-gray-300
    transition-all duration-200;
}
```

- [ ] **Step 3: Update layout.js body background**

In `src/app/layout.js`, change the body className and style:

```jsx
<body className="antialiased min-h-screen bg-[#F4F6F8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
```

- [ ] **Step 4: Verify the app loads without errors**

Run: open `http://localhost:3000` in the browser and confirm no build errors. The page will look partially broken (indigo references in components still exist) — that's expected.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js src/app/globals.css src/app/layout.js
git commit -m "feat: replace indigo design tokens with teal transit brand system"
```

---

### Task 2: NavBar — Dark Teal Header

**Files:**
- Modify: `src/components/NavBar.jsx`

- [ ] **Step 1: Replace NavBar.jsx with teal-branded header**

Replace the entire file with:

```jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/bookings', label: 'My Trips', auth: true },
  { href: '/admin', label: 'Admin', roles: ['STAFF', 'ADMIN'] },
];

export default function NavBar() {
  const { user, loading, setAuth, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then((u) => setAuth(u, token))
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
    <nav className="bg-gradient-brand text-white sticky top-0 z-[500] shadow-lg shadow-black/10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-4 4v3m-6 0h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm-2 0h2m12 0h2M7 21h.01M17 21h.01" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-[0.15em] uppercase">MisOrTransit</span>
        </Link>

        {/* Desktop center nav */}
        <div className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                isActive(link.href)
                  ? 'text-white'
                  : 'text-brand-200 hover:text-white'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-500/30 border-2 border-brand-400 flex items-center justify-center text-xs font-bold text-white">
                  {user.firstName?.[0]}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white leading-tight">{user.firstName}</p>
                  <p className="text-[10px] text-brand-300 leading-tight">{user.role === 'STAFF' || user.role === 'ADMIN' ? user.role : ''}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="ml-2 p-2 rounded-lg hover:bg-white/10 transition-colors text-brand-300 hover:text-white" title="Logout">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-brand-200 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-white text-brand-800 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-50 transition-colors">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
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
                <div className="w-9 h-9 rounded-full bg-brand-500/30 border-2 border-brand-400 flex items-center justify-center text-sm font-bold">
                  {user.firstName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-brand-300">{user.email}</p>
                </div>
              </div>
              {visibleLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href) ? 'bg-white/10 text-white' : 'text-brand-200 hover:bg-white/10 hover:text-white'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-brand-300 hover:bg-white/10 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-brand-200 hover:bg-white/10 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold bg-white/10 text-center rounded-lg transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Verify NavBar renders correctly**

Open `http://localhost:3000` — confirm dark teal header with "MISORTRANSIT" wordmark, nav links, and register button. Check mobile by resizing to 375px.

- [ ] **Step 3: Commit**

```bash
git add src/components/NavBar.jsx
git commit -m "feat: restyle NavBar with dark teal header and transit wordmark"
```

---

### Task 3: BusCard — Teal Accents + Shadow Cards

**Files:**
- Modify: `src/components/map/BusCard.jsx`

- [ ] **Step 1: Replace BusCard.jsx with teal-styled version**

Replace the entire file with:

```jsx
'use client';

const statusConfig = {
  RUNNING: { color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'En Route' },
  PAUSED: { color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', label: 'Paused' },
  PARKED: { color: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-500', label: 'Parked' },
};

const directionLabels = {
  TAGOLOAN_TO_CDO: { from: 'Tagoloan', to: 'Gaisano' },
  CDO_TO_TAGOLOAN: { from: 'Gaisano', to: 'Tagoloan' },
};

export default function BusCard({ bus, onClick }) {
  const status = statusConfig[bus.status] || statusConfig.PARKED;
  const dir = directionLabels[bus.direction] || { from: '—', to: '—' };
  const seatPercent = bus.totalSeats > 0 ? Math.round((bus.availableSeats / bus.totalSeats) * 100) : 0;

  return (
    <button
      onClick={() => onClick(bus)}
      className="w-full text-left rounded-xl p-4 bg-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-out group"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-800 text-[15px] truncate group-hover:text-brand-700 transition-colors">{bus.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {bus.plateNumber} · {bus.busType === 'COASTER' ? 'Coaster' : 'Full Bus'}
          </p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text} flex items-center gap-1.5 flex-shrink-0 ml-2`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.color} ${bus.status === 'RUNNING' ? 'animate-pulse-teal' : ''}`} />
          {status.label}
        </span>
      </div>

      {/* Route direction */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-600">{dir.from}</span>
        <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
        <span className="font-medium text-gray-600">{dir.to}</span>
      </div>

      {/* Current position */}
      {bus.currentStopName && (
        <p className="text-xs text-gray-400 mt-1.5">
          Near <span className="text-gray-500 font-medium">{bus.currentStopName}</span>
          {bus.nextStopName && <span> → {bus.nextStopName}</span>}
        </p>
      )}

      {/* Seats bar */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Available seats</span>
          <span className="text-sm font-bold text-brand-700 tabular-nums">{bus.availableSeats}/{bus.totalSeats}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              seatPercent > 50 ? 'bg-brand-500' : seatPercent > 20 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${seatPercent}%` }}
          />
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Verify bus cards render with teal accents**

Open `http://localhost:3000` — confirm cards have shadow, teal seat counts, and teal capacity bar for high availability.

- [ ] **Step 3: Commit**

```bash
git add src/components/map/BusCard.jsx
git commit -m "feat: restyle BusCard with teal accents and shadow elevation"
```

---

### Task 4: BusMap — SVG Markers + Teal Polyline

**Files:**
- Modify: `src/components/map/BusMap.jsx`

- [ ] **Step 1: Replace BusMap.jsx with teal-styled SVG markers**

Replace the entire file. Key changes: replace emoji bus markers with white circle + SVG bus icon, change polyline to teal, update stop markers to teal for terminals:

```jsx
'use client';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

const STOPS = [
  { name: 'Tagoloan', lat: 8.538466, lng: 124.753925 },
  { name: 'Bugo', lat: 8.506133, lng: 124.753647 },
  { name: 'Puerto', lat: 8.500947, lng: 124.750376 },
  { name: 'Agusan', lat: 8.485274, lng: 124.733203 },
  { name: 'Tablon', lat: 8.480028, lng: 124.725441 },
  { name: 'Baloy', lat: 8.477565, lng: 124.720488 },
  { name: 'Cugman', lat: 8.469894, lng: 124.705183 },
  { name: 'Gusa', lat: 8.474541, lng: 124.685956 },
  { name: 'USTP', lat: 8.484666, lng: 124.656748 },
  { name: 'SM Downtown', lat: 8.485324, lng: 124.653744 },
  { name: 'Gaisano', lat: 8.485766, lng: 124.651613 },
];

const ROAD_SEGMENTS = [
  [[8.538466,124.753925],[8.536683,124.753813],[8.535276,124.753896],[8.533731,124.754010],[8.532614,124.754151],[8.531491,124.754419],[8.529094,124.755356],[8.526842,124.756371],[8.523727,124.757495],[8.521649,124.758193],[8.520718,124.758519],[8.520021,124.758732],[8.519503,124.758823],[8.519060,124.758808],[8.515039,124.757890],[8.514446,124.757715],[8.513898,124.757381],[8.511475,124.755417],[8.511026,124.755169],[8.508394,124.753969],[8.507791,124.753774],[8.507336,124.753684],[8.506702,124.753675],[8.506133,124.753647]],
  [[8.506133,124.753647],[8.505301,124.753765],[8.504594,124.753784],[8.504108,124.753672],[8.503575,124.753310],[8.503006,124.752911],[8.502014,124.751769],[8.500947,124.750376]],
  [[8.500947,124.750376],[8.499805,124.749294],[8.497687,124.747797],[8.495760,124.746227],[8.492034,124.742121],[8.489777,124.739817],[8.488376,124.737826],[8.486564,124.735385],[8.485274,124.733203]],
  [[8.485274,124.733203],[8.483581,124.730592],[8.481323,124.727717],[8.480028,124.725441]],
  [[8.480028,124.725441],[8.478093,124.721893],[8.477565,124.720488]],
  [[8.477565,124.720488],[8.474720,124.714819],[8.474149,124.713917],[8.472561,124.711987],[8.471861,124.711049],[8.471222,124.709893],[8.470638,124.708477],[8.470080,124.706122],[8.469894,124.705183]],
  [[8.469894,124.705183],[8.469670,124.704192],[8.469723,124.703181],[8.472292,124.697373],[8.474597,124.692488],[8.474863,124.691742],[8.474847,124.690413],[8.474722,124.687310],[8.474541,124.685956]],
  [[8.474541,124.685956],[8.474240,124.684044],[8.474226,124.682773],[8.474490,124.681500],[8.475811,124.679355],[8.480969,124.670096],[8.482111,124.667137],[8.482915,124.663896],[8.484236,124.658230],[8.484666,124.656748]],
  [[8.484666,124.656748],[8.485324,124.653744]],
  [[8.485324,124.653744],[8.485766,124.651613]],
];

function measureDistances(coords) {
  const dists = [0];
  for (let i = 1; i < coords.length; i++) {
    const [lat1, lng1] = coords[i - 1];
    const [lat2, lng2] = coords[i];
    const dlat = lat2 - lat1;
    const dlng = lng2 - lng1;
    dists.push(dists[i - 1] + Math.sqrt(dlat * dlat + dlng * dlng));
  }
  return dists;
}

const SEGMENT_DATA = ROAD_SEGMENTS.map((coords) => ({
  coords,
  dists: measureDistances(coords),
}));

const FULL_ROUTE = ROAD_SEGMENTS.reduce((acc, seg, i) => {
  const points = i === 0 ? seg : seg.slice(1);
  return acc.concat(points);
}, []);

const CENTER = [8.505, 124.705];

function interpolateAlongSegment(seg, fraction) {
  const { coords, dists } = seg;
  if (!coords.length) return null;
  const totalLen = dists[dists.length - 1];
  const targetDist = fraction * totalLen;
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetDist) {
      const segLen = dists[i] - dists[i - 1];
      const t = segLen > 0 ? (targetDist - dists[i - 1]) / segLen : 0;
      return [
        coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * t,
        coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * t,
      ];
    }
  }
  return coords[coords.length - 1];
}

function getBusRoadPosition(bus) {
  const stopIdx = bus.currentStopIdx;
  const frac = bus.fracToNext || 0;
  const dir = bus.computedDirection || bus.direction;
  const dirSign = dir === 'TAGOLOAN_TO_CDO' ? 1 : -1;
  const nextIdx = stopIdx + dirSign;

  if (frac === 0 || nextIdx < 0 || nextIdx >= STOPS.length) {
    return [bus.lat, bus.lng];
  }

  const segIdx = Math.min(stopIdx, nextIdx);
  const seg = SEGMENT_DATA[segIdx];
  if (!seg) return [bus.lat, bus.lng];

  const actualFrac = dir === 'TAGOLOAN_TO_CDO' ? frac : 1 - frac;
  return interpolateAlongSegment(seg, actualFrac);
}

function createBusIcon(bus) {
  return L.divIcon({
    html: `
      <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(13,115,119,0.15);animation:radar-ping 2s cubic-bezier(0,0,0.2,1) infinite"></div>
        <div style="width:36px;height:36px;background:white;border-radius:50%;border:3px solid #0D7377;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);position:relative;z-index:1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D7377" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6m0 0v6m0-6h8m-8 0H4m4-6h8a2 2 0 012 2v2a2 2 0 01-2 2H8M6 20h.01M18 20h.01M4 12h16"/>
            <rect x="3" y="4" width="18" height="14" rx="2"/>
            <path d="M7 18v2m10-2v2"/>
          </svg>
        </div>
      </div>
    `,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

// Inject radar-ping keyframes into page once
if (typeof document !== 'undefined') {
  const styleId = 'bus-marker-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `@keyframes radar-ping{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}`;
    document.head.appendChild(style);
  }
}

function BusMarkers({ buses, onBusClick }) {
  const map = useMap();
  const markersRef = useRef({});

  useEffect(() => {
    buses.forEach((bus) => {
      if (!bus.lat || !bus.lng) return;
      const pos = getBusRoadPosition(bus);
      const existing = markersRef.current[bus.id];
      if (existing) {
        existing.setLatLng(pos);
        existing.setIcon(createBusIcon(bus));
      } else {
        const marker = L.marker(pos, { icon: createBusIcon(bus) })
          .addTo(map)
          .bindTooltip(`<div style="font-weight:600;font-size:12px;color:#0A5C5F">${bus.name}</div>`, {
            direction: 'top',
            offset: [0, -24],
            className: 'bus-tooltip',
          });
        marker.on('click', () => onBusClick(bus));
        markersRef.current[bus.id] = marker;
      }
    });

    const busIds = new Set(buses.map((b) => b.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!busIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [buses, map, onBusClick]);

  return null;
}

export default function BusMap({ buses, onBusClick }) {
  return (
    <MapContainer
      center={CENTER}
      zoom={12}
      className="w-full h-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      <Polyline positions={FULL_ROUTE} color="#0D7377" weight={4} opacity={0.7} dashArray="8 6" />
      {STOPS.map((stop, i) => {
        const isTerminal = i === 0 || i === STOPS.length - 1;
        return (
          <CircleMarker
            key={i}
            center={[stop.lat, stop.lng]}
            radius={isTerminal ? 8 : 5}
            fillColor={isTerminal ? '#0D7377' : '#9CA3AF'}
            fillOpacity={0.9}
            color="#fff"
            weight={2}
          >
            <Tooltip permanent={isTerminal} direction="bottom" offset={[0, 8]}>
              {stop.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
      <BusMarkers buses={buses} onBusClick={onBusClick} />
    </MapContainer>
  );
}
```

- [ ] **Step 2: Verify map renders with SVG bus markers and teal route**

Open `http://localhost:3000` — confirm teal dashed route line, teal terminal dots, white circle bus markers with teal border and radar pulse.

- [ ] **Step 3: Commit**

```bash
git add src/components/map/BusMap.jsx
git commit -m "feat: replace emoji bus markers with SVG circles, teal polyline"
```

---

### Task 5: Home Page — Sidebar + Map Dashboard Layout

**Files:**
- Modify: `src/app/page.js`

- [ ] **Step 1: Replace page.js with sidebar+map dashboard layout**

Replace the entire file with:

```jsx
'use client';
import dynamic from 'next/dynamic';
import useBusPolling from '@/hooks/useBusPolling';
import BusCard from '@/components/map/BusCard';
import SeatPickerModal from '@/components/seats/SeatPickerModal';
import { useMapStore } from '@/lib/store';

const BusMap = dynamic(() => import('@/components/map/BusMap'), { ssr: false });

export default function HomePage() {
  const { buses, loading } = useBusPolling(4000);
  const { selectedBus, showSeatPicker, selectBus, closeSeatPicker } = useMapStore();

  const activeBuses = buses.filter((b) => b.status === 'RUNNING' || b.status === 'PAUSED');
  const parkedBuses = buses.filter((b) => b.status === 'PARKED');

  const Sidebar = () => (
    <div className="p-4 space-y-5">
      {/* Quick Stats */}
      {!loading && buses.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-brand-700">{activeBuses.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Active</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-brand-700">{buses.reduce((a, b) => a + (b.availableSeats || 0), 0)}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Seats</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 text-center">
            <p className="text-xl font-bold text-gray-600">{buses.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Fleet</p>
          </div>
        </div>
      )}

      {/* Active Buses */}
      {activeBuses.length > 0 && (
        <div>
          <h2 className="text-[10px] font-bold text-green-600 uppercase tracking-[0.15em] mb-3 animate-heading flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-teal" />
            Active Buses
          </h2>
          <div className="space-y-3">
            {activeBuses.map((bus, i) => (
              <div key={bus.id} className={`animate-fade-in-up stagger-${i + 1}`}>
                <BusCard bus={bus} onClick={selectBus} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parked Buses */}
      {parkedBuses.length > 0 && (
        <div>
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3 animate-heading flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            Parked
          </h2>
          <div className="space-y-3">
            {parkedBuses.map((bus, i) => (
              <div key={bus.id} className={`animate-fade-in-up stagger-${i + 1}`}>
                <BusCard bus={bus} onClick={selectBus} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && buses.length === 0 && (
        <div className="text-center py-16 animate-fade-in-up">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-4 4v3m-6 0h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm-2 0h2m12 0h2" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No buses available yet</p>
          <p className="text-gray-300 text-xs mt-1">Staff needs to seed data first</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block w-[400px] flex-shrink-0 bg-white shadow-lg overflow-y-auto border-r border-gray-100">
        <Sidebar />
      </aside>

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-gray-100 map-grid-bg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading map...</p>
            </div>
          </div>
        ) : (
          <BusMap buses={buses} onBusClick={selectBus} />
        )}
      </div>

      {/* Mobile cards — below map */}
      <div className="lg:hidden overflow-y-auto bg-[#F4F6F8]" style={{ maxHeight: '50vh' }}>
        <Sidebar />
      </div>

      {showSeatPicker && selectedBus && (
        <SeatPickerModal bus={selectedBus} onClose={closeSeatPicker} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify dashboard layout**

Desktop (>=1024px): sidebar on left, map fills right. Mobile: map on top, cards scroll below. Confirm stats show teal numbers.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.js
git commit -m "feat: restructure home page as sidebar+map dashboard layout"
```

---

### Task 6: SeatPicker + SeatPickerModal — Teal Theme

**Files:**
- Modify: `src/components/seats/SeatPicker.jsx`
- Modify: `src/components/seats/SeatPickerModal.jsx`

- [ ] **Step 1: Update SeatPicker.jsx seat colors to teal**

In `src/components/seats/SeatPicker.jsx`, make these replacements:

1. Replace `bg-indigo-600 ring-2 ring-indigo-400` with `bg-brand-800 ring-2 ring-brand-400` (selected seat)
2. Replace `bg-emerald-500 hover:bg-emerald-600` with `bg-brand-500 hover:bg-brand-600` (available seat)
3. Replace all `bg-amber-400` with `bg-orange-400` (on-hold seat)
4. In the legend, replace `bg-emerald-500` with `bg-brand-500` and `bg-indigo-600` with `bg-brand-800` and `bg-amber-400` with `bg-orange-400`

- [ ] **Step 2: Update SeatPickerModal.jsx to teal theme**

In `src/components/seats/SeatPickerModal.jsx`, make these replacements throughout the file:

1. Replace all `bg-indigo-600` with `bg-brand-700`
2. Replace all `hover:bg-indigo-700` with `hover:bg-brand-800`
3. Replace all `bg-indigo-500` with `bg-brand-600`
4. Replace all `text-indigo-600` with `text-brand-700`
5. Replace all `text-indigo-700` with `text-brand-800`
6. Replace all `border-indigo-500` with `border-brand-500`
7. Replace all `border-indigo-200` with `border-brand-200`
8. Replace all `ring-indigo` with `ring-brand`
9. Replace all `bg-indigo-50` with `bg-brand-50`
10. Replace all `shadow-indigo` with `shadow-brand`
11. Replace `bg-emerald-600` with `bg-brand-700` and `hover:bg-emerald-700` with `hover:bg-brand-800` (for the confirm/hold/pay buttons)
12. Replace `shadow-emerald` with `shadow-brand`
13. Replace the modal backdrop `bg-black/50` with `bg-black/40 backdrop-blur-sm`

Also update the step indicator circles:
- Completed step: `bg-brand-600` with white checkmark
- Current step: `border-brand-600 text-brand-600`
- Future step: `border-gray-300 text-gray-300`

And the modal header area — replace the gradient or indigo top section with:
```jsx
<div className="bg-brand-800 rounded-t-2xl p-4 text-white">
```

- [ ] **Step 3: Verify seat picker renders with teal colors**

Click a bus card on the home page. Confirm: teal header in modal, teal available seats, teal step indicators, teal buttons.

- [ ] **Step 4: Commit**

```bash
git add src/components/seats/SeatPicker.jsx src/components/seats/SeatPickerModal.jsx
git commit -m "feat: restyle seat picker modal with teal theme"
```

---

### Task 7: Booking Components — Teal Theme

**Files:**
- Modify: `src/components/booking/BookingCard.jsx`
- Modify: `src/components/booking/HoldTimer.jsx`
- Modify: `src/components/booking/FareDisplay.jsx`

- [ ] **Step 1: Update BookingCard.jsx**

Replace all indigo references:
1. `text-indigo-600` → `text-brand-700` (fare display)
2. `bg-indigo-600` → `bg-brand-700` (Pay Now button)
3. `hover:bg-indigo-700` → `hover:bg-brand-800`
4. `border-indigo` → `border-brand`
5. Change card wrapper from `border border-slate-100` to just `shadow-md` (shadow instead of border)
6. Replace `rounded-2xl` with `rounded-xl`
7. Replace `slate-` color references with `gray-` equivalents

- [ ] **Step 2: Update HoldTimer.jsx**

Replace `rounded-2xl` with `rounded-xl`. Replace any `slate-` references with `gray-` equivalents. The orange/red status colors stay the same.

- [ ] **Step 3: Update FareDisplay.jsx**

Replace `bg-emerald-50 border-emerald-200 text-emerald-800` with `bg-brand-50 border-brand-200 text-brand-800`. Replace `text-emerald-600` with `text-brand-700`.

- [ ] **Step 4: Verify booking components**

Navigate to `/bookings` (requires login) or check BookingCard rendering. Confirm teal fare color, teal pay button.

- [ ] **Step 5: Commit**

```bash
git add src/components/booking/BookingCard.jsx src/components/booking/HoldTimer.jsx src/components/booking/FareDisplay.jsx
git commit -m "feat: restyle booking components with teal theme"
```

---

### Task 8: Auth Pages — Teal Branding

**Files:**
- Modify: `src/app/auth/login/page.js`
- Modify: `src/app/auth/register/page.js`
- Modify: `src/app/auth/verify/page.js`
- Modify: `src/components/auth/LoginForm.jsx`
- Modify: `src/components/auth/RegisterForm.jsx`

- [ ] **Step 1: Update login/page.js**

Replace `bg-gradient-brand` (which is now teal) — this should already work. Replace `shadow-indigo-500/20` with `shadow-brand-700/20`.

- [ ] **Step 2: Update register/page.js**

Same changes as login page — replace `shadow-indigo-500/20` with `shadow-brand-700/20`.

- [ ] **Step 3: Update verify/page.js**

1. Replace the clipboard emoji `📋` in success state with an SVG checkmark:
```jsx
<div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
  <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</div>
```
2. Replace `text-indigo-600` with `text-brand-700`
3. Replace `bg-indigo-600` with `bg-brand-700` and `hover:bg-indigo-700` with `hover:bg-brand-800`
4. Replace `focus:ring-indigo-400` with `focus:ring-brand-400`

- [ ] **Step 4: Update LoginForm.jsx**

Replace all indigo references:
1. `bg-indigo-600` → `bg-brand-700`
2. `hover:bg-indigo-700` → `hover:bg-brand-800`
3. `text-indigo-600` → `text-brand-700`
4. `focus:ring-indigo` → `focus:ring-brand`
5. Replace any `btn-primary` usage (already updated in globals.css) or inline indigo classes

- [ ] **Step 5: Update RegisterForm.jsx**

Same indigo → brand replacements as LoginForm. Additionally update the passenger type selection buttons:
1. Selected type: `border-brand-500 bg-brand-50`
2. Unselected type: `border-gray-200 hover:border-brand-200`
3. Discount text: `text-brand-600`
4. Warning banner: keep amber/yellow — no change needed

- [ ] **Step 6: Verify auth pages**

Open `/auth/login` and `/auth/register`. Confirm teal icons, teal buttons, teal focus rings. Register page should show teal-bordered selected passenger type.

- [ ] **Step 7: Commit**

```bash
git add src/app/auth/login/page.js src/app/auth/register/page.js src/app/auth/verify/page.js src/components/auth/LoginForm.jsx src/components/auth/RegisterForm.jsx
git commit -m "feat: restyle auth pages with teal branding"
```

---

### Task 9: Bookings & Booking Detail Pages — Teal Theme

**Files:**
- Modify: `src/app/bookings/page.js`
- Modify: `src/app/booking/[bookingId]/page.js`
- Modify: `src/app/booking/[bookingId]/success/page.js`
- Modify: `src/app/booking/[bookingId]/cancel/page.js`

- [ ] **Step 1: Update bookings/page.js**

1. Replace `border-indigo-400` spinner with `border-brand-500`
2. Replace `text-indigo-600` with `text-brand-700` (Book New link)
3. Replace `text-emerald-600` with `text-green-600` (Active section header)
4. Replace `bg-emerald-500` with `bg-green-500` (Active dot)
5. Replace `bg-slate-` with `bg-gray-` equivalents

- [ ] **Step 2: Update booking/[bookingId]/page.js**

1. Replace `bg-gradient-brand` header (already teal from globals.css update)
2. Replace `text-indigo-200` with `text-brand-200`
3. Replace `text-indigo-600` with `text-brand-700`
4. Replace `bg-emerald-600` Pay Now button with `bg-brand-700 hover:bg-brand-800`
5. Replace `shadow-emerald-500/25` with `shadow-brand-700/25`
6. Replace all `slate-` with `gray-` equivalents

- [ ] **Step 3: Update success/page.js**

Replace emoji and indigo:
```jsx
<div className="min-h-[80vh] flex items-center justify-center px-4">
  <div className="text-center max-w-sm">
    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
    <p className="text-gray-500 mb-6">Your seat has been confirmed. Show your QR ticket when boarding.</p>
    <div className="flex flex-col gap-2">
      <Link href={`/booking/${bookingId}`}
        className="bg-brand-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-800 transition">
        View My Ticket
      </Link>
      <Link href="/bookings" className="text-brand-700 hover:underline text-sm font-medium">
        All My Tickets
      </Link>
      <Link href="/" className="text-gray-500 hover:underline text-sm">
        Back to Home
      </Link>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Update cancel/page.js**

Replace emoji and indigo:
```jsx
<div className="min-h-[80vh] flex items-center justify-center px-4">
  <div className="text-center max-w-sm">
    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h1>
    <p className="text-gray-500 mb-6">Your seat is still on hold. You can try paying again before the hold expires.</p>
    <div className="flex flex-col gap-2">
      <Link href={`/booking/${bookingId}`}
        className="bg-brand-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-800 transition">
        Try Again
      </Link>
      <Link href="/" className="text-gray-500 hover:underline text-sm">
        Back to Home
      </Link>
    </div>
  </div>
</div>
```

- [ ] **Step 5: Verify all booking pages**

Check `/bookings`, click through to detail page, check success and cancel pages for teal buttons and SVG icons.

- [ ] **Step 6: Commit**

```bash
git add src/app/bookings/page.js src/app/booking/
git commit -m "feat: restyle booking pages with teal theme, replace emoji with SVG"
```

---

### Task 10: Admin Page — Teal Theme

**Files:**
- Modify: `src/app/admin/page.js`
- Modify: `src/components/admin/BusControls.jsx`
- Modify: `src/components/admin/BusManager.jsx`
- Modify: `src/components/admin/VerifyUsers.jsx`

- [ ] **Step 1: Update admin/page.js**

1. Replace `border-indigo-600` active tab with `border-brand-600`
2. Replace `text-indigo-700` with `text-brand-700`
3. Replace `bg-indigo-600` buttons with `bg-brand-700`
4. Replace `hover:bg-indigo-700` with `hover:bg-brand-800`
5. Replace `focus:ring-indigo-500` with `focus:ring-brand-500`
6. Replace `text-slate-` with `text-gray-` equivalents
7. Replace `bg-slate-` with `bg-gray-` equivalents

- [ ] **Step 2: Update BusControls.jsx**

1. Replace all `bg-indigo-600` with `bg-brand-700`
2. Replace `hover:bg-indigo-700` with `hover:bg-brand-800`
3. Replace `bg-emerald-600` with `bg-green-600` (Start button — keep green for semantic clarity)
4. Replace `bg-amber-600` with `bg-orange-500` (Pause)
5. Replace `slate-` with `gray-` equivalents
6. For the speed slider accent color, add `accent-brand-600` class

- [ ] **Step 3: Update BusManager.jsx**

1. Replace `bg-indigo-600` with `bg-brand-700`
2. Replace `hover:bg-indigo-700` with `hover:bg-brand-800`
3. Replace `focus:ring-indigo` with `focus:ring-brand`

- [ ] **Step 4: Update VerifyUsers.jsx**

1. Approve button: `bg-brand-700 hover:bg-brand-800`
2. Reject button: `bg-red-600 hover:bg-red-700` (keep red for destructive action)
3. Replace `text-indigo-600` link with `text-brand-700`

- [ ] **Step 5: Verify admin page**

Navigate to `/admin` (requires staff login). Confirm teal active tab, teal buttons on bus controls, teal approve button on verify.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/page.js src/components/admin/
git commit -m "feat: restyle admin page with teal theme"
```

---

### Task 11: Final Visual Verification

**Files:** None (verification only)

- [ ] **Step 1: Full-page screenshot comparison**

Take screenshots of all pages at 1440x900:
- Home (desktop dashboard layout)
- Home (375x812 mobile)
- Login
- Register
- Bookings (if accessible)
- Admin (if accessible)
- Seat picker modal (click a bus)

- [ ] **Step 2: Check for any remaining indigo/purple references**

Run: `grep -r "indigo\|#4f46e5\|#7c3aed\|#6366f1\|#818cf8\|slate-" src/ --include="*.jsx" --include="*.js" --include="*.css" -l`

Any files returned need indigo→brand or slate→gray cleanup.

- [ ] **Step 3: Fix any remaining references found in Step 2**

Update the files and commit.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: clean up remaining indigo/slate references"
```
