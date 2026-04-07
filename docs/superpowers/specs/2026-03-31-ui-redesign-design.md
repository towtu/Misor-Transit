# MisOr Transit — UI/UX Redesign Spec

## Overview

Full visual redesign of all pages from indigo/purple generic Tailwind to a professional teal-branded transit dashboard. No new features — only restyling existing functionality.

## 1. Global Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--teal-900` | `#0A5C5F` | Nav header background |
| `--teal-700` | `#0D7377` | Primary buttons, active states, links |
| `--teal-500` | `#14B8A6` | Hover states, progress bars |
| `--teal-100` | `#E0F5F5` | Selected highlights, light teal cards |
| `--teal-50` | `#F0FDFA` | Subtle teal tint backgrounds |
| `--bg` | `#F4F6F8` | Main app background (off-white) |
| `--surface` | `#FFFFFF` | Cards, panels, modals |
| `--green-500` | `#22C55E` | Confirmed, active, on-time status |
| `--orange-500` | `#F59E0B` | On-hold, warnings, capacity alerts |
| `--red-500` | `#EF4444` | Cancelled, errors, destructive actions |
| `--gray-700` | `#374151` | Primary text |
| `--gray-500` | `#6B7280` | Secondary text |
| `--gray-300` | `#D1D5DB` | Borders, inactive elements |
| `--gray-100` | `#F3F4F6` | Subtle backgrounds |

### Typography

- **Font**: Inter (already loaded via Google Fonts)
- **Heading**: 600-700 weight, `text-gray-800`
- **Body**: 400 weight, `text-gray-700`
- **Labels**: 12px, 700 weight, uppercase, `tracking-widest`, `text-gray-500`
- **Data/numbers**: 500-700 weight, tabular figures
- **Base size**: 16px body, 14px secondary, 12px labels

### Spacing & Elevation

- 8px spacing scale: 4, 8, 12, 16, 24, 32, 48
- Cards: `rounded-xl`, `shadow-md`, no borders (depth from shadow alone)
- Modals: `shadow-2xl`
- Hover cards: `shadow-lg` transition
- No emoji icons anywhere — all SVG (Heroicons inline, already used in most places)

### Animations

- Card entrance: `fade-in-up` with stagger (keep existing)
- Bus pulse: teal ring pulse on map markers (replace green pulse)
- Hover: `translateY(-2px)` + `shadow-lg` transition (keep existing pattern)
- Modal: slide-up from bottom (keep existing)
- Duration: 150-300ms, ease-out

## 2. Top Navigation Header

**All pages share this header.**

### Desktop (>=768px)

- Full-width, fixed top, `h-16`
- Background: `--teal-900` (deep dark teal)
- **Left**: "MISORTRANSIT" wordmark — all caps, `text-sm font-bold tracking-[0.2em]`, white. Bus SVG icon in a `bg-white/15 rounded-lg p-1.5` box to the left.
- **Center**: Nav links — "Dashboard", "My Trips". Active link: white, `font-semibold`, thick `border-b-2 border-white` at bottom edge. Inactive: `text-teal-200 hover:text-white`.
- **Right (guest)**: "Sign In" text link (white) + "Register" button (`bg-white text-teal-800 font-semibold rounded-lg px-4 py-1.5`).
- **Right (logged in)**: User name + role text (small, `text-teal-200`). Circular avatar `w-8 h-8 rounded-full border-2 border-teal-400` with first initial. Logout icon button.

### Mobile (<768px)

- Same dark teal background, `h-14`
- Left: "MISORTRANSIT" wordmark (smaller)
- Right: Hamburger menu icon (white)
- Slide-down panel: dark teal background, nav links stacked vertically, user info at bottom

## 3. Home Page — Dashboard Layout

### Desktop (>=1024px)

Two-panel horizontal split, full viewport height minus header:

