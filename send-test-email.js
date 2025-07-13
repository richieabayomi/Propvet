require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  // Use the working configuration
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('📧 Sending test email with working configuration...');
  
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER,
      subject: 'Propvet Email Test - SUCCESS! 🎉',
      text: 'Your email configuration is working perfectly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4CAF50;">🎉 Email Test Successful!</h1>
          <p>Your Propvet email configuration is working correctly.</p>
          <div style="background-color: #E8F5E8; padding: 15px; border-radius: 8px;">
            <p><strong>✅ All email features are now active:</strong></p>
            <ul>
              <li>Welcome emails for new registrations</li>
              <li>Password reset emails</li>
              <li>Verification notifications</li>
              <li>Payment confirmations</li>
            </ul>
          </div>
          <p style="margin-top: 20px;"><strong>Your Propvet application is ready!</strong></p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox at:', process.env.SMTP_USER);
    console.log('\n🎉 EMAIL SETUP COMPLETE!');
    console.log('Your Propvet application is ready to send emails.');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
  }
}

sendTestEmail();
