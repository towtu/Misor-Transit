'use client';
import { useState, useEffect } from 'react';

export default function HoldTimer({ holdExpiresAt }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(holdExpiresAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(diff / 1000)));
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  if (remaining <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
        <p className="text-red-600 font-semibold text-sm">Hold expired — seat released</p>
      </div>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining < 120;
  const progress = Math.min(remaining / 600, 1); // 10 min = 600s

  return (
    <div className={`rounded-xl p-3 text-center ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <p className={`text-[10px] uppercase tracking-widest font-semibold ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
        Hold expires in
      </p>
      <p className={`text-3xl font-mono font-bold mt-1 tabular-nums ${isUrgent ? 'text-red-600 animate-timer-pulse' : 'text-amber-700'}`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </p>
      <div className={`mt-2 h-1 rounded-full ${isUrgent ? 'bg-red-100' : 'bg-amber-100'} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-400' : 'bg-amber-400'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
