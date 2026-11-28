import { request } from './client';

export const accommodationApi = {
  getAll(params = {}) {
    return request('/accommodations', { params });
  },
  getMine() {
    return request('/accommodations/mine').catch(() => request('/accommodations'));
  },
  getDetail(idOrSlug, params = {}) {
    return request(`/accommodations/${idOrSlug}`, { params });
  },
  create(payload) {
    return request('/accommodations', { method: 'POST', body: payload });
  },
  updateStatus(id, status) {
    return request(`/accommodations/${id}/status`, { method: 'PATCH', body: { status } });
  },
  report(id, payload = {}) {
    return request(`/accommodations/${id}/report`, { method: 'POST', body: payload });
  },
};