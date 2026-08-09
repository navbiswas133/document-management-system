import axios from 'axios';
import { getAuthToken } from '../features/auth/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token && config.headers.token === undefined) {
    config.headers.token = token;
  }

  return config;
});

export default api;
