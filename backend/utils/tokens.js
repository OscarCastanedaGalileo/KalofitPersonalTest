/**
 * @module utils/tokens
 * @description
 * Utilidades para autenticación basada en JWT con **doble token**:
 * - **Access Token** (corto): se envía en cada request (Authorization: Bearer …).
 * - **Refresh Token** (largo): se guarda en **cookie HttpOnly** y sirve para obtener nuevos access tokens.
 *
 * ## ¿Por qué separar Access y Refresh?
 * - **Seguridad**: el access expira rápido y viaja en headers; el refresh no es accesible por JS (HttpOnly).
 * - **Experiencia de usuario**: el refresh permite mantener sesión sin pedir contraseñas a cada rato.
 * - **Defensa en profundidad**: se pueden rotar e invalidar por separado.
 *
 * ## ¿Cómo se usa en el backend?
 * - Al hacer login: `issueTokenPair(user)` → devuelve access (JSON) y refresh (para cookie).
 * - Al refrescar: verificar cookie, `rotateRefresh(oldJti, user)` → devuelve nuevos tokens.
 * - En rutas privadas: verificar access con `verifyAccess(token)`.
 *
 * ## ¿Para qué sirve cada función?
 * - `signAccessToken` / `signRefreshToken`: crean JWTs con claims mínimos.
 * - `issueTokenPair`: emite ambos tokens y registra el refresh.
 * - `rotateRefresh`: invalida el refresh anterior y emite nuevos tokens (rotación).
 * - `verifyAccess` / `verifyRefresh`: validan firma y expiración.
 * - `refreshCookieOpts`: opciones seguras para setear la cookie del refresh.
 *
 * ## Notas sobre tiempos
 * - **CAMBIO**: ahora los tiempos/TTL se convierten con **Luxon** en lugar de lógica manual,
 *   para mejorar legibilidad y evitar errores.
 */

const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

/** *********************************************************************
 * CAMBIO: importamos Duration de Luxon para manejar tiempos de forma segura
 ********************************************************************* */
const { Duration } = require("luxon");

/**
 * @typedef {Object} User
 * @property {string} id - Identificador interno del usuario (clave primaria).
 * @property {string} role - Rol o perfil del usuario (p. ej. "user", "admin").
 */

/**
 * @typedef {Object} RefreshEntry
 * @property {string} userId - ID del usuario al que pertenece el refresh.
 * @property {boolean} revoked - Indica si el refresh fue invalidado (logout/rotación).
 * @property {number} exp - Epoch (ms) aproximado de expiración, útil para depuración/auditoría.
 */

const {
  NODE_ENV = "development",
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_TTL = "10m",
  REFRESH_TOKEN_TTL = "7d",
} = process.env;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Faltan ACCESS_TOKEN_SECRET o REFRESH_TOKEN_SECRET en .env");
}

const isProd = NODE_ENV === "production";

/**
 *
 * Convierte un TTL humano (ej. "10m", "7d") o un número en segundos a milisegundos.
 * - ¿Cómo? usamos `Duration.fromObject` de Luxon, que maneja internamente
 *   la conversión a milisegundos según la unidad.
 * - ¿Por qué? evita errores sutiles y hace el código más autoexplicativo.
 * - ¿Para qué? calcular `maxAge` de la cookie y marcas de expiración aproximadas en el store.
 *
 * @param {string|number} ttl - Duración ("10m", "7d", "3600").
 * @returns {number} Milisegundos.
 * @example
 * ttlToMs("10m") // 600000
 * ttlToMs(3600)  // 3600000
 */
function ttlToMs(ttl) {
  if (typeof ttl === "number") return ttl * 1000;
  const match = /^(\d+)([smhd])$/i.exec(String(ttl));
  if (!match) {
    // Si llega un número como string: "3600"
    const asNum = Number(ttl);
    return Number.isFinite(asNum) ? asNum * 1000 : 0;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const map = { s: "seconds", m: "minutes", h: "hours", d: "days" };

  return Duration.fromObject({ [map[unit]]: value }).as("milliseconds");
}

/**
 * Opciones seguras para la cookie del **refresh token**.
 * - `httpOnly`: JS del navegador no puede leerla → mitiga XSS.
 * - `secure`: solo por HTTPS en producción.
 * - `sameSite: "strict"`: mitiga CSRF en la mayoría de escenarios.
 * - `path: "/auth/refresh"`: solo se envía al endpoint de refresh.
 * - `maxAge`: dura lo mismo que el refresh JWT (calculado con Luxon).
 * @type {import("cookie-parser").CookieParseOptions & import("express").Response['cookie']}
 */
const refreshCookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  path: "/auth/refresh",
  /** CAMBIO: antes calculábamos ms a mano; ahora con Luxon */
  maxAge: ttlToMs(REFRESH_TOKEN_TTL),
};

