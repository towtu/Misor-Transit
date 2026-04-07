'use client';
import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import useBusPolling from '@/hooks/useBusPolling';
import BusCard from '@/components/map/BusCard';
import SeatPickerModal from '@/components/seats/SeatPickerModal';
import SeatPreviewModal from '@/components/seats/SeatPreviewModal';
import { useMapStore } from '@/lib/store';
import api from '@/lib/api';

const BusMap = dynamic(() => import('@/components/map/BusMap'), { ssr: false });

export default function HomePage() {
  const { buses, loading } = useBusPolling(4000);
  const { selectedBus, showSeatPicker, selectBus, closeSeatPicker } = useMapStore();
  const [prefetchedSeats, setPrefetchedSeats] = useState([]);
  const [previewBus, setPreviewBus] = useState(null);

  const handleSelectBus = useCallback((bus) => {
    setPreviewBus(null);
    setPrefetchedSeats([]);
    selectBus(bus);
    api.getBusSeats(bus.id)
      .then((data) => setPrefetchedSeats(data.seats || []))
      .catch(() => {});
  }, [selectBus]);

  const handlePreviewBus = useCallback((bus) => {
    setPreviewBus(bus);
  }, []);

  const handleClose = useCallback(() => {
    closeSeatPicker();
    setPrefetchedSeats([]);
  }, [closeSeatPicker]);

  const activeBuses = buses.filter((b) => b.status === 'RUNNING' || b.status === 'PAUSED');
  const parkedBuses = buses.filter((b) => b.status === 'PARKED');

  const sidebarContent = (
    <div className="p-4 space-y-5">
      {/* Sticky header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Trip Configuration</h2>
        {activeBuses.length > 0 && (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-status" />
            Live
          </span>
        )}
      </div>

      {/* Quick Stats */}
      {!loading && buses.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xl font-extrabold text-blue-600">{activeBuses.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Active</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xl font-extrabold text-blue-600">{buses.reduce((a, b) => a + (b.availableSeats || 0), 0)}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Seats</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 text-center">
            <p className="text-xl font-extrabold text-slate-600">{buses.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Fleet</p>
          </div>
        </div>
      )}

      {/* Active Buses */}
      {activeBuses.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-status" />
            Active Buses
          </h3>
          <div className="space-y-3">
            {activeBuses.map((bus) => (
              <div key={bus.id}>
                <BusCard bus={bus} onClick={handleSelectBus} onPreview={handlePreviewBus} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parked Buses */}
      {parkedBuses.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            Parked
          </h3>
          <div className="space-y-3">
            {parkedBuses.map((bus) => (
              <div key={bus.id}>
                <BusCard bus={bus} onClick={handleSelectBus} onPreview={handlePreviewBus} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && buses.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-4 4v3m-6 0h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm-2 0h2m12 0h2" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No buses available yet</p>
          <p className="text-slate-300 text-xs mt-1">Staff needs to seed data first</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block w-[480px] flex-shrink-0 bg-slate-100 overflow-y-auto border-r border-slate-200">
        {sidebarContent}
      </aside>

      {/* Map */}
      <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
        {loading ? (
          <div className="h-full flex items-center justify-center map-dots-bg">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading map...</p>
            </div>
          </div>
        ) : (
          <div className="h-full relative">
            <BusMap buses={buses} onBusClick={handleSelectBus} />
            {/* Inner shadow vignette */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_rgba(0,0,0,0.06)]" />
          </div>
        )}
      </div>

      {/* Mobile cards — below map */}
      <div className="lg:hidden overflow-y-auto bg-slate-100" style={{ maxHeight: '50vh' }}>
        {sidebarContent}
      </div>

      {previewBus && (
        <SeatPreviewModal
          bus={previewBus}
          onClose={() => setPreviewBus(null)}
          onBook={handleSelectBus}
        />
      )}

      {showSeatPicker && selectedBus && (
        <SeatPickerModal bus={selectedBus} onClose={handleClose} initialSeats={prefetchedSeats} />
      )}
    </div>
  );
}
