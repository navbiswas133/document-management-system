// Save / read login in the browser so the user stays logged in after refresh.
const STORAGE_KEY = 'dms_auth';

export function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.token) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuthStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken() {
  return loadAuth()?.token ?? null;
}
