require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Register user and send confirmation email
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, hashPassword, isConfirmed: false });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });
    const confirmUrl = `${FRONTEND_URL}/verify?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Confirm your Kalo Fit account',
      html: `
        <h3>Hello ${user.name || ''}</h3>
        <p>Welcome to Kalo Fit — please confirm your email by clicking below:</p>
        <p><a href="${confirmUrl}">Confirm your email</a></p>
        <p>If that doesn’t work, copy and paste this URL:</p>
        <pre>${confirmUrl}</pre>
        <p>This link expires in 24 hours.</p>
      `,
    });

    return res.status(201).json({ message: 'User registered. Check your email for confirmation link.' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

//Confirm email via token
exports.confirmEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.redirect(`${FRONTEND_URL}/verify?status=failed`);

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.redirect(`${FRONTEND_URL}/verify?status=failed`);

    user.isConfirmed = true;
    await user.save();

    return res.redirect(`${FRONTEND_URL}/verify?status=success`);
  } catch (err) {
    console.error('Confirm email error:', err);
    return res.redirect(`${FRONTEND_URL}/verify?status=failed`);
  }
};
