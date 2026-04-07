'use client';

export default function FareDisplay({ fare }) {
  if (!fare) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-semibold text-emerald-700">Discount Applied</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-600">{fare.fareType.replace('_', ' ')} discount</p>
          <p className="text-xs text-emerald-500 mt-0.5">{fare.distance} stop{fare.distance > 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <span className="text-slate-400 line-through text-sm mr-2">₱{fare.regularFare}</span>
          <span className="text-emerald-700 font-bold text-xl">₱{fare.fare}</span>
          <p className="text-xs text-emerald-500">Saving ₱{fare.savings}</p>
        </div>
      </div>
    </div>
  );
}
