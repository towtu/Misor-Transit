'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';

const METHODS = [
  {
    id: 'GCASH',
    label: 'GCash',
    color: 'bg-blue-500',
    logo: (
      <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#007DFF" />
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">GCash</text>
      </svg>
    ),
    desc: 'Pay via GCash e-wallet',
  },
  {
    id: 'MAYA',
    label: 'Maya',
    color: 'bg-green-500',
    logo: (
      <svg className="w-7 h-7" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="10" fill="#00A651" />
        <text x="50%" y="57%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Maya</text>
      </svg>
    ),
    desc: 'Pay via Maya e-wallet',
  },
  {
    id: 'CARD',
    label: 'Debit / Credit Card',
    color: 'bg-slate-700',
    logo: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    desc: 'Visa, Mastercard, JCB',
  },
];

export default function MockPaymentPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [step, setStep] = useState('choose'); // 'choose' | 'processing' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getBooking(bookingId)
      .then(setBooking)
      .catch(() => setErrorMsg('Booking not found'))
      .finally(() => setPageLoading(false));
  }, [bookingId]);

  const handlePay = async () => {
    if (!selectedMethod) return;
    setStep('processing');

    // Simulate 2 second processing delay
    await new Promise((r) => setTimeout(r, 2000));

    try {
      await api.mockConfirmPayment({ bookingId, method: selectedMethod });
      setStep('done');
      // Redirect to ticket after brief success screen
      setTimeout(() => router.push(`/booking/${bookingId}`), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Payment failed');
      setStep('error');
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (errorMsg && step !== 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-slate-500 text-sm">{errorMsg}</p>
      </div>
    );
  }

  const fare = booking ? (typeof booking.fare === 'object' ? booking.fare.fare : booking.fare) : 0;

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      {/* Processing overlay */}
      {step === 'processing' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              {METHODS.find((m) => m.id === selectedMethod)?.logo}
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-800">Processing Payment</p>
          <p className="text-sm text-slate-400 mt-1">Connecting to {selectedMethod}...</p>
        </div>
      )}

      {/* Success overlay */}
      {step === 'done' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-bounce-once">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-2xl font-extrabold text-slate-800">Payment Successful!</p>
          <p className="text-slate-400 text-sm mt-2">Redirecting to your ticket...</p>
        </div>
      )}

      {/* Error screen */}
      {step === 'error' && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="font-bold text-slate-800 text-lg">Payment Failed</p>
          <p className="text-slate-400 text-sm mt-1">{errorMsg}</p>
          <button onClick={() => setStep('choose')} className="mt-4 text-blue-600 text-sm font-semibold hover:underline">
            Try Again
          </button>
        </div>
      )}

      {/* Main payment UI */}
      {(step === 'choose' || step === 'processing') && booking && (
        <>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-950 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Payment
            </div>
            <p className="text-5xl font-extrabold text-slate-800 tabular-nums">&#8369;{fare}</p>
            <p className="text-slate-400 text-sm mt-2">
              {booking.bus?.name} · {booking.pickupStop?.name} → {booking.dropoffStop?.name}
            </p>
            <p className="text-xs text-slate-400 mt-1">Seat <span className="font-bold text-slate-600">{booking.seat?.label}</span></p>
          </div>

          {/* Payment method selection */}
          <div className="space-y-3 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Choose payment method</p>
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selectedMethod === m.id
                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-12 h-12 ${m.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  {m.logo}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                  selectedMethod === m.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-slate-300'
                }`}>
                  {selectedMethod === m.id && (
                    <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={!selectedMethod || step === 'processing'}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
          >
            Pay &#8369;{fare}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Payments are encrypted and secure
          </p>
        </>
      )}
    </div>
  );
}
