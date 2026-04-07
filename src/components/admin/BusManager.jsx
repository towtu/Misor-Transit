'use client';
import { useState } from 'react';
import api from '@/lib/api';

export default function BusManager({ onCreated }) {
  const [form, setForm] = useState({ plateNumber: '', name: '', busType: 'COASTER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.createBus(form);
      setForm({ plateNumber: '', name: '', busType: 'COASTER' });
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
      <h3 className="font-semibold text-slate-800">Add New Bus</h3>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Plate Number" required value={form.plateNumber}
          onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="text" placeholder="Bus Name" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <select value={form.busType} onChange={(e) => setForm({ ...form, busType: e.target.value })}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        <option value="COASTER">Coaster (30 seats)</option>
        <option value="FULL_BUS">Full Bus (45 seats)</option>
      </select>
      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Creating...' : 'Add Bus'}
      </button>
    </form>
  );
}
