// src/hooks/useAuthToken.js
import { useState, useCallback } from 'react';
import{setToken, getToken } from '../services/tokenStore';
import { redirect } from "react-router";
import { refreshToken, login as loginApi, logout as logoutApi } from '../api/auth';
import { clearProfile } from '../services/profileStore';


export default function useAuthToken() {
  const [loading, setLoading] = useState(false);

  // 🔹 Refresca el token al montar (si existe cookie HttpOnly)
  const refresh = useCallback(async () => {
    try {
      const res = await refreshToken();
      if (res?.accessToken) {
        return res.accessToken;
      }
    } catch (err) {
      console.warn('No se pudo refrescar el token', {
       err
      });
    }
    setToken(null);
    return null;
  }, []);

  // 🔹 Login
  const login = useCallback(async ({email, password}) => {
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      if (!res?.accessToken) throw new Error('No access token in response');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Logout
  const logout = useCallback(async () => {
    try {
      await logoutApi();
      redirect('/welcome');
    } catch (err) {
      console.error('Error logging out', { err });
    }
    setToken(null);
    clearProfile();
  }, []);

  // 🔹 Cabecera lista para usar en el ApiClient
  const getAuthHeader = useCallback(() => {
    const accessToken = getToken();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, []);
  return { getToken, login, logout, refresh, getAuthHeader, loading };
}
