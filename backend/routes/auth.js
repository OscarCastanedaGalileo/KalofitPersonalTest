const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/mailer');
const { User } = require('../models');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const router = express.Router();

// Temporary in-memory store for tokens
const verificationTokens = new Map();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Prevent duplicates
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      hashPassword,
      isConfirmed: false
    });

    // Generate verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    verificationTokens.set(email, token);
    console.log(`Verification token for ${email}: ${token}`);


    // Send email
    const verifyUrl = `${FRONTEND_URL}/verify/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your email',
      html: `
        <h3>Hello ${name},</h3>
        <p>Click the link below to confirm your email:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link expires in 1 hour.</p>
      `
    });

    res.status(201).json({ message: 'User registered. Check your email for verification link.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Verify route
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      console.log('Verification attempted with no token');
      return res.status(400).json({ message: 'No verification token provided' });
    }

    // decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // check temporary store if you still use it
    if (!verificationTokens.has(email)) {
      console.log(`Verification failed: token not found for ${email}`);
      // Redirect to frontend with failure state (uses fallback)
      return res.redirect(`${FRONTEND_URL}/verify?status=failed`);
    }

    // find user and mark confirmed
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`Verification failed: user not found for ${email}`);
      return res.redirect(`${FRONTEND_URL}/verify?status=failed`);
    }

    user.isConfirmed = true;
    await user.save();

    // Log to backend console
    console.log(`User verified successfully: ${email}`);

    // Remove the token
    verificationTokens.delete(email);

    // Respond with JSON *and* redirect to frontend success page
    // (the redirect ensures UX in browser; JSON is useful for API clients)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(200).json({ message: 'User verified successfully' });
    } else {
      return res.redirect(`${FRONTEND_URL}/verify?status=success`);
    }
  } catch (err) {
    console.error('Confirm email error:', err);
    return res.redirect(`${FRONTEND_URL}/verify?status=failed`);
  }
});


// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.isConfirmed) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const validPassword = await bcrypt.compare(password, user.hashPassword);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;


    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isConfirmed) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate a new verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    verificationTokens.set(email, token);
    console.log(`New verification token for ${email}: ${token}`);

    const verifyUrl = `${FRONTEND_URL}/verify/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Resend: Confirm your email',
      html: `
        <h3>Hello ${user.name},</h3>
        <p>You requested a new verification email. Click below to confirm your account:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link expires in 1 hour.</p>
      `
    });

    res.status(200).json({ message: 'Verification email resent successfully' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Error resending verification email', error: err.message });
  }
});


module.exports = router;
