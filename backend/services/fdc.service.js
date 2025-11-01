const FDC_BASE = process.env.FDC_BASE_URL || "https://api.nal.usda.gov/fdc/v1";
const API_KEY = process.env.FDC_API_KEY;

if (!API_KEY) console.warn("[fdc] FDC_API_KEY not set. Configure backend/.env");

async function fdcGet(endpoint, params = {}) {
  const url = new URL(`${FDC_BASE}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    console.error(`[fdc] Network error:`, err);
    throw new Error(`Network error while fetching FDC endpoint: ${endpoint}`);
  }
  if (!response.ok) {
    const errorMsg = `[fdc] ${endpoint} ${response.status} ${response.statusText}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  try {
    return await response.json();
  } catch (err) {
    console.error(`[fdc] Error parsing JSON:`, err);
    throw new Error(`Error parsing JSON from FDC endpoint: ${endpoint}`);
  }
}

exports.searchFoods = async (query, pageNumber = 1, pageSize = 25) =>
  fdcGet("/foods/search", { query, pageNumber, pageSize });

exports.foodById = async (fdcId) => fdcGet(`/food/${fdcId}`);

exports.listFoods = async (pageNumber = 1, pageSize = 50) =>
  fdcGet("/foods/list", { pageNumber, pageSize });
