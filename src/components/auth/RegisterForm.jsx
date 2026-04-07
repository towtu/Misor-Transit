'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    phone: '', userType: 'REGULAR', dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const body = { ...form };
      if (!body.phone) delete body.phone;
      if (!body.dateOfBirth) delete body.dateOfBirth;
      const { user, token } = await api.register(body);
      setAuth(user, token);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const userTypeOptions = [
    { value: 'REGULAR', label: 'Regular', desc: 'Standard fare' },
    { value: 'STUDENT', label: 'Student', desc: '20% discount' },
    { value: 'SENIOR_CITIZEN', label: 'Senior Citizen', desc: '20% discount' },
    { value: 'PWD', label: 'PWD', desc: '20% discount' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
          <input type="text" required value={form.firstName} onChange={set('firstName')} placeholder="Juan" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
          <input type="text" required value={form.lastName} onChange={set('lastName')} placeholder="Dela Cruz" className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
        <input type="email" required value={form.email} onChange={set('email')} placeholder="you@example.com" className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
        <input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Passenger Type</label>
        <div className="grid grid-cols-2 gap-2">
          {userTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm({ ...form, userType: opt.value })}
              className={`px-3 py-2.5 rounded-xl border text-left transition-all duration-200 ${
                form.userType === opt.value
                  ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <p className={`text-sm font-medium ${form.userType === opt.value ? 'text-blue-700' : 'text-slate-700'}`}>{opt.label}</p>
              <p className="text-[11px] text-slate-400">{opt.desc}</p>
            </button>
          ))}
        </div>
        {form.userType !== 'REGULAR' && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mt-2">
            Discount requires ID verification after registration.
          </p>
        )}
      </div>

      {form.userType === 'SENIOR_CITIZEN' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
          <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} className="input-field" />
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full btn-primary py-3">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account...
          </span>
        ) : 'Create Account'}
      </button>

      <p className="text-sm text-center text-slate-500">
        Have an account? <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
      </p>
    </form>
  );
}
