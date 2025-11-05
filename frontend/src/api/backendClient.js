import { ApiClient } from "./ApiClient";
import {TokenRefresher } from '../services/tokenRefresher';
import { refreshToken, clearToken } from "./auth";

const tokenRefresher = new TokenRefresher(
  refreshToken,
  clearToken
);

const baseUrlApi = import.meta.env.VITE_API_BASE_URL || '';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://kalofrontend.onrender.com';

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const backendClient = new ApiClient(baseUrlApi, {}, tokenRefresher);
