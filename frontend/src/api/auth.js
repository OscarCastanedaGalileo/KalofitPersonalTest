import { setToken } from "../services/tokenStore";
import { clearProfile } from "../services/profileStore";
import { backendClient } from "./backendClient";

export async function register({ email, password, confirmPassword, name }) {
  return backendClient.post('auth/register', { email, password, confirmPassword, name });
}

export async function verifyEmail(token) {
  return backendClient.get(`auth/verify/${token}`);
}

export async function sendVerificationEmail(email) {
  return backendClient.post('auth/resend-verification', { email });
}

export async function login({ email, password }) {
  const response = await backendClient.post('auth/login', { email, password });
  if (!response?.accessToken) {
    throw new Error('No access token in response');
  }
  savingToken(response.accessToken);
  return response;
}

export async function logout() {
   const response = await backendClient.post('auth/logout');
   clearToken();
   return response;
}

export async function refreshToken() {
  const response = await backendClient.post('auth/refresh');
  if (!response?.accessToken) {
    clearToken();
    throw new Error('No access token in response');
  }
  savingToken(response.accessToken);
  return response;
}

export async function sendResetCode(email) {
  return backendClient.post('auth/forgot-password', { email });
}

export async function resetPassword({ email, code, password, confirmPassword }) {
  return backendClient.post('auth/reset-password', { email, code, password, confirmPassword });
}

function savingToken(token) {
  if (!token) return;
  console.log('Setting token in store and ApiClient');
  setToken(token);
  backendClient.setGlobalHeader('Authorization', `Bearer ${token}`);
  console.log('Token set successfully');
}

export function clearToken() {
  setToken(null);
  clearProfile();
  backendClient.removeGlobalHeader('Authorization');
}
