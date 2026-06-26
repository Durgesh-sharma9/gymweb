import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.config.responseType === 'arraybuffer' || res.config.responseType === 'blob') {
      return res;
    }
    return res.data;
  },
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong';
    if (err.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject({ message, status: err.response?.status, data: err.response?.data });
  }
);

export default api;
