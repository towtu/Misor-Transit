'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const { bookingId } = useParams();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Payment Cancelled</h1>
        <p className="text-slate-500 mb-6">Your seat is still on hold. You can try paying again before the hold expires.</p>
        <div className="flex flex-col gap-2">
          <Link href={`/booking/${bookingId}`}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition">
            Try Again
          </Link>
          <Link href="/" className="text-slate-500 hover:underline text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
