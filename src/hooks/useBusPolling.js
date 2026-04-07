'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function useBusPolling(intervalMs = 4000) {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchBuses = async () => {
      try {
        const data = await api.getBuses();
        if (mounted) {
          setBuses(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch buses:', err);
        if (mounted) setLoading(false);
      }
    };
    fetchBuses();
    const id = setInterval(fetchBuses, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { buses, loading };
}
