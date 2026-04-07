'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { saveGuestBooking } from '@/lib/guestBookings';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function PaymentSuccessPage() {
  const { bookingId } = useParams();
  const { user } = useAuthStore();
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | paid | pending | error

  useEffect(() => {
    api.getPaymentStatus(bookingId)
      .then(({ booking: b, status: s }) => {
        setBooking(b);
        setStatus(s === 'PAID' ? 'paid' : s === 'CANCELLED' ? 'error' : 'pending');
        if (s === 'PAID' && !user) saveGuestBooking(bookingId);
      })
      .catch(() => setStatus('error'));
  }, [bookingId, user]);

  const handlePrint = () => window.print();

  if (status === 'loading') return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
      <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400 text-sm font-medium">Verifying payment...</p>
    </div>
  );

  if (status === 'pending') return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Payment Not Yet Received</h1>
      <p className="text-slate-400 text-sm mb-6">Your payment is still being processed or was not completed.</p>
      <Link href={`/booking/${bookingId}`}
        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm">
        Return to Booking & Pay
      </Link>
    </div>
  );

  if (status === 'error' || !booking) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h1>
      <p className="text-slate-400 text-sm mb-6">Could not verify your payment. Please contact support.</p>
      <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">Back to Home</Link>
    </div>
  );

  const fare = typeof booking.fare === 'object' ? booking.fare.fare : booking.fare;
  const bookedAt = new Date(booking.createdAt).toLocaleString('en-PH', {
    dateStyle: 'medium', timeStyle: 'short',
  });

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          body { background: white !important; }
          .ticket-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}</style>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Success banner */}
        <div className="flex items-center gap-3 mb-6 no-print">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-800">Payment Confirmed!</p>
            <p className="text-xs text-slate-400">Your seat is secured. Download your ticket below.</p>
          </div>
        </div>

        {/* Ticket card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden ticket-card">
          {/* Navy header */}
          <div className="bg-blue-950 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                <circle cx="80" cy="20" r="30" stroke="white" strokeWidth="0.5"/>
                <circle cx="20" cy="80" r="20" stroke="white" strokeWidth="0.5"/>
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-300">MisOr Transit</p>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300">
                  Confirmed
                </span>
              </div>
              <p className="text-4xl font-extrabold tracking-tight">&#8369;{fare}</p>
              <p className="text-blue-300 text-sm mt-1">{booking.bus?.name} &middot; {booking.bus?.plateNumber}</p>
              <p className="text-blue-400 text-xs mt-0.5">{bookedAt}</p>
            </div>
          </div>

          {/* Tear line */}
          <div className="relative h-4 bg-white">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-slate-100 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-slate-100 rounded-full" />
            <div className="absolute left-8 right-8 top-1/2 border-t-2 border-dashed border-slate-200" />
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Route */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <div className="w-0.5 h-8 bg-slate-200" />
                <div className="w-3 h-3 rounded-full border-2 border-blue-600" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Boarding</p>
                  <p className="font-bold text-slate-800">{booking.pickupStop?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Drop-off</p>
                  <p className="font-bold text-slate-800">{booking.dropoffStop?.name}</p>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Seat</p>
                <p className="font-extrabold text-slate-800 text-lg">{booking.seat?.label}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Fare Type</p>
                <p className="font-bold text-slate-800 text-sm">{(booking.fareType || 'REGULAR').replace('_', ' ')}</p>
              </div>
            </div>

            {/* Reference code for guests */}
            {booking.referenceCode && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">Reference Code</p>
                <p className="font-mono text-2xl font-extrabold text-amber-800 tracking-widest">{booking.referenceCode}</p>
                <p className="text-xs text-amber-500 mt-1">Show this to staff when boarding</p>
              </div>
            )}

            {/* Guest name */}
            {booking.guestName && (
              <div className="flex justify-between items-center py-2 border-t border-slate-100">
                <span className="text-sm text-slate-400">Passenger</span>
                <span className="font-semibold text-slate-700">{booking.guestName}</span>
              </div>
            )}

            {/* QR Code */}
            {booking.qrCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-2">QR Ticket</p>
                <div className="bg-white rounded-lg p-3 inline-block">
                  <p className="font-mono text-xs break-all text-slate-600">{booking.qrCode}</p>
                </div>
                <p className="text-xs text-blue-500 mt-2">Show this when boarding</p>
              </div>
            )}
          </div>
        </div>

        {/* Guest warning */}
        {!user && (
          <div className="mt-5 bg-amber-50 border-2 border-amber-300 rounded-xl p-4 no-print">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="font-bold text-amber-800 text-sm">Download your ticket now</p>
                <p className="text-amber-700 text-xs mt-1">
                  You are booking as a guest. This page will not be accessible again once you leave.
                  Lost tickets <span className="font-bold">cannot be refunded or recovered</span>.
                  Download or screenshot your ticket before closing this page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 space-y-2 no-print">
          <button
            onClick={handlePrint}
            className="w-full bg-blue-950 text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download / Print Ticket
          </button>
          {user ? (
            <Link href="/bookings"
              className="w-full block text-center bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition text-sm">
              My Tickets
            </Link>
          ) : (
            <Link href="/auth/register"
              className="w-full block text-center bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition text-sm">
              Register to Save Future Tickets
            </Link>
          )}
          <Link href="/"
            className="w-full block text-center text-slate-400 text-sm py-2 hover:text-slate-600 transition">
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
