export { API_BASE_URL, getAuthToken, request } from './client';
export { authApi, saveAuthSession, clearAuthSession } from './authApi';
export { amenityApi } from './amenityApi';
export { accommodationApi } from './accommodationApi';
export { roomTypeApi } from './roomTypeApi';
export { rentalRoomApi } from './rentalRoomApi';
export { bookingApi } from './bookingApi';
export { ratingApi } from './ratingApi';
export { mapApi } from './mapApi';
export { uploadApi } from './uploadApi';

import { authApi } from './authApi';
import { amenityApi } from './amenityApi';
import { accommodationApi } from './accommodationApi';
import { roomTypeApi } from './roomTypeApi';
import { rentalRoomApi } from './rentalRoomApi';
import { bookingApi } from './bookingApi';
import { ratingApi } from './ratingApi';
import { mapApi } from './mapApi';
import { uploadApi } from './uploadApi';

export const api = {
  auth: authApi,
  amenities: amenityApi,
  accommodations: accommodationApi,
  roomTypes: roomTypeApi,
  rentalRooms: rentalRoomApi,
  bookings: bookingApi,
  ratings: ratingApi,
  map: mapApi,
  upload: uploadApi,
};

export default api;