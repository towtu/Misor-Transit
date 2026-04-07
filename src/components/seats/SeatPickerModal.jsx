'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import SeatPicker from './SeatPicker';
import FareDisplay from '@/components/booking/FareDisplay';
import HoldTimer from '@/components/booking/HoldTimer';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { saveGuestBooking } from '@/lib/guestBookings';

const ALL_STOPS = [
  { name: 'Tagoloan', orderIndex: 0 },
  { name: 'Bugo', orderIndex: 1 },
  { name: 'Puerto', orderIndex: 2 },
  { name: 'Agusan', orderIndex: 3 },
  { name: 'Tablon', orderIndex: 4 },
  { name: 'Baloy', orderIndex: 5 },
  { name: 'Cugman', orderIndex: 6 },
  { name: 'Gusa', orderIndex: 7 },
  { name: 'USTP', orderIndex: 8 },
  { name: 'SM Downtown', orderIndex: 9 },
  { name: 'Gaisano', orderIndex: 10 },
];

/**
 * Get valid boarding stops — all stops the bus hasn't passed yet.
 * For TAGOLOAN_TO_CDO: stops at or ahead of current position (not the last stop).
 * For CDO_TO_TAGOLOAN: stops at or behind current position (not the first stop).
 */
function getValidPickupStops(bus) {
  const direction = bus.computedDirection || bus.direction;
  const currentIdx = bus.currentStopIdx ?? 0;
  if (direction === 'TAGOLOAN_TO_CDO') {
    return ALL_STOPS.filter((s) => s.orderIndex >= currentIdx && s.orderIndex < 10);
  } else {
    return ALL_STOPS.filter((s) => s.orderIndex <= currentIdx && s.orderIndex > 0);
  }
}

/**
 * Get valid dropoff stops — all stops ahead of pickup in bus direction.
 */
function getValidDropoffStops(bus, pickupIdx) {
  const direction = bus.computedDirection || bus.direction;
  if (direction === 'TAGOLOAN_TO_CDO') {
    return ALL_STOPS.filter((s) => s.orderIndex > pickupIdx);
  } else {
    return ALL_STOPS.filter((s) => s.orderIndex < pickupIdx).reverse();
  }
}

