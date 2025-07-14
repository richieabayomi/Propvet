const { sendMail, emailTemplates } = require('./src/misc/services/mail.simple');
require('dotenv').config();

async function testEmailSetup() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***hidden***' : 'NOT SET');
  console.log('SMTP_FROM:', process.env.SMTP_FROM);
  console.log('SMTP_FROM_NAME:', process.env.SMTP_FROM_NAME);
  console.log();

  // Test email templates
  console.log('📧 Testing Email Templates...');
  const welcomeTemplate = emailTemplates.welcome('Test User', 'http://localhost:5000/login');
  console.log('✅ Welcome template created');
  
  const resetTemplate = emailTemplates.passwordReset('Test User', '123456');
  console.log('✅ Password reset template created');
  
  const verificationTemplate = emailTemplates.verificationCreated('Test User', 'NORMAL', '12345', 'http://paystack.com');
  console.log('✅ Verification created template created');
  
  const paymentTemplate = emailTemplates.paymentConfirmed('Test User', 'NORMAL', '12345');
  console.log('✅ Payment confirmed template created');
  console.log();

  // Test sending a real email
  try {
    console.log('📤 Sending test email...');
    await sendMail({
      to: process.env.SMTP_USER,
      subject: 'Propvet Email Test - Setup Successful! 🎉',
      text: 'This is a test email to verify your Propvet email configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #4CAF50; text-align: center;">🎉 Email Setup Successful!</h1>
            <p>Congratulations! Your Propvet email configuration is working correctly.</p>
            <div style="background-color: #E8F5E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #4CAF50; margin-top: 0;">Email Features Now Active:</h3>
              <ul>
                <li>✅ Welcome emails for new user registrations</li>
                <li>✅ Password reset emails with secure links</li>
                <li>✅ Verification created notifications</li>
                <li>✅ Payment confirmation emails</li>
              </ul>
            </div>
            <p style="text-align: center; margin-top: 30px;">
              <strong>Your Propvet application is ready to send emails!</strong>
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox at:', process.env.SMTP_USER);
    console.log();
    console.log('🎉 EMAIL SETUP COMPLETE! All email functionality is working.');
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.log();
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your Gmail app password is correct');
    console.log('2. Ensure 2-Factor Authentication is enabled on Gmail');
    console.log('3. Verify your Gmail address is correct');
    console.log('4. Check if "Less secure app access" needs to be enabled');
  }
}

// Run the test
testEmailSetup().catch(console.error);
