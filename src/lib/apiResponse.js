export function getResponseSuccessMessage(data, fallback) {
  if (data?.message?.trim()) {
    return data.message;
  }

  if (typeof data?.data === 'string' && data.data.trim()) {
    return data.data;
  }

  return fallback;
}

export function getResponseErrorMessage(data, fallback) {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data?.message?.trim()) {
    return data.message;
  }

  if (typeof data?.data === 'string' && data.data.trim()) {
    return data.data;
  }

  return fallback;
}

export class ApiResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

export function getApiErrorMessage(error, fallback) {
  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Network error. Restart the dev server after pulling latest changes, then try again.';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  const data = error.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data) {
    const apiMessage = getResponseErrorMessage(data, '');

    if (apiMessage) {
      return apiMessage;
    }
  }

  return fallback;
}