/**
 * Almacén de refresh tokens en memoria (DEMO).
 * 👉 En producción, persistir en BD (tabla `refresh_tokens`: jti, user_id, revoked, expires_at).
 * @type {Map<string, RefreshEntry>}
 */
const refreshStore = new Map();

/**
 * Firma un **Access Token** con payload mínimo.
 * - **Cómo**: usa `sub` (subject) para el ID, y `role` para autorización a nivel de API.
 * - **Por qué**: payload pequeño = menos superficie de exposición y menor tamaño de header.
 * - **Para qué**: autenticar cada request privada.
 * @param {User} user - Usuario autenticado.
 * @returns {string} JWT firmado y con expiración corta (ACCESS_TOKEN_TTL).
 */
function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

/**
 * Firma un **Refresh Token**.
 * - **Cómo**: adjunta un `jti` (ID único de token) para poder revocarlo/rotarlo.
 * - **Por qué**: el jti permite invalidación fina por sesión/dispositivo.
 * - **Para qué**: renovar access tokens sin pedir credenciales de nuevo.
 * @param {User} user - Usuario autenticado.
 * @param {string} jti - Identificador único del refresh token.
 * @returns {string} JWT firmado y con expiración larga (REFRESH_TOKEN_TTL).
 */
function signRefreshToken(user, jti) {
  return jwt.sign(
    { sub: user.id, jti },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

/**
 * Verifica un Access Token.
 * - **Cómo**: valida firma y expiración con `ACCESS_TOKEN_SECRET`.
 * - **Por qué**: garantizar autenticidad e integridad del token por cada request.
 * - **Para qué**: proteger endpoints privados.
 * @param {string} token - JWT de access.
 * @returns {import("jsonwebtoken").JwtPayload} Payload decodificado.
 * @throws {Error} Si el token es inválido o expiró.
 */
function verifyAccess(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

/**
 * Verifica un Refresh Token.
 * - **Cómo**: valida con `REFRESH_TOKEN_SECRET`.
 * - **Por qué**: diferenciar claves de verificación reduce el impacto si una se filtra.
 * - **Para qué**: permitir emisión de nuevos access tokens.
 * @param {string} token - JWT de refresh.
 * @returns {import("jsonwebtoken").JwtPayload} Payload decodificado (incluye `jti`).
 * @throws {Error} Si el token es inválido o expiró.
 */
function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

/**
 * Emite un **par de tokens** (access + refresh) y registra el refresh.
 * - **Cómo**: genera `jti`, firma ambos tokens y guarda el refresh en `refreshStore`.
 * - **Por qué**: centraliza la emisión atómica de sesión.
 * - **Para qué**: login inicial o creación de sesión.
 * @param {User} user - Usuario autenticado.
 * @returns {{ access: string, refresh: string, jti: string }} Tokens y su identificador.
 * @example
 * const { access, refresh } = issueTokenPair(user);
 * res.cookie("refresh_token", refresh, refreshCookieOpts);
 * res.json({ access_token: access });
 */
function issueTokenPair(user) {
  const access = signAccessToken(user);
  const jti = uuid();
  const refresh = signRefreshToken(user, jti);

  refreshStore.set(jti, {
    userId: user.id,
    revoked: false,
    /** CAMBIO: cálculo de expiración aproximada usando Luxon */
    exp: Date.now() + ttlToMs(REFRESH_TOKEN_TTL),
  });

  return { access, refresh, jti };
}

/**
 * Rota (invalida y reemplaza) un refresh token y emite un nuevo access.
 * - **Cómo**: marca el `oldJti` como `revoked` y crea un nuevo par (jti + refresh) + access.
 * - **Por qué**: rotación reduce ventana de abuso si un refresh se filtra.
 * - **Para qué**: endpoint `/auth/refresh`.
 * @param {string} oldJti - Identificador del refresh anterior.
 * @param {User} user - Usuario autenticado (resuelto a partir del refresh).
 * @returns {{ access: string, refresh: string, jti: string }} Nuevos tokens.
 * @example
 * // En /auth/refresh:
 * const payload = verifyRefresh(cookieToken); // { sub, jti }
 * const { access, refresh } = rotateRefresh(payload.jti, user);
 * res.cookie("refresh_token", refresh, refreshCookieOpts);
 * res.json({ access_token: access });
 */
function rotateRefresh(oldJti, user) {
  const info = refreshStore.get(oldJti);
  if (info) info.revoked = true;

  const jti = uuid();
  const refresh = signRefreshToken(user, jti);
  refreshStore.set(jti, {
    userId: user.id,
    revoked: false,
    /** CAMBIO: cálculo de expiración aproximada usando Luxon */
    exp: Date.now() + ttlToMs(REFRESH_TOKEN_TTL),
  });

  const access = signAccessToken(user);
  return { access, refresh, jti };
}

module.exports = {
  refreshCookieOpts,
  refreshStore,
  signAccessToken,
  signRefreshToken,
  verifyAccess,
  verifyRefresh,
  issueTokenPair,
  rotateRefresh,
};
