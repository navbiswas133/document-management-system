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

export function isAbortError(error) {
  return (
    error?.name === 'CanceledError' ||
    error?.name === 'AbortError' ||
    error?.code === 'ERR_CANCELED' ||
    (error?.code === 'ECONNABORTED' && error?.message?.includes('aborted'))
  );
}

function getHttpStatusMessage(status, fallback) {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timed out. Please try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 502:
    case 504:
      return 'The server is not responding. Please try again.';
    case 503:
      return 'Service is temporarily unavailable. Please try again in a moment.';
    default:
      if (status >= 500) {
        return 'Server error. Please try again later.';
      }
      return fallback;
  }
}

function isAxiosStatusMessage(message) {
  return /request failed with status code/i.test(message);
}

export function getApiErrorMessage(error, fallback) {
  if (isAbortError(error)) {
    return fallback;
  }

  if (error instanceof ApiResponseError) {
    return error.message;
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Network error. Check your connection and try again.';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }

  const status = error?.response?.status;

  if (status) {
    const data = error.response?.data;
    const apiMessage = data ? getResponseErrorMessage(data, '') : '';

    if (apiMessage && !isAxiosStatusMessage(apiMessage)) {
      return apiMessage;
    }

    return getHttpStatusMessage(status, fallback);
  }

  if (error instanceof Error && error.message.trim()) {
    if (isAxiosStatusMessage(error.message)) {
      return fallback;
    }

    return error.message;
  }

  const data = error?.response?.data;

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
