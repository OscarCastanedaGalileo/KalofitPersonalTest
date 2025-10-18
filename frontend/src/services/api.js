const BASE = import.meta.env.VITE_API_BASE_URL;

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  console.log("API", opts.method || "GET", url);
  const r = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => r.statusText);
    throw new Error(`HTTP ${r.status}: ${msg}`);
  }
  return r.json();
}

export const api = { request };
