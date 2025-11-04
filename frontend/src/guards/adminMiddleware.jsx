// src/guards/adminMiddleware.jsx
import { redirect } from 'react-router';
import { getToken } from '../services/tokenStore';
import { backendClient } from '../api/backendClient';

export async function adminMiddleware(_params, next) {
  const token = getToken();
  if (!token) {
    // Si no hay token, el authMiddleware ya debería haber redirigido
    throw redirect('/welcome?redirected=true');
  }

  try {
    // Obtener información del usuario actual
    const response = await backendClient.get('/users/me');
    const user = response;
    console.log({ user });
    if (user.role !== 'admin') {
      // Usuario no es admin, redirigir a dashboard o página de no autorizado
      throw redirect('/dashboard?error=access_denied');
    }

    console.log('Admin Middleware - User is admin, proceeding');
    await next();
  } catch (error) {
    console.log({
      message: "Error verificando permisos de admin o usuario no autorizado",
      error: error
    });
    // En caso de error (token expirado, usuario no encontrado, etc.), redirigir
    throw redirect('/welcome?redirected=true');
  }
}
