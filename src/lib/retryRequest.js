const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);
const DEFAULT_RETRIES = 2;
const BASE_DELAY_MS = 400;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getResponseStatus(error) {
  return error?.response?.status;
}

export function isRetryableServiceError(error) {
  return RETRYABLE_STATUS_CODES.has(getResponseStatus(error));
}

export async function withServiceRetry(
  requestFn,
  { retries = DEFAULT_RETRIES, baseDelayMs = BASE_DELAY_MS } = {},
) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (attempt >= retries || !isRetryableServiceError(error)) {
        throw error;
      }

      await delay(baseDelayMs * (attempt + 1));
    }
  }

  throw lastError;
}