```
[Header ─────────────────────────────────────]
[Sidebar 400px  │  Map (fills remaining)     ]
[               │                             ]
[               │                             ]
[               │                             ]
```

- **Left sidebar**: `w-[400px]`, white background, `shadow-lg`, scrollable, `overflow-y-auto`
- **Map area**: fills remaining width, full height

### Tablet (768px-1023px)

- Sidebar: `w-[340px]`
- Map: fills remaining

### Mobile (<768px)

Stacked vertically:
```
[Header]
[Map — 50vh]
[Cards — scrollable below]
```

No sidebar panel — bus cards and stats render as full-width scrollable content below the map.

### Sidebar Contents

#### Quick Stats Row
Three compact stat blocks in a horizontal row:
- White card, `rounded-lg`, `shadow-sm`, `p-3`
- Number: `text-xl font-bold text-teal-700`
- Label: `text-[10px] font-bold uppercase tracking-widest text-gray-400`
- Values: Active Buses count, Seats Available count, Total Fleet count

#### Bus List
Section header: `text-xs font-bold uppercase tracking-widest` with colored dot indicator.

Each bus card:
- White card, `rounded-xl`, `shadow-md`, `p-4`, cursor-pointer
- Hover: `shadow-lg`, `translateY(-1px)`
- **Top row**: Bus name (`font-semibold text-gray-800`) + plate number (`text-xs text-gray-400`). Status badge right-aligned: green pill for RUNNING, orange for PAUSED, gray for PARKED
- **Route row**: Pickup stop → Dropoff stop with arrow SVG between them, `text-sm text-gray-600`
- **Current stop**: `text-xs text-gray-400`, "Near {stopName}"
- **Capacity bar**: Full-width progress bar. Background: `bg-gray-100 rounded-full h-1.5`. Fill: teal gradient. When >75% full, fill shifts to orange. Label above: "Available seats" left, "30/30" right, both `text-xs`
- Click opens SeatPickerModal

### Map Area

- Background: `bg-gray-100` with subtle CSS grid pattern overlay (light gray lines, ~40px spacing)
- **Route polyline**: Traveled portion = `#9CA3AF` solid 3px. Upcoming = `#0D7377` dashed 3px
- **Stop markers**: White pill badges (`bg-white rounded-full px-2 py-1 shadow-md text-xs font-medium`). Small colored dot before name: teal for terminals, gray for intermediate stops
- **Bus markers** (replacing emoji):
  - White circle `w-10 h-10 rounded-full bg-white shadow-lg border-2 border-teal-600`
  - Bus SVG icon centered inside, `text-teal-600`
  - Subtle pulse ring animation behind: `teal-200` ring that scales out and fades
  - Dark teal tooltip above: `bg-teal-800 text-white text-xs rounded-md px-2 py-1 shadow-md` showing bus name
- **Zoom controls**: Bottom-right, vertical white pill `rounded-xl shadow-md`, "+" and "-" buttons separated by thin gray line

## 4. Seat Picker Modal

Same 3-step flow (Terminal > Seat > Confirm), restyled:

### Modal Container
- Backdrop: `bg-black/40 backdrop-blur-sm`
- Modal card: `bg-white rounded-2xl shadow-2xl`, max-width 480px, centered on desktop, slides up from bottom on mobile
- Close button: top-right, `text-gray-400 hover:text-gray-600`

### Header
- Dark teal strip at top of modal: `bg-teal-800 rounded-t-2xl p-4`
- Bus name in white, plate number in `text-teal-200`
- Step indicator below: 3 circles connected by lines. Completed = solid teal with white checkmark. Current = teal ring. Future = gray ring

### Step 1: Boarding Terminal
- Section label: "Boarding Terminal" — uppercase, small, bold, gray
- Two terminal buttons: white cards with `border-2`. Selected = `border-teal-500 bg-teal-50`. Unselected = `border-gray-200`
- Terminal icon (T or destination icon) + terminal name inside each

