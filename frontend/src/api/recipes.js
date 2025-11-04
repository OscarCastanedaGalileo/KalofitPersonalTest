import { backendClient } from './backendClient';

// Funciones para manejar recetas
export async function getRecipes() {
  console.log("[getRecipes] GET /api/recipes");
  const response = await backendClient.get('/api/recipes');
  return Array.isArray(response) ? response : [];
}

export async function createFoodLogsFromRecipe(recipeId, data) {
  console.log("[createFoodLogsFromRecipe] POST /api/foodlog-from-recipe/" + recipeId, data);
  return await backendClient.post(`/api/foodlog-from-recipe/${recipeId}`, data);
}

export async function getRecipeById(id) {
  console.log("[getRecipeById] GET /api/recipes/" + id);
  return await backendClient.get(`/api/recipes/${id}`);
}

export async function deleteRecipe(id) {
  console.log("[deleteRecipe] DELETE /api/recipes/" + id);
  return await backendClient.delete(`/api/recipes/${id}`);
}

export async function updateRecipe(id, data) {
  console.log("[updateRecipe] PUT /api/recipes/" + id, data);
  return await backendClient.put(`/api/recipes/${id}`, data);
}