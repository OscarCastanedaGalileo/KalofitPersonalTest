const bcrypt = require('bcrypt');
const transporter = require('../config/mailer');
const { User, PasswordReset, EmailVerification } = require('../models');
const { sha256, signEmailVerification, verifyEmailVerification } = require('../utils/emailVerificationToken');
const {
  issueTokenPair,
  rotateRefresh,
  verifyRefresh,
  refreshStore,
  refreshCookieOpts,
} = require("../utils/tokens");
const {
  generateNumericCode,
  hashCode,
  CODE_TTL_MS,
  MAX_ATTEMPTS,
  sendResetCode,
} = require("../utils/passwordReset");
const logger = require('../config/logger');
const { DateTime } = require('luxon');
const { APP_ORIGIN = "http://localhost:3000" } = process.env;

function buildVerifyUrl(token) {
  return `${APP_ORIGIN.replace(/\/+$/, "")}/verify-email/${token}`;
}

const authController = {
  async register(req, res) {
    try {
      const { name, email, password, confirmPassword } = req.body;
      if (!name?.trim()) return res.status(422).json({ message: "Name is required" });
      if (!email?.trim()) return res.status(422).json({ message: "Email is required" });
      if (!password?.trim() || !confirmPassword?.trim()) {
        return res.status(422).json({ message: "Passwords are required" });
      }
      if (password !== confirmPassword) {
        return res.status(422).json({ message: "Passwords do not match" });
      }
      const emailTrimmed = typeof email === 'string' ? email.trim() : '';
      const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailTrimmed) return res.status(422).json({ message: "Email is required" });
      if (emailTrimmed.length > 254 || !EMAIL_REGEX.test(emailTrimmed)) {
        return res.status(422).json({ message: "Invalid email format" });
      }
      const existing = await User.findOne({ where: { email: emailTrimmed } });
      if (existing) return res.status(422).json({ message: 'Email already registered' });
      const hashPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email: emailTrimmed,
        hashPassword,
        isConfirmed: false
      });
      await newUser.createProfile({});
      const { token, jti, expiresAt } = signEmailVerification({ sub: newUser.id, email: emailTrimmed });
      await EmailVerification.create({
        userId: newUser.id,
        jtiHash: sha256(jti),
        expiresAt,
        consumed: false
      });
      const verifyUrl = buildVerifyUrl(token);

      await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: emailTrimmed,
      subject: "Confirm your email - Kal'O Fit",
      html: `
        <div style="
          max-width: 480px;
          margin: 40px auto;
          padding: 32px;
          background-color: #1b4d1b; 
          border-radius: 16px;
          font-family: 'Arial', sans-serif;
          color: #f0f0f0;
          text-align: center;
          border: 2px solid #67E67C; 
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        ">
          <img src="http://localhost:3001/logo.svg" alt="Kal'O Fit" style="width: 90px; margin-bottom: 24px;" />
          <h2 style="margin-bottom: 16px; font-size: 26px; color: #67E67C;">Welcome to Kal'O Fit!</h2>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
            Hello <strong>${name}</strong>,<br/>
            Please confirm your email address by clicking the button below:
          </p>
          <a href="${verifyUrl}" style="
            display: inline-block;
            background-color: #67E67C; 
            color: #1b1b1b;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
          " onmouseover="this.style.backgroundColor='#55cc5a';">
            Verify Email
          </a>
          <p style="font-size: 14px; color: #d1ffd1; margin-top: 28px;">
            This link will expire in 1 hour.<br/>
            If you didn’t create an account, you can ignore this message.
          </p>
          <hr style="border: none; border-top: 1px solid #67E67C; margin: 32px 0;" />
          <p style="font-size: 12px; color: #aaa;">© 2025 Kal'O Fit. All rights reserved.</p>
        </div>
      `
    });

      res.status(201).json({ message: 'User registered. Check your email for verification link.' });
    } catch (err) {
      logger.error({ message: "Error in register", error: err.message, stack: err.stack });
      res.status(500).json({ message: 'Error registering user', error: err.message });
    }
  },
  async verifyEmail(req, res) {
    try {
      const token = req.params.token;
      let payload;
      try {
        payload = verifyEmailVerification(token);
      } catch (err) {
        return res.status(400).json({ message: 'Verification link is invalid or expired.' });
      }
      const { sub, email, jti } = payload;
      const emailVerification = await EmailVerification.findOne({
        where: { userId: sub, jtiHash: sha256(jti) },
        order: [['createdAt', 'DESC']],
      });
      if (!emailVerification) {
        return res.status(400).json({ message: 'Verification link is invalid or expired.' });
      }
      if (DateTime.fromJSDate(emailVerification.expiresAt) < DateTime.now()) {
        return res.status(400).json({ message: 'Verification link has expired.' });
      }
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: 'User not found.' });
      if (user.isConfirmed || emailVerification.consumed) {
        return res.json({ message: 'Email was already verified.' });
      }
      user.isConfirmed = true;
      await user.save();
      emailVerification.consumed = true;
      await emailVerification.save();
      res.json({ message: 'Email verified successfully.' });
    } catch (err) {
      logger.error({ message: "Error in verifyEmail", error: err.message, stack: err.stack });
      res.status(400).json({ message: 'Verification link is invalid or expired.', error: err.message });
    }
  },
  async resendVerification(req, res) {
    try {
      const { email } = req.body || {};
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Email is required' });
      }
      const NEUTRAL = { message: 'If the account requires verification, we have sent a new link.' };
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json(NEUTRAL);
      }
      if (user.isConfirmed) {
        return res.json(NEUTRAL);
      }
      const COOLDOWN_MS = 2 * 60 * 1000;
      const now = Date.now();
      const last = await EmailVerification.findOne({
        where: { userId: user.id, consumed: false },
        order: [['createdAt', 'DESC']],
      });
      if (last) {
        const lastCreated = DateTime.fromJSDate(last.createdAt);
        if (DateTime.now() < lastCreated.plus({ minutes: 2 })) {
          return res.json(NEUTRAL);
        }
      }
      await EmailVerification.update(
        { consumed: true },
        { where: { userId: user.id, consumed: false } }
      );
      const { token, jti, expiresAt } = signEmailVerification({
        sub: String(user.id),
        email: user.email,
        ttl: '1h',
      });
      await EmailVerification.create({
        userId: user.id,
        jtiHash: sha256(jti),
        expiresAt,
        consumed: false,
      });
      const verifyUrl = buildVerifyUrl(token);

      await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Email Verification (Resend) - Kal'O Fit",
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
          <h2 style="margin-bottom: 16px; font-size: 26px; color: #67E67C;">Verify Your Email</h2>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 28px;">
            Hello <strong>${user.name || "User"}</strong>,<br/>
            Here’s your new verification link for your Kal'O Fit account.
          </p>
          <a href="${verifyUrl}" style="
            display: inline-block;
            background-color: #67E67C; 
            color: #1b1b1b;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 16px;
            transition: all 0.3s ease;
          " onmouseover="this.style.backgroundColor='#55cc5a';">
            Verify Email
          </a>
          <p style="font-size: 14px; color: #d1ffd1; margin-top: 28px;">
            This link will expire in 1 hour.<br/>
            If you already verified your account, you can ignore this message.
          </p>
          <hr style="border: none; border-top: 1px solid #67E67C; margin: 32px 0;" />
          <p style="font-size: 12px; color: #aaa;">© 2025 Kal'O Fit. All rights reserved.</p>
        </div>
      `
    });

      return res.json(NEUTRAL);
    } catch (err) {
      logger.error({ message: 'Error in resendVerification', error: err.message, stack: err.stack });
      return res.status(500).json({ message: 'Could not resend verification link.' });
    }
  },
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(404).json({ message: 'Email or password is incorrect' });
      if (!user.isConfirmed) {
        return res.status(403).json({ message: 'Please verify your email before logging in.' });
      }
      const validPassword = await bcrypt.compare(password, user.hashPassword);
      if (!validPassword) return res.status(400).json({ message: 'Email or password is incorrect' });
      const safeUser = { id: String(user.id), role: user.role || "user" };
      const { access, refresh } = issueTokenPair(safeUser);
      res.cookie("refresh_token", refresh, refreshCookieOpts);
      return res.json({ accessToken: access, message: 'Login successful' });
    } catch (err) {
      logger.error({ message: "Error in login", error: err.message, stack: err.stack });
      res.status(500).json({ message: 'Error logging in', error: err.message });
    }
  },
  async refresh(req, res) {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ error: "No refresh token cookie" });
    try {
      const payload = verifyRefresh(token);
      const record = refreshStore.get(payload.jti);
      if (!record || record.revoked)
        return res.status(403).json({ error: "Refresh invalid or revoked" });
      const user = await User.findByPk(payload.sub);
      if (!user) return res.status(404).json({ error: "User not found" });
      const safeUser = { id: String(user.id), role: user.role || "user" };
      const { access, refresh } = rotateRefresh(payload.jti, safeUser);
      res.cookie("refresh_token", refresh, refreshCookieOpts);
      return res.json({ accessToken: access });
    } catch (err) {
      logger.error({ message: "Error in refresh", error: err.message, stack: err.stack });
      return res.status(401).json({ error: "Refresh invalid or expired" });
    }
  },
  logout(req, res) {
    const token = req.cookies?.refresh_token;
    if (token) {
      try {
        const payload = verifyRefresh(token);
        const entry = refreshStore.get(payload.jti);
        if (entry) entry.revoked = true;
      } catch {
        // token inválido/expirado: lo ignoramos
      }
    }
    res.clearCookie("refresh_token", refreshCookieOpts);
    return res.json({ message: "Logout successful" });
  },
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body || {};
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }
      const NEUTRAL = {
        message: "If the email exists, we have sent a verification code.",
      };
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json(NEUTRAL);
      }
      const code = generateNumericCode();
      await PasswordReset.create({
        userId: user.id,
        codeHash: hashCode(code),
        expiresAt: DateTime.now().plus({ milliseconds: CODE_TTL_MS }).toJSDate(),
        attempts: 0,
        consumed: false,
        ip: req.ip,
        userAgent: req.get("user-agent") || "",
      });
      await sendResetCode(user.email, code);
      return res.json(NEUTRAL);
    } catch (err) {
      logger.error({
        message: "Error in forgotPassword",
        error: err.message,
        stack: err.stack,
      });
      next(err);
    }
  },
  async resetPassword(req, res, next) {
    try {
      const { email, code, password, confirmPassword } = req.body || {};
      if (!email || !code || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ message: "The code must be 6 numeric digits" });
      }
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }
      const reset = await PasswordReset.findOne({
        where: { userId: user.id, consumed: false },
        order: [["createdAt", "DESC"]],
      });
      if (!reset) {
        return res.status(400).json({ message: "Invalid or expired code" });
      }
      if (DateTime.fromJSDate(reset.expiresAt) < DateTime.now()) {
        return res.status(400).json({ message: "Code expired" });
      }
      if (reset.attempts >= MAX_ATTEMPTS) {
        return res.status(400).json({ message: "Too many attempts. Request a new code." });
      }
      reset.attempts += 1;
      const valid = hashCode(code) === reset.codeHash;
      if (!valid) {
        await reset.save();
        return res.status(400).json({ message: "Invalid or expired code" });
      }
      reset.consumed = true;
      await reset.save();
      user.hashPassword = await bcrypt.hash(password, 10);
      await user.save();
      return res.json({ message: "Password updated successfully" });
    } catch (err) {
      logger.error({
        message: "Error in resetPassword",
        error: err.message,
        stack: err.stack,
      });
      next(err);
    }
  },
};

module.exports = authController;
