'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import HoldTimer from '@/components/booking/HoldTimer';
import api from '@/lib/api';

const statusConfig = {
  ON_HOLD: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'On Hold' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Confirmed' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Cancelled' },
  COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Completed' },
};

export default function TicketPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    api.getBooking(bookingId)
      .then(setBooking)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Poll for status updates (payment confirmation)
  useEffect(() => {
    if (!booking || booking.status !== 'ON_HOLD') return;
    const id = setInterval(() => {
      api.getBooking(bookingId).then(setBooking).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [bookingId, booking?.status]);

  const handlePay = () => {
    router.push(`/payment/${bookingId}`);
  };

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8fafc',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`ticket-${booking.referenceCode || bookingId}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 110 20 10 10 0 010-20z" />
        </svg>
      </div>
      <p className="text-slate-400 text-sm">Booking not found</p>
      <Link href="/" className="text-blue-600 text-sm font-medium hover:underline mt-2">Back to Home</Link>
    </div>
  );

  const status = statusConfig[booking.status] || statusConfig.CANCELLED;
  const fare = typeof booking.fare === 'object' ? booking.fare.fare : booking.fare;
  const isCash = booking.payment?.method === 'CASH';

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link href="/" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors mb-6 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </Link>

      {/* Ticket card */}
      <div ref={ticketRef} className="bg-white rounded-2xl shadow-lg overflow-hidden mt-4">
        {/* Navy header */}
        <div className="bg-blue-950 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <circle cx="80" cy="20" r="30" stroke="white" strokeWidth="0.5"/>
              <circle cx="20" cy="80" r="20" stroke="white" strokeWidth="0.5"/>
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-300">MisOr Transit Ticket</p>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>
            <p className="text-4xl font-extrabold tracking-tight">&#8369;{fare}</p>
            <p className="text-blue-300 text-sm mt-1">{booking.bus?.name} &middot; {booking.bus?.plateNumber}</p>
          </div>
        </div>

        {/* Dotted tear line */}
        <div className="relative h-4 bg-white">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-slate-100 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-slate-100 rounded-full" />
          <div className="absolute left-8 right-8 top-1/2 border-t-2 border-dashed border-slate-200" />
        </div>

        {/* Ticket body */}
        <div className="p-6 space-y-4">
          {/* Route */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <div className="w-0.5 h-8 bg-slate-200" />
              <div className="w-3 h-3 rounded-full border-2 border-blue-600" />
            </div>
            <div className="flex-1 space-y-4">
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

          {/* Details grid */}
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

          {/* Reference code for guests (non-cash — cash shows it in the Pay on Board section) */}
          {booking.referenceCode && !isCash && (
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

          {/* QR Code for online-paid confirmed bookings */}
          {booking.qrCode && booking.status === 'CONFIRMED' && !isCash && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-2">QR Ticket</p>
              <div className="bg-white rounded-lg p-4 inline-block">
                <p className="font-mono text-sm break-all text-slate-600">{booking.qrCode}</p>
              </div>
              <p className="text-xs text-blue-500 mt-2">Show this when boarding</p>
            </div>
          )}

          {/* Pay on Board notice for cash bookings */}
          {booking.status === 'CONFIRMED' && isCash && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="font-bold text-amber-800 text-sm">Pay on Board</p>
              <p className="text-xs text-amber-600 mt-1">Your seat is reserved. Hand &#8369;{fare} to the staff when boarding.</p>
              {booking.referenceCode && (
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">Reference Code</p>
                  <p className="font-mono text-2xl font-extrabold text-amber-800 tracking-widest">{booking.referenceCode}</p>
                  <p className="text-xs text-amber-500 mt-1">Staff will call this code when boarding</p>
                </div>
              )}
            </div>
          )}

          {/* Completed badge */}
          {booking.status === 'COMPLETED' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <svg className="w-8 h-8 text-blue-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-bold text-blue-700">Trip Completed</p>
              <p className="text-xs text-blue-500 mt-1">Thank you for riding with MisOr Transit!</p>
            </div>
          )}

          {/* Hold timer + Pay button */}
          {booking.status === 'ON_HOLD' && booking.holdExpiresAt && (
            <div className="space-y-3 pt-2">
              <HoldTimer holdExpiresAt={booking.holdExpiresAt} />
              <button onClick={handlePay}
                className="w-full btn-dark">
                <svg className="w-4 h-4 inline mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pay Online (GCash / Maya / Card)
              </button>
            </div>
          )}

          {/* Cancelled */}
          {booking.status === 'CANCELLED' && (
            <div className="text-center pt-2">
              <p className="text-sm text-slate-400">This booking has been cancelled.</p>
              <Link href="/" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
                Book a new trip
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Download button — only for confirmed cash bookings */}
      {booking.status === 'CONFIRMED' && isCash && (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {downloading ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Ticket (PDF)
            </>
          )}
        </button>
      )}
    </div>
  );
}
