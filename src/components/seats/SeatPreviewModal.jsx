'use client';
import { useEffect, useState } from 'react';
import SeatPicker from './SeatPicker';
import api from '@/lib/api';

export default function SeatPreviewModal({ bus, onClose, onBook, initialSeats = [] }) {
  const [seats, setSeats] = useState(initialSeats);
  const [loading, setLoading] = useState(initialSeats.length === 0);

  useEffect(() => {
    api.getBusSeats(bus.id)
      .then((data) => setSeats(data.seats || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bus.id]);

  const available = seats.filter((s) => s.status === 'AVAILABLE').length;
  const held = seats.filter((s) => s.status === 'ON_HOLD').length;
  const taken = seats.filter((s) => s.status === 'BOOKED').length;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-blue-950 px-5 py-4 sm:rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-white">{bus.name}</h2>
            <p className="text-xs text-blue-300">{bus.plateNumber} · Seat Preview</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-emerald-600">{available}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mt-0.5">Open</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-amber-500">{held}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-0.5">Held</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 text-center">
              <p className="text-xl font-extrabold text-rose-500">{taken}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mt-0.5">Taken</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <SeatPicker seats={seats} selectedSeatId={null} onSelect={() => {}} />
          )}

          <button
            onClick={() => { onClose(); onBook(bus); }}
            className="w-full mt-5 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Book a Seat
          </button>
        </div>
      </div>
    </div>
  );
}
