'use client';

const statusStyles = {
  AVAILABLE: 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-400 cursor-pointer shadow-sm',
  ON_HOLD: 'bg-amber-400 border-amber-500 text-white cursor-not-allowed',
  BOOKED: 'bg-rose-500 border-rose-600 text-white cursor-not-allowed',
  DISABLED: 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed',
};

function SeatButton({ seat, isSelected, onSelect }) {
  return (
    <button
      disabled={seat.status !== 'AVAILABLE'}
      onClick={() => onSelect(seat)}
      className={`w-11 h-[48px] rounded-t-xl rounded-b-md text-xs font-bold transition-all duration-150 border-[1.5px] relative ${
        isSelected
          ? 'bg-blue-600 border-blue-700 text-white ring-[3px] ring-blue-400/50 shadow-lg shadow-blue-500/30'
          : statusStyles[seat.status]
      }`}
    >
      {seat.label}
      <div className="absolute bottom-0 left-0.5 right-0.5 h-1.5 bg-black/10 rounded-b-md" />
    </button>
  );
}

export default function SeatPicker({ seats, selectedSeatId, onSelect }) {
  if (!seats?.length) return <p className="text-slate-400 text-sm text-center py-6">No seats available</p>;

  const maxRow = Math.max(...seats.map((s) => s.row));
  const getSeat = (row, col) => seats.find((s) => s.row === row && s.col === col);

  return (
    <div className="flex flex-col items-center">
      {/* Bus shell */}
      <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4 relative overflow-hidden">
        {/* Front cabin */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-slate-300 border-dashed">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Driver</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-[10px] uppercase tracking-widest font-bold">Door</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        </div>

        {/* Seat grid */}
        <div className="space-y-2">
          {Array.from({ length: maxRow }, (_, i) => i + 1).map((row) => {
            const isBackRow = row === maxRow && maxRow === 8;

            if (isBackRow) {
              // Row 8: 5-seat bench spanning full width
              return (
                <div key={row} className="pt-1 mt-1 border-t border-slate-200 border-dashed">
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((col) => {
                      const seat = getSeat(row, col);
                      if (!seat) return <div key={col} className="w-11 h-[48px]" />;
                      return (
                        <SeatButton key={col} seat={seat} isSelected={seat.id === selectedSeatId} onSelect={onSelect} />
                      );
                    })}
                  </div>
                </div>
              );
            }

            if (row === 1) {
              // Row 1: 2 seats on left, empty right (door area)
              return (
                <div key={row} className="flex items-center justify-center gap-2">
                  {[1, 2].map((col) => {
                    const seat = getSeat(row, col);
                    if (!seat) return <div key={col} className="w-11 h-[48px]" />;
                    return (
                      <SeatButton key={col} seat={seat} isSelected={seat.id === selectedSeatId} onSelect={onSelect} />
                    );
                  })}
                  {/* Aisle */}
                  <div className="w-6" />
                  {/* Empty right side (door) */}
                  <div className="w-11 h-[48px]" />
                  <div className="w-11 h-[48px]" />
                </div>
              );
            }

            // Rows 2–7: standard 2×2
            return (
              <div key={row} className="flex items-center justify-center gap-2">
                {/* Left: A, B */}
                {[1, 2].map((col) => {
                  const seat = getSeat(row, col);
                  if (!seat) return <div key={col} className="w-11 h-[48px]" />;
                  return (
                    <SeatButton key={col} seat={seat} isSelected={seat.id === selectedSeatId} onSelect={onSelect} />
                  );
                })}
                {/* Aisle */}
                <div className="w-6 flex justify-center">
                  <div className="w-0.5 h-6 bg-slate-300 rounded-full" />
                </div>
                {/* Right: C, D (cols 4, 5) */}
                {[4, 5].map((col) => {
                  const seat = getSeat(row, col);
                  if (!seat) return <div key={col} className="w-11 h-[48px]" />;
                  return (
                    <SeatButton key={col} seat={seat} isSelected={seat.id === selectedSeatId} onSelect={onSelect} />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-4 rounded-t-lg rounded-b-sm bg-emerald-500" /> Open</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-4 rounded-t-lg rounded-b-sm bg-blue-600 ring-2 ring-blue-400/50" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-4 rounded-t-lg rounded-b-sm bg-amber-400" /> On Hold</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-4 rounded-t-lg rounded-b-sm bg-rose-500" /> Taken</span>
      </div>
    </div>
  );
}
