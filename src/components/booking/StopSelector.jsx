'use client';

export default function StopSelector({ stops, pickupStop, dropoffStop, onPickupChange, onDropoffChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm text-slate-600 mb-1">Pickup Stop</label>
        <select
          value={pickupStop ?? ''}
          onChange={(e) => onPickupChange(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select pickup...</option>
          {stops.map((stop) => (
            <option key={stop.orderIndex} value={stop.orderIndex} disabled={stop.orderIndex === dropoffStop}>
              {stop.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm text-slate-600 mb-1">Drop-off Stop</label>
        <select
          value={dropoffStop ?? ''}
          onChange={(e) => onDropoffChange(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select drop-off...</option>
          {stops.map((stop) => (
            <option key={stop.orderIndex} value={stop.orderIndex} disabled={stop.orderIndex === pickupStop}>
              {stop.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
