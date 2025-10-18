const FDC_BASE = process.env.FDC_BASE_URL || "https://api.nal.usda.gov/fdc/v1";
const API_KEY  = process.env.FDC_API_KEY;

if (!API_KEY) console.warn("[fdc] FDC_API_KEY no definido. Configura backend/.env");

async function fdcGet(path, params = {}) {
  const url = new URL(`${FDC_BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [k,v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const r = await fetch(url);
  if (!r.ok) throw new Error(`FDC ${path} ${r.status} ${r.statusText}`);
  return r.json();
}

exports.searchFoods = (query, pageNumber = 1, pageSize = 25) =>
  fdcGet("/foods/search", { query, pageNumber, pageSize });

exports.foodById = (fdcId) => fdcGet(`/food/${fdcId}`);

exports.listFoods = (pageNumber = 1, pageSize = 50) =>
  fdcGet("/foods/list", { pageNumber, pageSize });
