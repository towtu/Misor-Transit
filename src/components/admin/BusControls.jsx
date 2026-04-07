'use client';
import { useState } from 'react';
import api from '@/lib/api';

const directionLabels = {
  TAGOLOAN_TO_CDO: 'Tag → CDO',
  CDO_TO_TAGOLOAN: 'CDO → Tag',
};

export default function BusControls({ bus, onUpdate }) {
  const [loading, setLoading] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeMsg, setPasscodeMsg] = useState('');

  const action = async (label, body) => {
    setLoading(label);
    try {
      await api.updateBus(bus.id, body);
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading('');
    }
  };

  const advance = async () => {
    setLoading('advance');
    try {
      await api.advanceBus(bus.id);
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{bus.name}</h3>
          <p className="text-xs text-slate-500">{bus.plateNumber} &middot; {bus.busType}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          bus.status === 'RUNNING' ? 'bg-green-100 text-green-700' :
          bus.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-700' :
          'bg-slate-100 text-slate-600'
        }`}>{bus.status}</span>
      </div>

      <div className="text-sm text-slate-600 mb-3">
        <p>{directionLabels[bus.direction]} &middot; Stop: {bus.currentStopName || bus.currentStopIdx}</p>
        <p>Speed: {bus.simSpeed || 2}x &middot; Seats: {bus.availableSeats}/{bus.totalSeats}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {bus.status !== 'RUNNING' && (
          <button onClick={() => action('start', { status: 'RUNNING' })} disabled={!!loading}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-50">
            {loading === 'start' ? '...' : 'Start'}
          </button>
        )}
        {bus.status === 'RUNNING' && (
          <button onClick={() => action('pause', { status: 'PAUSED' })} disabled={!!loading}
            className="text-xs bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 disabled:opacity-50">
            {loading === 'pause' ? '...' : 'Pause'}
          </button>
        )}
        <button onClick={() => action('park', { status: 'PARKED' })} disabled={!!loading}
          className="text-xs bg-slate-600 text-white px-3 py-1.5 rounded hover:bg-slate-700 disabled:opacity-50">
          {loading === 'park' ? '...' : 'Park'}
        </button>
        <button onClick={advance} disabled={!!loading}
          className="text-xs border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 disabled:opacity-50">
          {loading === 'advance' ? '...' : 'Advance'}
        </button>
        <button
          onClick={() => action('dir', {
            direction: bus.direction === 'TAGOLOAN_TO_CDO' ? 'CDO_TO_TAGOLOAN' : 'TAGOLOAN_TO_CDO'
          })}
          disabled={!!loading}
          className="text-xs border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 disabled:opacity-50"
        >
          Flip Dir
        </button>
      </div>

      <div className="mt-3">
        <label className="text-xs text-slate-500">Speed</label>
        <input type="range" min={1} max={5} value={bus.simSpeed || 2}
          onChange={(e) => action('speed', { simSpeed: Number(e.target.value) })}
          className="w-full h-1 accent-blue-600" />
        <div className="flex justify-between text-xs text-slate-400">
          <span>1x</span><span>5x</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <label className="text-xs text-slate-500">Bus Passcode (staff unlock)</label>
        <div className="flex gap-2 mt-1">
          <input
            type="text"
            value={newPasscode}
            onChange={(e) => setNewPasscode(e.target.value)}
            placeholder="New passcode"
            className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={async () => {
              setPasscodeMsg('');
              try {
                await api.setBusPasscode(bus.id, newPasscode);
                setPasscodeMsg(newPasscode ? 'Passcode updated' : 'Passcode cleared');
                setNewPasscode('');
              } catch (err) {
                setPasscodeMsg(err.message);
              }
            }}
            className="text-xs bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            Set
          </button>
        </div>
        {passcodeMsg && <p className="text-xs text-emerald-600 mt-1">{passcodeMsg}</p>}
        <p className="text-[10px] text-slate-400 mt-1">Leave blank to clear the passcode.</p>
      </div>
    </div>
  );
}
