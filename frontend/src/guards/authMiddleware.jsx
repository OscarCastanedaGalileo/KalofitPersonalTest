// src/router/middlewares/auth.js
import { redirect } from 'react-router';
import { getToken } from '../services/tokenStore';
import { refreshToken, clearToken } from '../api/auth';
// import { api } from '@/api/apiClientInstance';
// import { userContext } from '@/auth/routerContext';

export async function authMiddleware({ context }, next) {
  const token = getToken();
  if (!token){
    try {
      console.log('Auth Middleware - No token found');
      await refreshToken();
    }catch(e) {
      console.log({
        message:"No se pudo obtener un token",
        error: e
      })
      context.fail = true
      clearToken();
      throw redirect('/welcome?redirected=true');
    }
  }
  console.log('Auth Middleware - After Next');
  await next();
}
