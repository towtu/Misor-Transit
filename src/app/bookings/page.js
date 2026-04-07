'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import BookingCard from '@/components/booking/BookingCard';
import api from '@/lib/api';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/auth/login'); return; }

    api.getMyBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  const handleCancel = async (booking) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.cancelBooking(booking.id);
      setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePay = async (booking) => {
    try {
      const { checkoutUrl } = await api.createCheckout({ bookingId: booking.id });
      window.location.href = checkoutUrl;
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeBookings = bookings.filter((b) => ['ON_HOLD', 'CONFIRMED'].includes(b.status));
  const pastBookings = bookings.filter((b) => !['ON_HOLD', 'CONFIRMED'].includes(b.status));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Tickets</h1>
        <Link href="/" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
          + Book New
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No bookings yet</p>
          <Link href="/" className="text-blue-600 text-sm font-medium hover:underline mt-1 inline-block">
            Book a seat from the home page
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeBookings.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active
              </h2>
              <div className="space-y-3">
                {activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} onPay={handlePay} />
                ))}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Past
              </h2>
              <div className="space-y-3">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} onPay={handlePay} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
