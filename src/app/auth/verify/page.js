'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

export default function VerifyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [idImageUrl, setIdImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-slate-500">Please log in first.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.verifyId({ idImageUrl, userType: user.userType });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Verification Submitted</h2>
          <p className="text-sm text-slate-500 mt-1">Staff will review your ID shortly.</p>
          <button onClick={() => router.push('/')} className="mt-4 text-blue-600 hover:underline text-sm">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Verify Your ID</h1>
        <p className="text-sm text-slate-500 mb-4 text-center">
          Upload a photo of your valid ID to get discounted fares as a {user.userType.replace('_', ' ').toLowerCase()}.
        </p>
        {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">ID Image URL</label>
            <input type="url" required value={idImageUrl} onChange={(e) => setIdImageUrl(e.target.value)}
              placeholder="https://example.com/my-id.jpg"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <p className="text-xs text-slate-400 mt-1">Upload your ID to any image host and paste the URL</p>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
