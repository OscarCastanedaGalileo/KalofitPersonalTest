require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify().then(() => {
  console.log('Mailer ready');
}).catch(err => {
  console.warn('Mailer verify failed:', err.message);
});

module.exports = transporter;
