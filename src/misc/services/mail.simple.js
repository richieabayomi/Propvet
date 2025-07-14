const nodemailer = require('nodemailer');

// Create a more reliable transporter
function createTransporter() {
  // Gmail configuration with correct port settings
  const config = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('⚠️  Missing SMTP credentials in environment variables');
    return null;
  }

  return nodemailer.createTransport(config);
}

// Configure your SMTP transport here
const transporter = createTransporter();

// Verify transporter configuration
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ SMTP Configuration Error:', error.message);
    } else {
      console.log('✅ SMTP Server is ready to send emails');
    }
  });
} else {
  console.log('❌ Failed to create email transporter - check environment variables');
}

async function sendMail({ to, subject, text, html, replyTo }) {
  try {
    if (!transporter) {
      throw new Error('Email transporter not configured');
    }

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Propvet'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };

    // Add replyTo if provided (for contact form)
    if (replyTo) {
      mailOptions.replyTo = replyTo;
    }
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

// Email Templates
const emailTemplates = {
  welcome: (userName, loginUrl) => ({
    subject: 'Welcome to Propvet - Your Account is Ready!',
    text: `Welcome to Propvet, ${userName}! Your account has been created successfully. Login at: ${loginUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E7D32; margin: 0;">Welcome to Propvet!</h1>
          </div>
          
          <div style="color: #333; line-height: 1.6;">
            <h2 style="color: #2E7D32;">Hello ${userName},</h2>
            <p>Welcome to Propvet! Your account has been created successfully and you're ready to start verifying your properties.</p>
            
            <div style="background-color: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2E7D32; margin-top: 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Login to your account</li>
                <li>Start a verification process</li>
                <li>Upload your property documents</li>
                <li>Get verified quickly and securely</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #2E7D32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
            </div>
            
            <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br><strong>The Propvet Team</strong></p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This email was sent from Propvet. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),

  verificationCreated: (userName, verificationType, verificationId, paymentUrl) => ({
    subject: 'Property Verification Created - Payment Required',
    text: `Hello ${userName}, your ${verificationType} property verification has been created. Verification ID: ${verificationId}. Please complete payment: ${paymentUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E7D32; margin: 0;">Property Verification Created</h1>
          </div>
          
          <div style="color: #333; line-height: 1.6;">
            <h2 style="color: #2E7D32;">Hello ${userName},</h2>
            <p>Your <strong>${verificationType}</strong> property verification has been created successfully.</p>
            
            <div style="background-color: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2E7D32; margin-top: 0;">Verification Details</h3>
              <p><strong>Verification ID:</strong> ${verificationId}</p>
              <p><strong>Type:</strong> ${verificationType}</p>
              <p><strong>Status:</strong> Pending Payment</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="background-color: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Payment</a>
            </div>
            
            <p style="margin-top: 30px;">Once payment is completed, you can upload your property documents and start the verification process.</p>
            <p>Best regards,<br><strong>The Propvet Team</strong></p>
          </div>
        </div>
      </div>
    `
  }),

  passwordReset: (userName, otp) => ({
    subject: 'Reset Your Password - Propvet',
    text: `Hello ${userName}, you requested a password reset. Use this OTP: ${otp} (valid for 1 hour)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E7D32; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="color: #333; line-height: 1.6;">
            <h2 style="color: #2E7D32;">Hello ${userName},</h2>
            <p>You requested a password reset for your Propvet account.</p>
            
            <div style="background-color: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800; text-align: center;">
              <p style="margin: 0; font-size: 18px;"><strong>Your One-Time Password (OTP):</strong></p>
              <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #2E7D32;">${otp}</p>
              <p style="margin: 0;">This OTP is valid for 1 hour.</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>Best regards,<br><strong>The Propvet Team</strong></p>
          </div>
        </div>
      </div>
    `
  }),
};

module.exports = { sendMail, emailTemplates };
