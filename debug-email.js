require('dotenv').config();

console.log('🔍 Debug Email Credentials:');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 'NOT SET');
console.log('SMTP_PASS value:', process.env.SMTP_PASS);
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);

// Test a simple connection
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

console.log('\n🔗 Testing SMTP Connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Connection Failed:', error);
  } else {
    console.log('✅ SMTP Connection Successful!');
  }
});
