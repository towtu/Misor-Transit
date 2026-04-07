# MisOr Transit — Bus Seat Reservation & Booking System

A real-time bus seat reservation and booking system for the **Tagoloan ↔ Cagayan de Oro** route in Misamis Oriental, Philippines. Passengers can reserve seats online, pay via GCash / Maya / Card or pay cash on board. Staff manage their bus live from a dedicated panel.

---

## Features

- **Live bus tracking** — real-time seat availability across 5 buses on the route
- **Route-aware booking** — only shows stops the bus hasn't passed yet
- **Fair pricing** — verified students, seniors, and PWDs get discounted fares
- **Two payment options** — pay online (instant QR ticket) or pay cash on board (downloadable PDF ticket)
- **Staff panel** — passcode-protected bus management, live seat map, e-cash & cash passenger lists
- **Discount protection** — one active discounted booking per verified user at a time
- **Auto seat release** — held seats auto-cancel if user closes without paying

---

## Screenshots

### 1. Dashboard — Live Bus Map & Fleet

Browse active buses on the live map. See available seats, current stop, and direction at a glance.

![Dashboard](public/screenshots/01-dashboard.png)

---

### 2. Step 1 — Route Selection

Pick your boarding and drop-off stop. Fare is calculated instantly based on distance and passenger type.

![Route Selection](public/screenshots/02-booking-route.png)

---

### 3. Step 2 — Seat Selection

Visual seat map of the bus interior. Available seats are gray, held seats are amber, booked seats are blue.

![Seat Picker](public/screenshots/03-seat-picker.png)

---

### 4. Step 3 — Payment Choice

After holding a seat, choose how to pay: **Pay Online** (instant confirmation) or **Pay on Board** (reserve now, pay cash when boarding).

![Payment Choice](public/screenshots/04-payment-choice.png)

---

### 5. Online Payment — GCash / Maya / Card

Select your e-wallet or card. A 2-second processing animation confirms the payment instantly — no external redirect.

![Payment Page](public/screenshots/05-payment-page.png)

---

### 6. Payment Processing

Simulated payment processing with animated spinner.

![Processing](public/screenshots/06-payment-processing.png)

---

### 7. Confirmed Ticket — Online Payment

Online-paid bookings get a **QR code ticket** for boarding verification.

![Online Ticket](public/screenshots/07-ticket-online.png)

---

### 8. Confirmed Ticket — Cash on Board

Cash bookings get a **Pay on Board** ticket with a reference code. Downloadable as PDF. Staff will call your reference code when boarding.

![Cash Ticket](public/screenshots/08-ticket-cash.png)

---

### 9. Login Page

Secure login for registered passengers, staff, and admin.

![Login](public/screenshots/09-login.png)

---

### 10. Staff Panel — Bus Selection

Staff enter their assigned bus passcode to unlock controls.

![Staff Bus List](public/screenshots/10-staff-busList.png)

---

### 11. Staff Panel — Bus Passcode

Passcode-protected access ensures only assigned staff can control a bus.

![Staff Passcode](public/screenshots/11-staff-passcode.png)

---

### 12. Staff Panel — Active Bus Controls

Manage bus status (Running / Paused / Parked), advance stops, and adjust simulation speed. View e-cash and cash passenger lists in real time.

![Staff Controls](public/screenshots/12-staff-panel.png)

---

### 13. Staff Panel — Live Seat Map

Color-coded seat grid. Click any booked seat to see passenger name, route, fare, and payment status (Paid Online or Cash on Board).

![Staff Seat Map](public/screenshots/13-staff-seatmap.png)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (custom) |
| State | Zustand |
| Map | Leaflet (react-leaflet) |
| Styling | Tailwind CSS |
| PDF Export | html2canvas + jsPDF |

---

## Accounts (Development / Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@misortransit.com` | `admin123` |
| Staff 1 | `staff1@misortransit.com` | `staff1234` |
| Staff 2 | `staff2@misortransit.com` | `staff1234` |
| Passenger | `demo@passenger.com` | `user123` |

**Bus Passcodes:** `bus001` through `bus005` (matching each bus number)

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Create .env with:
# DATABASE_URL="postgresql://..."
# JWT_SECRET="your-secret"

# 3. Push schema and seed data
npx prisma db push
npx prisma db seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment (Free)

**Database:** [Railway](https://railway.app) — free PostgreSQL  
**App:** [Vercel](https://vercel.com) — free Next.js hosting

Steps:
1. Push code to GitHub
2. Create a PostgreSQL database on Railway → copy the `DATABASE_URL`
3. Import the GitHub repo on Vercel
4. Add environment variables on Vercel: `DATABASE_URL`, `JWT_SECRET`
5. Add build command: `npx prisma generate && npx prisma db push && next build`
6. Deploy — Vercel auto-deploys on every push
