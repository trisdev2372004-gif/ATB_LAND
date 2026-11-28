import { request } from './client';

export const amenityApi = {
  getAll(params = {}) {
    return request('/amenities', { params });
  },
  create(payload) {
    return request('/amenities', { method: 'POST', body: payload });
  },
  update(id, payload) {
    return request(`/amenities/${id}`, { method: 'PATCH', body: payload });
  },
};