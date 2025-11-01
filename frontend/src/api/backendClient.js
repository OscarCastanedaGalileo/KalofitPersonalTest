import { ApiClient } from "./ApiClient";
import {TokenRefresher } from '../services/tokenRefresher';
import { refreshToken, clearToken } from "./auth";

const tokenRefresher = new TokenRefresher(
  refreshToken,
  clearToken
);

const baseUrlApi = import.meta.env.VITE_API_BASE_URL || '';

export const backendClient = new ApiClient(baseUrlApi, {}, tokenRefresher);
