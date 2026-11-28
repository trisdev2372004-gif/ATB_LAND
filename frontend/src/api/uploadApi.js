import { request } from './client';

export const uploadApi = {
  uploadImages(files) {
    const formData = new FormData();
    Array.from(files || []).forEach((file) => {
      formData.append('images', file);
    });
    return request('/upload/images', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });
  },
};