const nodemailer = require('nodemailer');

// Configure your SMTP transport here
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

async function sendMail({ to, subject, text, html }) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
