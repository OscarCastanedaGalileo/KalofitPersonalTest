  // utils/emailVerificationToken.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { EMAIL_TOKEN_SECRET = process.env.JWT_SECRET } = process.env;

/** Hash seguro (no guardes el token/jti en claro) */
function sha256(input) {
  return crypto.createHash('sha256').update(String(input), 'utf8').digest('hex');
}

/** Crea JWT con jti y exp (ej. 1h). Devuelve { token, jti, expiresAt } */
function signEmailVerification({ sub, email, ttl = '1h' }) {
  const jti = crypto.randomUUID();
  console.log({ sub, email, ttl });
  const token = jwt.sign({ sub, email, purpose: 'email_verify' }, EMAIL_TOKEN_SECRET, { expiresIn: ttl, jwtid: jti });
  // calcular expiresAt desde el token
  const { exp } = jwt.decode(token);
  const expiresAt = new Date(exp * 1000);
  return { token, jti, expiresAt };
}

/** Verifica la firma y propósito; devuelve payload { sub, email, jti, exp } */
function verifyEmailVerification(token) {
  const payload = jwt.verify(token, EMAIL_TOKEN_SECRET);
  if (payload.purpose !== 'email_verify') {
    throw new Error('Invalid purpose');
  }
  return payload;
}

module.exports = { sha256, signEmailVerification, verifyEmailVerification };