### Step 2: Route & Seat Selection
- Pickup/dropoff stop selectors: white cards, selected = teal border
- Seat grid:
  - Available: `bg-teal-500 text-white hover:bg-teal-600`
  - Selected: `bg-teal-800 text-white ring-2 ring-teal-400 scale-105`
  - On-hold: `bg-orange-400 text-white`
  - Booked: `bg-gray-300 text-gray-500 cursor-not-allowed`
  - Disabled: `bg-gray-100 text-gray-300`
- Seat labels: `text-xs font-semibold`
- "FRONT" indicator at top of seat grid
- Aisle gap between columns 2 and 3
- Legend row below grid with small colored squares + labels

### Step 3: Confirmation
- Summary card with teal-tinted background
- Fare display: large bold `text-teal-700`
- Discount info: green-tinted card if applicable (same FareDisplay component, recolored)
- Guest name input if not logged in
- Hold timer: orange/red background (keep existing logic, just restyle border radius)
- "Confirm & Hold Seat" button: `bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl py-3 w-full`
- "Pay Now" / "Pay Later" secondary buttons

## 5. Auth Pages (Login, Register, Verify)

### Layout
- Full viewport, centered card
- Background: `bg-[#F4F6F8]`
- Card: `bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full`

### Branding
- Top icon: `bg-teal-700 rounded-2xl w-14 h-14` with white SVG icon inside (user icon for login, user-plus for register)
- Shadow: `shadow-lg shadow-teal-700/20`
- Title: `text-2xl font-bold text-gray-800`
- Subtitle: `text-sm text-gray-400`

### Form Inputs
- Label: `text-sm font-medium text-gray-600`
- Input: `border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-400 focus:border-teal-400`
- Error: `bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-2 text-sm`

### Buttons
- Primary: `bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-xl py-2.5 w-full`
- Links: `text-teal-600 hover:text-teal-700 font-medium`

### Register Extras
- Passenger type buttons: same card-select pattern as terminal selection. Selected = teal border + teal-50 bg
- Discount labels inside type buttons: `text-xs text-teal-600`

### Verify Page
- Same card layout, teal button, teal focus rings
- Success state: teal checkmark SVG instead of clipboard emoji

## 6. Bookings Page ("My Trips")

### Desktop Layout
Same sidebar + main area pattern:
```
[Header]
[Booking List (sidebar) │ Selected Booking Detail (main)]
```

- Sidebar: list of booking cards, scrollable
- Main area: expanded detail of selected booking (or empty state prompting selection)

**Simplification**: If implementing the split view adds significant complexity, fall back to a single-column stacked list (same as current) with teal restyling. The priority is the color/card/typography update, not layout restructuring on this page.

### Mobile Layout
Single column, stacked booking cards.

### Booking Card
- White card, `rounded-xl`, `shadow-md`, `p-4`
- Top row: bus name + status badge (green/orange/red/gray pill)
- Route: pickup → dropoff with arrow
- Fare: `text-lg font-bold text-teal-700`
- Reference code: `font-mono text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded`
- QR code: displayed in a `bg-gray-50 rounded-xl p-4` box for confirmed bookings
- Actions: "Pay Now" = solid teal button, "Cancel" = outlined red button
- Timestamp: `text-xs text-gray-400`

### Section Headers
- Active: `text-xs font-bold uppercase tracking-widest text-green-600` with green dot
- Past: same pattern but `text-gray-400` with gray dot

### Booking Detail (if split view)
- Same card as current `booking/[bookingId]/page.js` but with teal header gradient instead of indigo
- Status badge, fare, seat, route, QR code, hold timer, pay button — all restyled to teal system

## 7. Admin Page

### Layout
- Standard content layout below header (no sidebar split needed)
- `max-w-6xl mx-auto px-6 py-6`

### Tabs
- Horizontal tab bar with teal underline on active
- Active: `text-teal-700 font-semibold border-b-2 border-teal-600`
- Inactive: `text-gray-500 hover:text-gray-700`

