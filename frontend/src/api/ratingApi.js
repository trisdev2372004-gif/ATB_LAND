import { request } from './client';

export const ratingApi = {
  getAll(params = {}) {
    return request('/ratings', { params });
  },
  create(payload) {
    return request('/ratings', { method: 'POST', body: payload });
  },
  reply(ratingId, content) {
    return request(`/ratings/${ratingId}/reply`, { method: 'POST', body: { content } });
  },
  deleteOrHide(ratingId) {
    return request(`/ratings/${ratingId}`, { method: 'DELETE' });
  },
};