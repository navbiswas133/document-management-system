// Shared HTTP client for all backend calls. Base URL comes from .env (VITE_API_BASE_URL).
import axios from 'axios';
import { ADMIN_SESSION_TOKEN } from '../constants/adminAuth';
import { getAuthToken } from '../features/auth/authStorage';
import { isAbortError } from './apiResponse';
import { notifyApiError } from './apiToast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
});

// Before each request: attach login token header when the user is signed in.
api.interceptors.request.use((config) => {
  const token = getAuthToken();

  // Demo admin token is fake — only real user tokens go on document API calls.
  if (
    token
    && token !== ADMIN_SESSION_TOKEN
    && config.headers.token === undefined
  ) {
    config.headers.token = token;
  }

  return config;
});

// On failed requests: show a toast unless the caller opted out (e.g. login forms).
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
