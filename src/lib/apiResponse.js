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

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  const data = error.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data?.message?.trim()) {
    return data.message;
  }

  return fallback;
}
