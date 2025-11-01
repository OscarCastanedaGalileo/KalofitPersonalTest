// utils/passwordReset.js
const crypto = require('crypto');
const transporter = require('../config/mailer');


function generateNumericCode() {
  const n = crypto.randomInt(0, 1_000_000);        // 0..999999
  return String(n).padStart(6, '0');               // "000123"
}
function hashCode(code) {
  return crypto.createHash('sha256').update(code, 'utf8').digest('hex');
}

// 10 minutos y 5 intentos es razonable para la demo
const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// “Enviar” el código (para demo: consola; en prod: nodemailer)
async function sendResetCode(email, code) {
  
  await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Password Reset Code - Kal'O Fit",
  html: `
    <div style="
      max-width: 480px;
      margin: 40px auto;
      padding: 32px;
      background-color: #1b4d1b; /* verde oscuro */
      border-radius: 16px;
      font-family: 'Arial', sans-serif;
      color: #f0f0f0;
      text-align: center;
      border: 2px solid #67E67C; /* borde verde más claro */
      box-shadow: 0 8px 20px rgba(0,0,0,0.25);
    ">
      <img src="http://localhost:3001/logo.svg" alt="Kal'O Fit" style="width: 90px; margin-bottom: 24px;" />
      <h2 style="margin-bottom: 16px; font-size: 26px; color: #67E67C;">Password Reset</h2>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
        You requested to reset your password.<br/>
        Use the following code to complete the process:
      </p>
      <div style="
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 4px;
        color: #67E67C;
        margin: 16px 0;
      ">
        ${code}
      </div>
      <p style="font-size: 14px; color: #d1ffd1; margin-top: 16px;">
        This code is valid for 10 minutes.<br/>
        If you didn’t request a password reset, please ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #67E67C; margin: 32px 0;" />
      <p style="font-size: 12px; color: #aaa;">© 2025 Kal'O Fit. All rights reserved.</p>
    </div>
  `
});

}

module.exports = { generateNumericCode, hashCode, CODE_TTL_MS, MAX_ATTEMPTS, sendResetCode };
