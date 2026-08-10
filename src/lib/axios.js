import axios from 'axios';
import { getAuthToken } from '../features/auth/authStorage';
import { isAbortError } from './apiResponse';
import { notifyApiError } from './apiToast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token && config.headers.token === undefined) {
    config.headers.token = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.config?.skipErrorToast && !isAbortError(error)) {
      notifyApiError(error);
    }

    return Promise.reject(error);
  },
);

export default api;
