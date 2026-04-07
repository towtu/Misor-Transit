'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import BusControls from '@/components/admin/BusControls';
import BusManager from '@/components/admin/BusManager';
import VerifyUsers from '@/components/admin/VerifyUsers';
import api from '@/lib/api';

const TABS = ['Buses', 'Bookings', 'Verify', 'Add Bus', 'Seed'];

function ConfirmCashButton({ bookingId, onConfirmed }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    if (!confirm('Confirm that you received the cash payment for this booking?')) return;
    setLoading(true);
    try {
      await api.confirmCashPayment(bookingId);
      setDone(true);
      onConfirmed();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) return <span className="text-xs text-emerald-600 font-semibold">Confirmed</span>;

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 whitespace-nowrap"
    >
      {loading ? '...' : 'Confirm Cash'}
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [tab, setTab] = useState('Buses');
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedMsg, setSeedMsg] = useState('');
  const [refSearch, setRefSearch] = useState('');

  const fetchBuses = useCallback(async () => {
    try {
      const data = await api.getBuses();
      setBuses(data);
    } catch {}
    setLoading(false);
  }, []);

  const fetchBookings = useCallback(async (params) => {
    try {
      const data = await api.getAdminBookings(params);
      setBookings(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !['STAFF', 'ADMIN'].includes(user.role)) {
      router.push('/');
      return;
    }
    fetchBuses();
    const id = setInterval(fetchBuses, 5000);
    return () => clearInterval(id);
  }, [user, authLoading, router, fetchBuses]);

  useEffect(() => {
    if (tab === 'Bookings') fetchBookings();
  }, [tab, fetchBookings]);

  const handleSeed = async () => {
    setSeedMsg('Seeding...');
    try {
      const data = await api.seedData();
      setSeedMsg(data.message || 'Done!');
      fetchBuses();
    } catch (err) {
      setSeedMsg(err.message);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-slate-500">Loading...</p></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Manage buses, bookings, and users</p>
      </div>

      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
              tab === t ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Buses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map((bus) => (
            <BusControls key={bus.id} bus={bus} onUpdate={fetchBuses} />
          ))}
          {buses.length === 0 && <p className="text-slate-500 col-span-2">No buses. Seed data or add a bus first.</p>}
        </div>
      )}

      {tab === 'Bookings' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value.toUpperCase())}
              placeholder="Search by reference code — e.g. MOR-A3X9K2"
              className="input-field flex-1"
            />
            <button
              onClick={() => fetchBookings(refSearch ? { refCode: refSearch } : {})}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Search
            </button>
            {refSearch && (
              <button
                onClick={() => { setRefSearch(''); fetchBookings(); }}
                className="text-slate-400 px-3 py-2 text-sm hover:text-slate-600 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {bookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookings.map((b) => {
                const bookingStatusColors = {
                  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200',
                  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
                  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
                  REFUNDED: 'bg-slate-50 text-slate-500 border-slate-200',
                };
                const isCashPending = b.status === 'ON_HOLD' && b.payment?.method === 'CASH' && b.payment?.status === 'PENDING';
                return (
                  <div key={b.id} className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${isCashPending ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
                    {/* Seat badge */}
                    <div className="w-10 h-10 bg-blue-950 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">{b.seat?.label || '—'}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800 text-sm">
                          {b.user ? `${b.user.firstName} ${b.user.lastName}` : b.guestName}
                          {!b.user && <span className="text-xs text-slate-400 font-normal ml-1">(guest)</span>}
                        </p>
                        {b.referenceCode && (
                          <span className="font-mono text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">{b.referenceCode}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {b.bus?.name} · {b.pickupStop?.name} → {b.dropoffStop?.name}
                      </p>
                    </div>

                    {/* Fare */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-blue-600">₱{typeof b.fare === 'object' ? b.fare.fare : b.fare}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {b.payment?.method === 'CASH' ? 'Cash' : b.payment?.method || 'Online'}
                      </p>
                    </div>

                    {/* Status */}
                    <span className={`badge border flex-shrink-0 ${bookingStatusColors[b.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {b.status.replace('_', ' ')}
                    </span>

                    {/* Action */}
                    {isCashPending && (
                      <ConfirmCashButton bookingId={b.id} onConfirmed={fetchBookings} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'Verify' && <VerifyUsers />}

      {tab === 'Add Bus' && <BusManager onCreated={fetchBuses} />}

      {tab === 'Seed' && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-slate-800 mb-2">Seed Database</h3>
          <p className="text-sm text-slate-500 mb-4">Creates the route, stops, fare rules, demo buses, and demo users.</p>
          <button onClick={handleSeed}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Run Seed
          </button>
          {seedMsg && <p className="mt-3 text-sm text-slate-600">{seedMsg}</p>}
        </div>
      )}
    </div>
  );
}
