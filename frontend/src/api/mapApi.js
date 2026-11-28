import { request } from './client';

export const mapApi = {
  getNearby(params) {
    return request('/map/nearby', { params });
  },
};