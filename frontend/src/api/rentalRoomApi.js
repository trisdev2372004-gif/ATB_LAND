import { request } from './client';

export const rentalRoomApi = {
  getAll(params = {}) {
    return request('/rental-rooms', { params });
  },
  getMine() {
    return request('/rental-rooms/mine').catch(() => request('/rental-rooms'));
  },
  getDetail(idOrSlug) {
    return request(`/rental-rooms/${idOrSlug}`);
  },
  create(payload) {
    return request('/rental-rooms', { method: 'POST', body: payload });
  },
  update(id, payload) {
    return request(`/rental-rooms/${id}`, { method: 'PATCH', body: payload });
  },
};