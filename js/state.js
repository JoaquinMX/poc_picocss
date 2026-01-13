const cache = new Map();
const state = new Map();

export function getState(key) {
  return state.get(key);
}

export function setState(key, value) {
  state.set(key, value);
}

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function setCache(key, value, ttlMs = 60000) {
  cache.set(key, {
    value,
    expiresAt: ttlMs ? Date.now() + ttlMs : null,
  });
}
