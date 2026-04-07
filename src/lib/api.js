const BASE = '';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const api = {
  // Auth
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/auth/me'),
  verifyId: (body) => request('/api/auth/verify-id', { method: 'POST', body: JSON.stringify(body) }),

  // Buses
  getBuses: () => request('/api/buses'),
  getBus: (id) => request(`/api/buses/${id}`),
  getBusSeats: (id) => request(`/api/buses/${id}/seats`),

  // Bookings
  createBooking: (body) => request('/api/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getBooking: (id) => request(`/api/bookings/${id}`),
  getMyBookings: () => request('/api/bookings/my'),
  cancelBooking: (id) => request(`/api/bookings/${id}/cancel`, { method: 'POST' }),
  getFareEstimate: (params) => request(`/api/bookings/fare-estimate?${new URLSearchParams(params)}`),

  // Payments
  createCheckout: (body) => request('/api/payments/checkout', { method: 'POST', body: JSON.stringify(body) }),
  createCashPayment: (body) => request('/api/payments/cash', { method: 'POST', body: JSON.stringify(body) }),
  mockConfirmPayment: (body) => request('/api/payments/mock-confirm', { method: 'POST', body: JSON.stringify(body) }),
  getPaymentStatus: (bookingId) => request(`/api/payments/${bookingId}/status`),

  // Staff
  unlockBus: (id, passcode) => request(`/api/staff/buses/${id}/unlock`, { method: 'POST', body: JSON.stringify({ passcode }) }),
  getStaffSeatmap: (id) => request(`/api/staff/buses/${id}/seatmap`),

  // Admin
  seedData: () => request('/api/admin/seed', { method: 'POST' }),
  setBusPasscode: (id, passcode) => request(`/api/admin/buses/${id}`, { method: 'PATCH', body: JSON.stringify({ passcode }) }),
  createBus: (body) => request('/api/admin/buses', { method: 'POST', body: JSON.stringify(body) }),
  updateBus: (id, body) => request(`/api/admin/buses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  advanceBus: (id) => request(`/api/admin/buses/${id}/advance`, { method: 'POST' }),
  updateSeat: (id, body) => request(`/api/admin/seats/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getAdminBookings: (params) => request(`/api/admin/bookings?${new URLSearchParams(params || {})}`),
  confirmCashPayment: (bookingId) => request(`/api/admin/bookings/${bookingId}/confirm`, { method: 'POST' }),
  getPendingVerifications: () => request('/api/admin/verify'),
  verifyUser: (userId, body) => request(`/api/admin/verify/${userId}`, { method: 'POST', body: JSON.stringify(body) }),
};

export default api;
