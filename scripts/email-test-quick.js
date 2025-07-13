#!/usr/bin/env node

/**
 * Simple Email Configuration Test
 * Quick test for email setup with better error handling
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailQuick() {
  console.log('📧 Quick Email Configuration Test');
  console.log('=' .repeat(40));
  
  // Check configuration
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    fromName: process.env.SMTP_FROM_NAME || 'Propvet'
  };

  console.log('📋 Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Pass: ${config.pass ? '***SET***' : 'NOT SET'}`);
  console.log();

  if (!config.user || !config.pass) {
    console.log('❌ Missing email credentials in .env file');
    console.log('💡 Required variables: SMTP_USER, SMTP_PASS');
    return;
  }

  try {
    console.log('🔧 Creating transporter...');
    
    // Create transporter with Gmail optimizations
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail service for simplicity
      auth: {
        user: config.user,
        pass: config.pass
      },
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    console.log('🔍 Verifying connection...');
    
    // Add timeout to verify
    const verifyPromise = Promise.race([
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 30000)
      ),
      transporter.verify()
    ]);

    await verifyPromise;
    console.log('✅ Email service connection verified!');

    console.log('\n📤 Sending test email...');
    
    const testEmail = {
      from: `"${config.fromName}" <${config.from}>`,
      to: config.user,
      subject: '✅ Propvet Email Test Successful',
      text: 'Your Propvet email configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: white; padding: 20px; border-radius: 10px;">
            <h1 style="color: #4CAF50;">✅ Email Test Successful!</h1>
            <p>Your Propvet email configuration is working correctly.</p>
            <p><strong>Test completed at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Check your inbox: ${config.user}`);
    console.log('\n🎉 Email configuration is working perfectly!');

  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    console.log('\n🔧 Troubleshooting Tips:');
    
    if (error.message.includes('Invalid login')) {
      console.log('   • Use App Password instead of regular password');
      console.log('   • Enable 2-Factor Authentication in Gmail');
      console.log('   • Generate App Password: https://myaccount.google.com/apppasswords');
    } else if (error.message.includes('timeout') || error.message.includes('Greeting never received')) {
      console.log('   • Check internet connection');
      console.log('   • Verify firewall/antivirus settings');
      console.log('   • Try different network if possible');
    } else {
      console.log('   • Verify email credentials');
      console.log('   • Check SMTP settings');
      console.log('   • Review EMAIL-SETUP-GUIDE.md');
    }
  }
}

// Run test
testEmailQuick().catch(console.error);