### Bus Controls Cards
- White card, `rounded-xl`, `shadow-md`
- Bus name bold, status badge, info rows
- Action buttons: teal primary, white/gray secondary
- Speed slider: teal accent color on track fill
- 2-column grid on desktop, single column on mobile

### Bookings Table
- White card container with `rounded-xl shadow-md overflow-hidden`
- Table header row: `bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500`
- Table rows: `border-b border-gray-100`, hover `bg-gray-50`
- Search input: teal focus ring

### Verify Users
- User cards with approve (teal) / reject (red outlined) buttons
- ID image link: `text-teal-600`

### Seed Section
- White card, teal "Run Seed" button, feedback text below

## 8. Success & Cancel Pages

### Payment Success (`booking/[bookingId]/success`)
- Centered layout
- Large teal checkmark SVG in a `bg-teal-50 rounded-full w-20 h-20` circle (replaces party emoji)
- "Payment Successful!" heading
- "View My Ticket" = solid teal button
- Secondary links in `text-teal-600`

### Payment Cancel (`booking/[bookingId]/cancel`)
- Same layout
- Orange/amber warning SVG icon in `bg-orange-50 rounded-full` circle (replaces sad emoji)
- "Try Again" = solid teal button

## 9. Files to Modify

All changes are CSS/className updates + SVG icon replacements. No API changes, no new routes, no schema changes.

| File | Changes |
|------|---------|
| `globals.css` | Replace indigo gradient utilities with teal. Add grid pattern CSS. Update custom animations to teal |
| `tailwind.config.js` | Add teal color tokens to theme.extend |
| `layout.js` | Change body bg to `#F4F6F8` |
| `NavBar.jsx` | Full restyle: dark teal header, new wordmark, teal active states |
| `page.js` (home) | Restructure to sidebar + map layout. Restyle stats and bus list |
| `BusMap.jsx` | Replace emoji markers with SVG circle markers. Add grid pattern background. Restyle polyline colors. Add pulse ring animation |
| `BusCard.jsx` | Restyle: teal accents, shadow cards, capacity bar gradient |
| `SeatPickerModal.jsx` | Restyle: teal header, teal seats, teal buttons, step indicators |
| `SeatPicker.jsx` | Restyle seat colors to teal/orange/gray system |
| `BookingCard.jsx` | Restyle: teal fare, teal buttons, shadow cards |
| `HoldTimer.jsx` | Keep orange/red logic, minor border-radius update |
| `FareDisplay.jsx` | Restyle to teal-tinted card |
| `LoginForm.jsx` | Teal focus rings, teal button |
| `RegisterForm.jsx` | Teal focus rings, teal button, teal type selector |
| `login/page.js` | Teal icon, teal shadow |
| `register/page.js` | Teal icon, teal shadow |
| `verify/page.js` | Teal button, SVG instead of emoji |
| `bookings/page.js` | Teal section headers, teal accents |
| `booking/[bookingId]/page.js` | Teal header gradient, teal buttons |
| `success/page.js` | SVG checkmark instead of emoji, teal button |
| `cancel/page.js` | SVG warning instead of emoji, teal button |
| `admin/page.js` | Teal tabs, teal buttons |
| `BusControls.jsx` | Teal action buttons, teal slider |
| `BusManager.jsx` | Teal button, teal focus rings |
| `VerifyUsers.jsx` | Teal approve button, red reject button |

## 10. What Is NOT Changing

- No new pages or routes
- No new API endpoints
- No new database fields
- No new npm dependencies (all SVG inline, all Tailwind)
- No boarding/dropping counts
- No ETA countdown timers
- No speed display on bus tooltips
- No "Premium Member" tiers
- No notification bell
- No share ETA feature
- Same 3-step booking flow
- Same polling intervals
- Same Leaflet + CARTO tiles
