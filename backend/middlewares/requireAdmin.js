'use strict';

/**
 * Middleware que exige que el usuario autenticado tenga rol 'admin'.
 * Usa `req.user` que debe haber sido asignado por `requireAuth`.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const role = String(req.user.role || '').toLowerCase();
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Requiere privilegios de administrador' });
  }
  return next();
}

module.exports = requireAdmin;
