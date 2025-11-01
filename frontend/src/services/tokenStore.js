let token = null;
const listeners = new Set();

export function getToken() {
  return token;
}

export function setToken(next) {
  token = next || null;
  listeners.forEach(l => l(token));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