export default function SeatPickerModal({ bus, onClose, initialSeats = [] }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [seats, setSeats] = useState(initialSeats);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [pickupStop, setPickupStop] = useState(null);
  const [dropoffStop, setDropoffStop] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [fare, setFare] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bookingRef = useRef(null);
  const paymentInitiatedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // On unmount: cancel ON_HOLD booking if no payment was started
  // Only reset store state when user navigated away via payment (not on explicit close)
  useEffect(() => {
    return () => {
      if (bookingRef.current?.status === 'ON_HOLD' && !paymentInitiatedRef.current) {
        api.cancelBooking(bookingRef.current.id).catch(() => {});
      }
      if (paymentInitiatedRef.current) {
        onCloseRef.current?.();
      }
    };
  }, []);

  const validPickupStops = getValidPickupStops(bus);
  const dropoffStops = pickupStop !== null ? getValidDropoffStops(bus, pickupStop) : [];

  const fetchSeats = useCallback(async () => {
    try {
      const data = await api.getBusSeats(bus.id);
      setSeats(data.seats);
    } catch {}
  }, [bus.id]);

  useEffect(() => {
    if (initialSeats.length > 0) setSeats(initialSeats);
  }, [initialSeats]);

  useEffect(() => {
    fetchSeats();
    const id = setInterval(fetchSeats, 5000);
    return () => clearInterval(id);
  }, [fetchSeats]);

  useEffect(() => { bookingRef.current = booking; }, [booking]);

  useEffect(() => {
    setDropoffStop(null);
    setFare(null);
  }, [pickupStop]);

  useEffect(() => {
    if (pickupStop !== null && dropoffStop !== null) {
      api.getFareEstimate({
        pickupStopIndex: pickupStop,
        dropoffStopIndex: dropoffStop,
        userType: user?.userType || 'REGULAR',
      }).then(setFare).catch(() => {});
    } else {
      setFare(null);
    }
  }, [pickupStop, dropoffStop, user?.userType]);

  const handleBookSeat = async () => {
    if (!user && !guestName.trim()) {
      setError('Please enter your name to book');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.createBooking({
        busId: bus.id,
        seatId: selectedSeat.id,
        pickupStopIndex: pickupStop,
        dropoffStopIndex: dropoffStop,
        ...(user ? {} : { guestName: guestName.trim() }),
      });
      setBooking(result);
      if (!user) saveGuestBooking(result.id);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = () => {
    if (!booking) return;
    paymentInitiatedRef.current = true;
    router.push(`/payment/${booking.id}`);
  };

  const handlePayCash = async () => {
    if (!booking) return;
    paymentInitiatedRef.current = true;
    setLoading(true);
    setError('');
    try {
      await api.createCashPayment({ bookingId: booking.id });
      router.push(`/booking/${booking.id}`);
    } catch (err) {
      paymentInitiatedRef.current = false;
      setError(err.message);
      setLoading(false);
    }
  };

  const pickupName = ALL_STOPS.find((s) => s.orderIndex === pickupStop)?.name;
  const dropoffName = ALL_STOPS.find((s) => s.orderIndex === dropoffStop)?.name;
  const stopDistance = pickupStop !== null && dropoffStop !== null ? Math.abs(dropoffStop - pickupStop) : 0;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl">
        {/* Header - Navy */}
        <div className="sticky top-0 z-10 bg-blue-950 px-5 py-4 sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-white text-lg">{bus.name}</h2>
              <p className="text-xs text-blue-300">{bus.plateNumber} · {bus.busType === 'COASTER' ? 'Coaster' : 'Full Bus'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-blue-500 text-white' : 'bg-white/10 text-blue-400'
                }`}>
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-blue-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Route</span>
            <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Seat</span>
            <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Confirm</span>
          </div>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Step 1: Route Selection */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Route widget */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-slate-300" />

                  {/* Boarding */}
                  <div className="relative flex items-start gap-3 mb-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                      pickupStop !== null ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Boarding At</p>
                      {validPickupStops.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {validPickupStops.map((stop) => (
                            <button
                              key={stop.orderIndex}
                              onClick={() => setPickupStop(stop.orderIndex)}
                              className={`px-3 py-2.5 rounded-lg text-sm text-center transition-all duration-200 font-semibold ${
                                pickupStop === stop.orderIndex
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}
                            >
                              {stop.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No available stops — bus has passed all pickup points</p>
                      )}
                    </div>
                  </div>

                  {/* Dropoff */}
                  <div className="relative flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 ${
                      dropoffStop !== null ? 'bg-blue-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Dropping Off At</p>
                      {pickupStop !== null ? (
                        <div className="grid grid-cols-2 gap-2">
                          {dropoffStops.map((stop) => (
                            <button
                              key={stop.orderIndex}
                              onClick={() => setDropoffStop(stop.orderIndex)}
                              className={`px-3 py-2 rounded-lg text-sm text-center transition-all duration-200 font-medium ${
                                dropoffStop === stop.orderIndex
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                              }`}
                            >
                              {stop.name}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">Select boarding point first</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fare Receipt - Navy ticket */}
              {pickupStop !== null && dropoffStop !== null && fare && (
                <div className="bg-blue-950 rounded-xl p-5 text-white animate-fade-in relative overflow-hidden">
                  {/* Faint background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                      <circle cx="80" cy="20" r="30" stroke="white" strokeWidth="0.5"/>
                      <circle cx="20" cy="80" r="20" stroke="white" strokeWidth="0.5"/>
                    </svg>
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider">{stopDistance} Stop{stopDistance > 1 ? 's' : ''}</span>
                      {user?.verificationStatus === 'VERIFIED' && user?.userType !== 'REGULAR' && (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Verified {user.userType.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 text-xs">{pickupName} → {dropoffName}</p>
                      </div>
                      <div className="text-right">
                        {fare.isDiscounted && (
                          <span className="text-blue-400 line-through text-sm mr-2">₱{fare.regularFare}</span>
                        )}
                        <span className="text-3xl font-extrabold text-white">₱{fare.fare}</span>
                      </div>
                    </div>
                    {fare.isDiscounted && (
                      <p className="text-emerald-400 text-xs mt-1">Saving ₱{fare.savings}</p>
                    )}
                  </div>
                </div>
              )}

              {fare && fare.isDiscounted && <FareDisplay fare={fare} />}

              <button
                disabled={pickupStop === null || dropoffStop === null}
                onClick={() => setStep(2)}
                className="w-full btn-primary py-3"
              >
                Choose Seat
              </button>
            </div>
          )}

          {/* Step 2: Seat Selection */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Pick a Seat</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{pickupName} → {dropoffName}</p>
                </div>
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                  ← Back
                </button>
              </div>

              <SeatPicker seats={seats} selectedSeatId={selectedSeat?.id} onSelect={setSelectedSeat} />

              {/* Guest name input */}
              {!user && selectedSeat && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    You&apos;ll get a reference code to show the staff. <a href="/auth/register" className="text-blue-600 font-medium hover:underline">Register</a> for student/PWD/senior discounts.
                  </p>
                </div>
              )}

              {/* Sticky action bar - glassmorphism */}
              {selectedSeat && fare && (
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl p-4 animate-fade-in shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {selectedSeat.label}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{pickupName} → {dropoffName}</p>
                        <p className="text-xs text-slate-400">{stopDistance} stop{stopDistance > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-600">₱{fare.fare}</p>
                  </div>

                  <button
                    disabled={!selectedSeat || loading || (!user && !guestName.trim())}
                    onClick={handleBookSeat}
                    className="w-full btn-dark"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Booking...
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4 inline mr-2 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Hold Seat & Pay
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && booking && (
            <div className="space-y-5">
              {/* Seat reserved header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-extrabold text-lg text-slate-800">Seat Reserved!</h3>
                <p className="text-sm text-slate-400">Choose how you want to pay</p>
              </div>

              {/* Booking summary */}
              <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
                {booking.guestName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Name</span>
                    <span className="font-medium text-slate-700 text-sm">{booking.guestName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Bus</span>
                  <span className="font-medium text-slate-700 text-sm">{bus.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Seat</span>
                  <span className="font-medium text-slate-700 text-sm">{booking.seat?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Route</span>
                  <span className="font-medium text-slate-700 text-sm">{booking.pickupStop?.name} → {booking.dropoffStop?.name}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-400 text-sm">Total Fare</span>
                  <span className="font-extrabold text-blue-600 text-lg">₱{typeof booking.fare === 'object' ? booking.fare.fare : booking.fare}</span>
                </div>
              </div>

              <HoldTimer holdExpiresAt={booking.holdExpiresAt} />

              <div className="space-y-3">
                  {/* Pay at counter option */}
                  <button
                    onClick={handlePayCash}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">Pay on Board (Cash)</p>
                      <p className="text-xs text-slate-400 mt-0.5">Seat is reserved. Hand cash to the staff when you board.</p>
                    </div>
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
                    ) : (
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  {/* Pay online option */}
                  <button
                    onClick={handlePayOnline}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm">Pay Online</p>
                      <p className="text-xs text-slate-400 mt-0.5">GCash, Maya, or card — instant confirmation.</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button onClick={onClose} className="w-full text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors py-2">
                    Pay Later (hold expires in 10 min)
                  </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
