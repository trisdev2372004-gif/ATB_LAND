import { request } from './client';

export function saveAuthSession({ token, user }) {
  if (token) localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event('auth-changed'));
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  window.dispatchEvent(new Event('auth-changed'));
}

export const authApi = {
  register(payload) {
    return request('/auth/register', { method: 'POST', body: payload });
  },

  async registerAndLogin(payload) {
    const res = await request('/auth/register', { method: 'POST', body: payload });
    let token = res.token || res.data?.token;
    let user = res.user || res.data?.user;

    if (!token && payload?.email && payload?.password) {
      const loginRes = await this.login({
        identifier: payload.email,
        email: payload.email,
        password: payload.password,
      });
      token = loginRes.token || loginRes.data?.token;
      user = loginRes.user || loginRes.data?.user || user;
    }

    const finalUser = {
      ...(user || {}),
      email: user?.email || payload?.email,
      role: user?.role || payload?.role || 'GUEST',
    };

    saveAuthSession({ token, user: finalUser });
    return { ...res, token, user: finalUser };
  },

  async login(payload) {
    const res = await request('/auth/login', { method: 'POST', body: payload });
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;
    if (token && user) {
      saveAuthSession({ token, user });
    }
    return res;
  },

  logout() {
    clearAuthSession();
  },

  toggleSavedListing(accommodationId) {
    return request(`/auth/saved/${accommodationId}`, { method: 'POST' });
  },
};