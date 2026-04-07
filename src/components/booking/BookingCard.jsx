'use client';

const statusColors = {
  ON_HOLD: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  COMPLETED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  REFUNDED: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
};

export default function BookingCard({ booking, onCancel, onPay }) {
  const status = statusColors[booking.status] || statusColors.CANCELLED;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800">{booking.bus?.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">Seat {booking.seat?.label}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text} ${status.border} border flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {booking.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">{booking.pickupStop?.name}</span>
          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="font-medium">{booking.dropoffStop?.name}</span>
        </div>
        <p className="text-xl font-bold text-blue-600 mt-2">₱{typeof booking.fare === 'object' ? booking.fare.fare : booking.fare}</p>
      </div>

      {booking.qrCode && booking.status === 'CONFIRMED' && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">QR Ticket</p>
          <p className="font-mono text-sm break-all text-slate-600">{booking.qrCode}</p>
        </div>
      )}

      {booking.referenceCode && (
        <div className="mt-3 p-3 bg-amber-50 rounded-xl text-center">
          <p className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-1">Reference Code</p>
          <p className="font-mono text-lg font-bold text-amber-800 tracking-wider">{booking.referenceCode}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {booking.status === 'ON_HOLD' && onPay && (
          <button onClick={() => onPay(booking)} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Pay Now
          </button>
        )}
        {booking.status === 'ON_HOLD' && onCancel && (
          <button onClick={() => onCancel(booking)} className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-xl font-medium hover:bg-red-50 transition-colors">
            Cancel
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-300 mt-3">
        {new Date(booking.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(booking.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
