import { request } from './client';

export const bookingApi = {
  checkAvailability(params) {
    return request('/bookings/availability', { params });
  },
  create(payload) {
    return request('/bookings', { method: 'POST', body: payload });
  },
  getAll(params = {}) {
    return request('/bookings', { params });
  },
};