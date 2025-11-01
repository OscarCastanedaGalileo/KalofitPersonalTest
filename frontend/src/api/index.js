import { backendClient } from './backendClient';

export async function getAggregate({ period = "day", from, to } = {}) {
  const params = {};
  if (period) params.period = period;
  if (from) params.from = from;
  if (to) params.to = to;

  return await backendClient.get('api/summary/aggregate', params);
}

export async function getFoodLogs({ from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  console.log("[getFoodLogs] GET /foodlogs with params:", params);

  const payload = await backendClient.get('/api/foodlogs', params);
  const list = Array.isArray(payload) ? payload : payload?.rows || payload?.items || payload?.data || [];

  console.log("[getFoodLogs] items:", Array.isArray(list) ? list.length : 0);
  return list;
}

// Nuevas funciones para CRUD completo de food logs
export async function getFoodLogsByDate(date) {
  const params = { date };
  console.log("[getFoodLogsByDate] GET /foodlogs/date with params:", params);

  const payload = await backendClient.get('/api/foodlogs/date', params);
  return payload;
}

export async function getDetailedFoodLogsByDate(date) {
  const params = { date };
  console.log("[getDetailedFoodLogsByDate] GET /foodlogs/date/detailed with params:", params);

  const payload = await backendClient.get('/api/foodlogs/date/detailed', params);
  return payload;
}

export async function createFoodLog(data) {
  console.log("[createFoodLog] POST /foodlogs with data:", data);
  return await backendClient.post('/api/foodlogs', data);
}

export async function updateFoodLog(id, data) {
  console.log("[updateFoodLog] PUT /foodlogs/" + id + " with data:", data);
  return await backendClient.put(`/api/foodlogs/${id}`, data);
}

export async function getFoodLogById(id) {
  console.log("[getFoodLogById] GET /foodlogs/" + id);
  return await backendClient.get(`/api/foodlogs/${id}`);
}

export async function deleteFoodLog(id) {
  console.log("[deleteFoodLog] DELETE /foodlogs/" + id);
  return await backendClient.delete(`/api/foodlogs/${id}`);
}

export async function getDateTotals({ limit = 30, offset = 0 } = {}) {
  const params = { limit, offset };
  console.log("[getDateTotals] GET /foodlogs/totals with params:", params);

  const payload = await backendClient.get('/api/foodlogs/totals', params);
  return payload;
}

export async function getFoods() {
  console.log("[getFoods] GET /foods");
  return await backendClient.get('/foods/all');
}

export async function getFoodUnitsByFoodId(foodId) {
  console.log("[getFoodUnitsByFoodId] GET /foodunits?foodId=" + foodId);
  return await backendClient.get('/api/foodunits', { foodId });
}

export async function getUnits() {
  console.log("[getUnits] GET /foodunits/units");
  return await backendClient.get('/api/foodunits/units');
}

export async function getTags() {
  console.log("[getTags] GET /me/tags");
  return await backendClient.get('/api/me/tags');
}

export async function getProfile() {
  console.log("[getProfile] GET /me/profile");
  return await backendClient.get('/api/me/profile');
}

export async function updateProfile(data) {
  console.log("[updateProfile] PUT /me/profile with data:", data);
  return await backendClient.put('/api/me/profile', data);
}
