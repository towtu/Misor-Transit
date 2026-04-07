const STORAGE_KEY = 'misor_guest_bookings';

export function saveGuestBooking(bookingId) {
  if (typeof window === 'undefined') return;
  const ids = getGuestBookingIds();
  if (!ids.includes(bookingId)) {
    ids.unshift(bookingId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

export function getGuestBookingIds() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function removeGuestBooking(bookingId) {
  if (typeof window === 'undefined') return;
  const ids = getGuestBookingIds().filter((id) => id !== bookingId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
