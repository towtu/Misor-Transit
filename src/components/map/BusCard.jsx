'use client';

const statusConfig = {
  RUNNING: { color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'En Route' },
  PAUSED: { color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Paused' },
  PARKED: { color: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-500', label: 'Parked' },
};

const directionLabels = {
  TAGOLOAN_TO_CDO: { from: 'Tagoloan', to: 'Gaisano' },
  CDO_TO_TAGOLOAN: { from: 'Gaisano', to: 'Tagoloan' },
};

export default function BusCard({ bus, onClick, onPreview }) {
  const status = statusConfig[bus.status] || statusConfig.PARKED;
  const dir = directionLabels[bus.direction] || { from: '—', to: '—' };
  const seatPercent = bus.totalSeats > 0 ? Math.round((bus.availableSeats / bus.totalSeats) * 100) : 0;

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-100 relative overflow-hidden shadow-sm hover:border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* Status strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${status.color} opacity-80`} />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-base truncate">{bus.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {bus.plateNumber} · {bus.busType === 'COASTER' ? 'Coaster' : 'Full Bus'}
            </p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text} flex items-center gap-1.5 flex-shrink-0 ml-2`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.color} ${bus.status === 'RUNNING' ? 'animate-pulse-status' : ''}`} />
            {status.label}
          </span>
        </div>

        {/* Route direction */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-700">{dir.from}</span>
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          <span className="font-medium text-slate-700">{dir.to}</span>
        </div>

        {/* Current position */}
        {bus.currentStopName && (
          <p className="text-xs text-slate-400 mt-1">
            Near <span className="text-slate-500 font-medium">{bus.currentStopName}</span>
            {bus.nextStopName && <span> → {bus.nextStopName}</span>}
          </p>
        )}

        {/* Seats bar */}
        <div className="mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Available seats</span>
            <span className="text-sm font-bold text-blue-600 tabular-nums">{bus.availableSeats}/{bus.totalSeats}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                seatPercent > 50 ? 'bg-emerald-400' : seatPercent > 20 ? 'bg-amber-400' : 'bg-red-400'
              }`}
              style={{ width: `${seatPercent}%` }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onPreview(bus)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Seats
          </button>
          <button
            onClick={() => onClick(bus)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Book Seat
          </button>
        </div>
      </div>
    </div>
  );
}
