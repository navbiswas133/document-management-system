const inflightRequests = new Map();

export function withInflightDedup(key, runner) {
  const existing = inflightRequests.get(key);

  if (existing) {
    return existing;
  }

  const promise = runner().finally(() => {
    inflightRequests.delete(key);
  });

  inflightRequests.set(key, promise);

  return promise;
}
