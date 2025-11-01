/**
 * @file middleware/requireAuth.js
 * @description
 * Middleware para proteger rutas con **JWT de acceso** (no el refresh).
 *
 * - **Cómo**: lee el header `Authorization: Bearer <token>`, verifica firma y exp,
 *   y adjunta `req.user` con `{ id, role }`.
 * - **Por qué**: centraliza la validación por request y evita duplicar lógica.
 * - **Para qué**: aplicar control de acceso en endpoints como `/me`, `/api/*`, etc.
 *
 * SUGERENCIA: combina esto con un middleware de autorización por rol
 * (`requireRole('admin')`), si lo necesitas.
 */

const { verifyAccess } = require("../utils/tokens");

/**
 * Extrae el token Bearer del header Authorization.
 * Acepta mayúsculas/minúsculas y espacios extra.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
function getBearerFromHeader(req) {
  const auth = (req.headers.authorization || "").trim();
  if (!auth) return null;
  const [scheme, token] = auth.split(/\s+/);
  if (!/^Bearer$/i.test(scheme) || !token) return null;
  return token;
}

/**
 * Middleware que **exige** un Access Token válido.
 * - 401 si no hay token o si es inválido/expirado.
 * - En éxito, define `req.user = { id, role }`.
 * @type {import('express').RequestHandler}
 */
function requireAuth(req, res, next) {
  const token = getBearerFromHeader(req);
  if (!token) {
    return res.status(401).json({ error: "No token (se requiere Authorization: Bearer <token>)" });
  }

  try {
    const payload = verifyAccess(token); // { sub, role, iat, exp }
    req.user = { id: payload.sub, role: payload.role };
    console.log({payload});
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

/**
 * (Opcional) Middleware de autorización por rol.
 * - **Cómo**: usar después de `requireAuth`.
 * - **Por qué**: separar autenticación de autorización (principio de responsabilidad única).
 * @param {...string} roles - Roles permitidos (p. ej. "admin", "manager").
 * @returns {import('express').RequestHandler}
 * @example
 * app.get('/admin/dashboard', requireAuth, requireRole('admin'), (req,res)=>{ ... })
 */
function requireRole(...roles) {
  const allowed = new Set(roles);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "No autenticado" });
    if (!allowed.has(req.user.role)) return res.status(403).json({ error: "No autorizado" });
    next();
  };
}

module.exports = { requireAuth, requireRole };
