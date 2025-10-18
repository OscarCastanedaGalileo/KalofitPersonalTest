import { api } from "./api";

export async function searchFoods(query, page = 1, size = 25) {
  const q = encodeURIComponent(query);
  return api.request(`/api/foods?q=${q}&page=${page}&size=${size}`);
}

export async function getFoodById(fdcId) {
  return api.request(`/api/foods/${fdcId}`);
}
