// src/router/middlewares/auth.js
import { redirect } from 'react-router';
import { getToken } from '../services/tokenStore';
import { clearToken, refreshToken } from '../api/auth';
// import useAuthToken from '../hooks/useAuthToken'; // tu store en memoria
// import { userContext } from '@/auth/routerContext';

export async function guestMiddleware(data, next) {
  let token = getToken();
  const params = new URLSearchParams(window.location.search);
  if (!token && !params.has('redirected')) {
    try {
      await refreshToken();
    } catch (e) {
      console.log({
        message: "No se pudo obtener un token",
        error: e
      })
      clearToken();
      // throw redirect('/welcome');
    }
  }

  token = getToken();
  if (token) {
    throw redirect('/');
  }

  return next();
}
