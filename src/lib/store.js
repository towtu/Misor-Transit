'use client';
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,
  setAuth: (user, token) => {
    if (token) localStorage.setItem('token', token);
    set({ user, token, loading: false });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, loading: false });
  },
  setLoading: (loading) => set({ loading }),
}));

export const useMapStore = create((set) => ({
  selectedBus: null,
  showSeatPicker: false,
  selectBus: (bus) => set({ selectedBus: bus, showSeatPicker: true }),
  closeSeatPicker: () => set({ showSeatPicker: false, selectedBus: null }),
}));
