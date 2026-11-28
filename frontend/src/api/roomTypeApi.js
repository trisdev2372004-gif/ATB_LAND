import { request } from './client';

export const roomTypeApi = {
  getByAccommodation(accommodationId, params = {}) {
    return request(`/accommodations/${accommodationId}/room-types`, { params });
  },
  create(accommodationId, payload) {
    return request(`/accommodations/${accommodationId}/room-types`, {
      method: 'POST',
      body: payload,
    });
  },
  update(roomTypeId, payload) {
    return request(`/room-types/${roomTypeId}`, { method: 'PATCH', body: payload });
  },
  remove(roomTypeId) {
    return request(`/room-types/${roomTypeId}`, { method: 'DELETE' });
  },
  addUnit(roomTypeId, payload) {
    return request(`/room-types/${roomTypeId}/units`, { method: 'POST', body: payload });
  },
  addRatePackage(roomTypeId, unitId, payload) {
    return request(`/room-types/${roomTypeId}/units/${unitId}/packages`, {
      method: 'POST',
      body: payload,
    });
  },
};