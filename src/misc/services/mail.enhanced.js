const nodemailer = require('nodemailer');

// Configure your SMTP transport here
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP Configuration Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

async function sendMail({ to, subject, text, html }) {
  try {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Propvet'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${subject}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
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
          <p>© 2025 Propvet. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (userName, resetLink) => ({
    subject: 'Reset Your Propvet Password',
    text: `Hello ${userName}, You requested a password reset. Use this link: ${resetLink} (valid for 1 hour)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E7D32; margin: 0;">Password Reset Request</h1>
          </div>
          
          <div style="color: #333; line-height: 1.6;">
            <h2 style="color: #2E7D32;">Hello ${userName},</h2>
            <p>We received a request to reset your Propvet account password.</p>
            
            <div style="background-color: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
              <p style="margin: 0;"><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #FF9800; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>Best regards,<br><strong>The Propvet Team</strong></p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 Propvet. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  verificationCreated: (userName, verificationType, verificationId, paymentUrl) => ({
    subject: 'New Verification Created - Complete Payment to Continue',
    text: `Hello ${userName}, Your ${verificationType} verification has been created. Complete payment to continue: ${paymentUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2E7D32; margin: 0;">Verification Created</h1>
          </div>
          
          <div style="color: #333; line-height: 1.6;">
            <h2 style="color: #2E7D32;">Hello ${userName},</h2>
            <p>Your <strong>${verificationType} verification</strong> has been created successfully!</p>
            
            <div style="background-color: #E3F2FD; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1976D2; margin-top: 0;">Verification Details</h3>
              <p><strong>Type:</strong> ${verificationType}</p>
              <p><strong>Verification ID:</strong> ${verificationId}</p>
              <p><strong>Status:</strong> Pending Payment</p>
            </div>
            
            <div style="background-color: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF9800;">
              <p style="margin: 0;"><strong>Next Step:</strong> Complete payment to start uploading your documents and begin the verification process.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Complete Payment</a>
            </div>
            
            <p>Once payment is completed, you'll be able to upload your property documents and our team will begin the verification process.</p>
            <p>Best regards,<br><strong>The Propvet Team</strong></p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 Propvet. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  paymentConfirmed: (userName, verificationType, verificationId) => ({
    subject: 'Payment Confirmed - Upload Your Documents Now',
    text: `Hello ${userName}, Your payment for ${verificationType} verification has been confirmed. You can now upload documents.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; margin: 0;">✅ Payment Confirmed!</h1>
          </div>
          
          <div style="color: #333; line-height: 1.6;">
            <h2 style="color: #2E7D32;">Hello ${userName},</h2>
            <p>Great news! Your payment for <strong>${verificationType} verification</strong> has been confirmed.</p>
            
            <div style="background-color: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4CAF50; margin-top: 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Upload your property documents</li>
                <li>Our verification team will review them</li>
                <li>Receive updates on your verification status</li>
                <li>Get your verified property certificate</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/verification/${verificationId}" style="background-color: #2E7D32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Upload Documents</a>
            </div>
            
            <p>Thank you for choosing Propvet for your property verification needs!</p>
            <p>Best regards,<br><strong>The Propvet Team</strong></p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>© 2025 Propvet. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

module.exports = { sendMail, emailTemplates };
