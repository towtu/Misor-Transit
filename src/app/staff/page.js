'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

const directionLabel = {
  TAGOLOAN_TO_CDO: 'Tagoloan → CDO',
  CDO_TO_TAGOLOAN: 'CDO → Tagoloan',
};

function SeatGrid({ seats, onSelect }) {
  if (!seats || seats.length === 0) return <p className="text-slate-400 text-sm text-center py-6">No seats found</p>;

  // Group by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = {};
    acc[seat.row][seat.col] = seat;
    return acc;
  }, {});

  const rowNums = Object.keys(rows).map(Number).sort((a, b) => a - b);
  const maxCols = 5;

  const getSeatColor = (seat) => {
    if (!seat) return '';
    if (seat.status === 'AVAILABLE') return 'bg-slate-100 border border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50';
    if (seat.booking?.status === 'CONFIRMED' || seat.status === 'BOOKED') return 'bg-blue-600 text-white shadow-sm shadow-blue-500/30';
    if (seat.booking?.status === 'ON_HOLD' || seat.status === 'HELD') return 'bg-amber-400 text-white';
    return 'bg-slate-200 text-slate-400';
  };

  return (
    <div className="space-y-2">
      {/* Bus front indicator */}
      <div className="flex justify-center mb-3">
        <div className="bg-slate-100 border border-slate-200 rounded-lg px-6 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
          Front
        </div>
      </div>

      {rowNums.map((rowNum) => {
        const row = rows[rowNum];
        const cols = Array.from({ length: maxCols }, (_, i) => i + 1);
        return (
          <div key={rowNum} className="flex items-center gap-1.5 justify-center">
            {cols.map((col) => {
              const seat = row[col];
              if (!seat) {
                // Aisle gap at col 3
                if (col === 3) return <div key={col} className="w-6 h-10 flex-shrink-0" />;
                return null;
              }
              return (
                <button
                  key={col}
                  onClick={() => onSelect(seat)}
                  title={seat.booking ? `${seat.booking.passengerName} — ${seat.booking.pickupStop} → ${seat.booking.dropoffStop}` : 'Available'}
                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${getSeatColor(seat)}`}
                >
                  {seat.label}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const statusColors = {
  RUNNING: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  PARKED: 'bg-slate-100 text-slate-600',
  MAINTENANCE: 'bg-red-100 text-red-700',
};

export default function StaffPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unlocked bus state
  const [unlockedBusId, setUnlockedBusId] = useState(null);
  const [unlockedBus, setUnlockedBus] = useState(null);

  // Passcode modal state
  const [passcodeModal, setPasscodeModal] = useState(null); // bus object
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeLoading, setPasscodeLoading] = useState(false);

  // Bus control state
  const [actionLoading, setActionLoading] = useState('');
  const [cashOnBoardBookings, setCashOnBoardBookings] = useState([]);
  const [ecashBookings, setEcashBookings] = useState([]);
  const [cashLoading, setCashLoading] = useState(false);
  const [receivingId, setReceivingId] = useState(null);

  // Seat map state
  const [seatmap, setSeatmap] = useState([]);
  const [seatmapLoading, setSeatmapLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const prevAvailableSeats = useRef(null);

  const fetchSeatmapSilent = useCallback(async (busId) => {
    try {
      const data = await api.getStaffSeatmap(busId);
      setSeatmap(data.seats || []);
    } catch {}
  }, []);

  const fetchBuses = useCallback(async () => {
    try {
      const data = await api.getBuses();
      setBuses(data);
      if (unlockedBusId) {
        const updated = data.find((b) => b.id === unlockedBusId);
        if (updated) {
          setUnlockedBus(updated);
          // Auto-refresh seat map only when available seats count changes
          if (prevAvailableSeats.current !== null && prevAvailableSeats.current !== updated.availableSeats) {
            fetchSeatmapSilent(unlockedBusId);
          }
          prevAvailableSeats.current = updated.availableSeats;
        }
      }
    } catch {}
    setLoading(false);
  }, [unlockedBusId, fetchSeatmapSilent]);

  const fetchCashBookings = useCallback(async (busId) => {
    setCashLoading(true);
    try {
      const data = await api.getAdminBookings({ busId, status: 'CONFIRMED' });
      setCashOnBoardBookings(data.filter((b) => b.payment?.method === 'CASH' && b.payment?.status === 'PENDING'));
      setEcashBookings(data.filter((b) => b.payment?.method !== 'CASH' && b.payment?.status === 'PAID'));
    } catch {}
    setCashLoading(false);
  }, []);

  const fetchSeatmap = useCallback(async (busId) => {
    setSeatmapLoading(true);
    try {
      const data = await api.getStaffSeatmap(busId);
      setSeatmap(data.seats || []);
    } catch {}
    setSeatmapLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'STAFF') {
      router.push('/');
      return;
    }
    fetchBuses();
    const id = setInterval(fetchBuses, 5000);
    return () => clearInterval(id);
  }, [user, authLoading, router, fetchBuses]);

  useEffect(() => {
    if (unlockedBusId) {
      prevAvailableSeats.current = null; // reset so first load doesn't trigger extra fetch
      fetchCashBookings(unlockedBusId);
      fetchSeatmap(unlockedBusId);
    }
  }, [unlockedBusId, fetchCashBookings, fetchSeatmap]);

  const openPasscodeModal = (bus) => {
    setPasscodeModal(bus);
    setPasscode('');
    setPasscodeError('');
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    setPasscodeLoading(true);
    setPasscodeError('');
    try {
      await api.unlockBus(passcodeModal.id, passcode);
      setUnlockedBusId(passcodeModal.id);
      setUnlockedBus(passcodeModal);
      setPasscodeModal(null);
      setPasscode('');
    } catch (err) {
      setPasscodeError(err.message);
    } finally {
      setPasscodeLoading(false);
    }
  };

  const busAction = async (label, body) => {
    setActionLoading(label);
    try {
      await api.updateBus(unlockedBusId, body);
      await fetchBuses();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleAdvance = async () => {
    setActionLoading('advance');
    try {
      await api.advanceBus(unlockedBusId);
      await fetchBuses();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading('');
    }
  };

  const handleLockBus = () => {
    setUnlockedBusId(null);
    setUnlockedBus(null);
    setCashOnBoardBookings([]);
    setEcashBookings([]);
    setSeatmap([]);
    setSelectedSeat(null);
  };

  const handleReceiveCash = async (bookingId) => {
    setReceivingId(bookingId);
    // Optimistically remove from list immediately
    setCashOnBoardBookings((prev) => prev.filter((b) => b.id !== bookingId));
    try {
      await api.confirmCashPayment(bookingId);
    } catch (err) {
      // Restore on failure
      await fetchCashBookings(unlockedBusId);
      alert(err.message);
    } finally {
      setReceivingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Panel</h1>
          <p className="text-sm text-slate-400 mt-0.5">Welcome, {user?.firstName}. Select your bus to get started.</p>
        </div>
        {unlockedBus && (
          <button onClick={handleLockBus} className="text-sm text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Switch Bus
          </button>
        )}
      </div>

      {/* Active bus panel */}
      {unlockedBus ? (
        <div className="space-y-5">
          {/* Bus info header */}
          <div className="bg-blue-950 text-white rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Active Bus</p>
                <h2 className="text-xl font-extrabold">{unlockedBus.name}</h2>
                <p className="text-blue-300 text-sm mt-0.5">{unlockedBus.plateNumber} · {unlockedBus.busType === 'COASTER' ? 'Coaster' : 'Full Bus'}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[unlockedBus.status] || 'bg-slate-100 text-slate-600'}`}>
                {unlockedBus.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-300 text-xs">Direction</p>
                <p className="font-semibold mt-0.5">{directionLabel[unlockedBus.computedDirection || unlockedBus.direction]}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-300 text-xs">Current Stop</p>
                <p className="font-semibold mt-0.5">{unlockedBus.currentStopName || `Stop ${unlockedBus.currentStopIdx}`}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-300 text-xs">Available Seats</p>
                <p className="font-semibold mt-0.5">{unlockedBus.availableSeats} / {unlockedBus.totalSeats}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-300 text-xs">Speed</p>
                <p className="font-semibold mt-0.5">{unlockedBus.simSpeed || 2}x</p>
              </div>
            </div>
          </div>

          {/* Bus controls */}
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Bus Controls</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {unlockedBus.status !== 'RUNNING' && (
                <button onClick={() => busAction('start', { status: 'RUNNING' })} disabled={!!actionLoading}
                  className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
                  {actionLoading === 'start' ? '...' : '▶ Start'}
                </button>
              )}
              {unlockedBus.status === 'RUNNING' && (
                <button onClick={() => busAction('pause', { status: 'PAUSED' })} disabled={!!actionLoading}
                  className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50">
                  {actionLoading === 'pause' ? '...' : '⏸ Pause'}
                </button>
              )}
              <button onClick={() => busAction('park', { status: 'PARKED' })} disabled={!!actionLoading}
                className="bg-slate-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50">
                {actionLoading === 'park' ? '...' : '⬛ Park'}
              </button>
              <button onClick={handleAdvance} disabled={!!actionLoading}
                className="border border-slate-300 text-slate-700 text-sm px-4 py-2 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50">
                {actionLoading === 'advance' ? '...' : '⏭ Advance Stop'}
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Simulation Speed</label>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-400">1x</span>
                <input type="range" min={1} max={5} value={unlockedBus.simSpeed || 2}
                  onChange={(e) => busAction('speed', { simSpeed: Number(e.target.value) })}
                  className="flex-1 h-1.5 accent-blue-600" />
                <span className="text-xs text-slate-400">5x</span>
                <span className="text-sm font-bold text-blue-600 w-6">{unlockedBus.simSpeed || 2}x</span>
              </div>
            </div>
          </div>

          {/* E-Cash Payments */}
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800">E-Cash Payments</h3>
                <p className="text-xs text-slate-400 mt-0.5">Passengers who paid online (GCash / Maya / Card)</p>
              </div>
              <button onClick={() => fetchCashBookings(unlockedBusId)} className="text-xs text-blue-600 hover:underline">Refresh</button>
            </div>
            {cashLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : ecashBookings.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No e-cash payments</p>
            ) : (
              <div className="space-y-3">
                {ecashBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestName}
                        {!b.user && <span className="text-xs text-slate-400 ml-1">(guest)</span>}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seat {b.seat?.label} · {b.pickupStop?.name} → {b.dropoffStop?.name}
                      </p>
                      {b.referenceCode && (
                        <p className="font-mono text-xs font-bold text-emerald-700 mt-0.5">{b.referenceCode}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-extrabold text-blue-600 text-lg">₱{b.fare}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                        {b.payment?.method || 'Online'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cash on Board */}
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Cash Payment on Board</h3>
                <p className="text-xs text-slate-400 mt-0.5">Collect cash from these passengers when boarding</p>
              </div>
            </div>
            {cashLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : cashOnBoardBookings.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No cash passengers</p>
            ) : (
              <div className="space-y-3">
                {cashOnBoardBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestName}
                        {!b.user && <span className="text-xs text-slate-400 ml-1">(guest)</span>}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seat {b.seat?.label} · {b.pickupStop?.name} → {b.dropoffStop?.name}
                      </p>
                      {b.referenceCode && (
                        <p className="font-mono text-xs font-bold text-amber-700 mt-0.5">{b.referenceCode}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-extrabold text-blue-600 text-lg">₱{b.fare}</p>
                      <button
                        onClick={() => handleReceiveCash(b.id)}
                        disabled={receivingId === b.id}
                        className="mt-1 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {receivingId === b.id ? '...' : 'Received'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seat Map */}
          <div className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Seat Map</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tap a seat to see passenger details</p>
              </div>
              <button onClick={() => fetchSeatmap(unlockedBusId)} className="text-xs text-blue-600 hover:underline">Refresh</button>
            </div>

            {seatmapLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-slate-100 border border-slate-200" />Available</div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-blue-600" />Confirmed</div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-400" />On Hold</div>
                </div>

                {/* Seat grid */}
                <SeatGrid seats={seatmap} onSelect={setSelectedSeat} />

                {/* Selected seat detail */}
                {selectedSeat && (
                  <div className={`mt-4 rounded-xl p-4 border ${
                    selectedSeat.booking?.status === 'CONFIRMED'
                      ? 'bg-blue-50 border-blue-200'
                      : selectedSeat.booking?.status === 'ON_HOLD'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-sm ${
                          selectedSeat.booking?.status === 'CONFIRMED' ? 'bg-blue-600 text-white'
                          : selectedSeat.booking?.status === 'ON_HOLD' ? 'bg-amber-400 text-white'
                          : 'bg-slate-200 text-slate-500'
                        }`}>
                          {selectedSeat.label}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">Seat {selectedSeat.label}</p>
                          <p className="text-xs text-slate-400">{selectedSeat.booking ? selectedSeat.booking.status : 'Available'}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedSeat(null)} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {selectedSeat.booking ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Passenger</span>
                          <span className="font-semibold text-slate-800">{selectedSeat.booking.passengerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Route</span>
                          <span className="font-medium text-slate-700">{selectedSeat.booking.pickupStop} → {selectedSeat.booking.dropoffStop}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Fare</span>
                          <span className="font-bold text-blue-600">₱{selectedSeat.booking.fare}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Payment</span>
                          {selectedSeat.booking.paymentMethod === 'CASH' ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Cash on Board</span>
                          ) : selectedSeat.booking.paymentStatus === 'PAID' ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Paid Online</span>
                          ) : (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Unknown</span>
                          )}
                        </div>
                        {selectedSeat.booking.referenceCode && (
                          <div className="mt-2 pt-2 border-t border-current/10 text-center">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Reference Code</p>
                            <p className="font-mono text-lg font-extrabold text-slate-800 tracking-widest">{selectedSeat.booking.referenceCode}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-2">No passenger booked</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* Bus picker */
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-4">Enter the passcode for your assigned bus to unlock it.</p>
          {buses.length === 0 ? (
            <p className="text-slate-400">No buses available. Ask an admin to seed data.</p>
          ) : (
            buses.map((bus) => (
              <button
                key={bus.id}
                onClick={() => openPasscodeModal(bus)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-950 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 4h8m-4 4v3m-6 0h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2zm-2 0h2m12 0h2M7 21h.01M17 21h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{bus.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{bus.plateNumber} · {directionLabel[bus.computedDirection || bus.direction]}</p>
                    <p className="text-xs text-slate-400">{bus.availableSeats}/{bus.totalSeats} seats available · Stop: {bus.currentStopName || bus.currentStopIdx}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[bus.status] || 'bg-slate-100 text-slate-600'}`}>
                    {bus.status}
                  </span>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Passcode modal */}
      {passcodeModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPasscodeModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-blue-950 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">{passcodeModal.name}</h3>
              <p className="text-slate-400 text-sm mt-0.5">Enter the bus passcode to unlock controls</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                autoFocus
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {passcodeError && (
                <p className="text-red-600 text-sm text-center">{passcodeError}</p>
              )}
              <button
                type="submit"
                disabled={passcodeLoading || !passcode}
                className="w-full bg-blue-950 text-white py-3 rounded-xl font-bold hover:bg-blue-900 disabled:opacity-50 transition-colors"
              >
                {passcodeLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : 'Unlock Bus'}
              </button>
              <button type="button" onClick={() => setPasscodeModal(null)} className="w-full text-slate-400 text-sm py-2 hover:text-slate-600 transition-colors">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
