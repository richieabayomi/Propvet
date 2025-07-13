#!/usr/bin/env node

/**
 * Email Service Diagnostic Tool
 * Advanced debugging for email configuration issues
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

class EmailDiagnostics {
  constructor() {
    this.config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      fromName: process.env.SMTP_FROM_NAME || 'Propvet'
    };
  }

  async diagnose() {
    console.log('Email Service Diagnostics');
    console.log('=' * 40);
    console.log('Analyzing email configuration and connectivity...\n');

    // Step 1: Check configuration
    this.checkConfiguration();
    
    // Step 2: Test basic connectivity
    await this.testBasicConnectivity();
    
    // Step 3: Test authentication
    await this.testAuthentication();
    
    // Step 4: Test email sending
    await this.testEmailSending();
    
    console.log('\n📋 Diagnostic Summary Complete');
  }

  checkConfiguration() {
    console.log('🔍 Step 1: Configuration Check');
    console.log('─'.repeat(30));
    
    const checks = [
      { name: 'SMTP_HOST', value: this.config.host },
      { name: 'SMTP_PORT', value: this.config.port },
      { name: 'SMTP_USER', value: this.config.user },
      { name: 'SMTP_PASS', value: this.config.pass ? '***SET***' : undefined },
      { name: 'SMTP_FROM', value: this.config.from },
      { name: 'SMTP_FROM_NAME', value: this.config.fromName }
    ];

    let configOK = true;
    
    for (const check of checks) {
      if (check.value) {
        console.log(`✅ ${check.name}: ${check.value}`);
      } else {
        console.log(`❌ ${check.name}: NOT SET`);
        configOK = false;
      }
    }

    // Validate configuration values
    if (this.config.host && this.config.host.includes('gmail')) {
      console.log('📝 Gmail detected - ensure 2FA is enabled and use App Password');
    }
    
    if (this.config.port && ![25, 465, 587, 2525].includes(this.config.port)) {
      console.log(`⚠️  Unusual SMTP port: ${this.config.port}`);
    }

    console.log(`\n${configOK ? '✅' : '❌'} Configuration: ${configOK ? 'VALID' : 'INVALID'}\n`);
    
    if (!configOK) {
      console.log('💡 Fix configuration issues before continuing\n');
      return false;
    }
    
    return true;
  }

  async testBasicConnectivity() {
    console.log('🔍 Step 2: Basic Connectivity Test');
    console.log('─'.repeat(35));
    
    try {
      console.log(`🔌 Attempting connection to ${this.config.host}:${this.config.port}...`);
      
      // Simple connectivity test using nodemailer's built-in verify
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false
        }
      });

      const connectPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout after 20 seconds'));
        }, 20000);

        // Test connectivity without auth
        transporter.verify((error, success) => {
          clearTimeout(timeout);
          if (error && error.code === 'EAUTH') {
            // Auth error means connection is working
            resolve(true);
          } else if (error) {
            reject(error);
          } else {
            resolve(success);
          }
        });
      });

      await connectPromise;
      console.log('✅ Basic connectivity: SUCCESS\n');
      return true;
      
    } catch (error) {
      console.log(`❌ Basic connectivity: FAILED`);
      console.log(`   Error: ${error.message}`);
      
      this.suggestConnectivityFixes(error);
      console.log();
      return false;
    }
  }

  async testAuthentication() {
    console.log('🔍 Step 3: Authentication Test');
    console.log('─'.repeat(30));
    
    try {
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465,
        auth: {
          user: this.config.user,
          pass: this.config.pass
        },
        connectionTimeout: 20000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log(`🔐 Testing authentication for ${this.config.user}...`);
      
      const authPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Authentication timeout after 25 seconds'));
        }, 25000);

        transporter.verify((error, success) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve(success);
          }
        });
      });

      await authPromise;
      console.log('✅ Authentication: SUCCESS\n');
      return true;
      
    } catch (error) {
      console.log(`❌ Authentication: FAILED`);
      console.log(`   Error: ${error.message}`);
      
      this.suggestAuthFixes(error);
      console.log();
      return false;
    }
  }

  async testEmailSending() {
    console.log('🔍 Step 4: Email Sending Test');
    console.log('─'.repeat(30));
    
    try {
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465,
        auth: {
          user: this.config.user,
          pass: this.config.pass
        },
        connectionTimeout: 20000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false
        }
      });

      console.log(`📤 Sending test email to ${this.config.user}...`);
      
      const mailOptions = {
        from: `"${this.config.fromName}" <${this.config.from}>`,
        to: this.config.user,
        subject: '✅ Propvet Email Test - Diagnostics Successful',
        text: 'This is a test email from Propvet email diagnostics tool. Your email configuration is working correctly!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4CAF50;">✅ Email Diagnostics Successful!</h1>
            <p>Your Propvet email configuration is working correctly.</p>
            <div style="background-color: #f0f8f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Configuration Details:</h3>
              <ul>
                <li><strong>SMTP Host:</strong> ${this.config.host}</li>
                <li><strong>SMTP Port:</strong> ${this.config.port}</li>
                <li><strong>SMTP User:</strong> ${this.config.user}</li>
                <li><strong>From Name:</strong> ${this.config.fromName}</li>
              </ul>
            </div>
            <p><em>Generated by Propvet Email Diagnostics Tool</em></p>
          </div>
        `
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sending: SUCCESS');
      console.log(`   Message ID: ${result.messageId}`);
      console.log(`   Check your inbox at: ${this.config.user}`);
      console.log();
      
      return true;
      
    } catch (error) {
      console.log(`❌ Email sending: FAILED`);
      console.log(`   Error: ${error.message}`);
      
      this.suggestSendingFixes(error);
      console.log();
      return false;
    }
  }

  suggestConnectivityFixes(error) {
    console.log('\n💡 Connectivity Troubleshooting:');
    
    if (error.message.includes('timeout')) {
      console.log('   • Check your internet connection');
      console.log('   • Verify firewall/antivirus settings');
      console.log('   • Try a different network');
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   • SMTP server may be down');
      console.log('   • Check SMTP host and port settings');
      console.log('   • Verify server supports the port you\'re using');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('   • Check SMTP host spelling');
      console.log('   • Verify DNS resolution');
      console.log('   • Check if host exists');
    }
  }

  suggestAuthFixes(error) {
    console.log('\n💡 Authentication Troubleshooting:');
    
    if (error.message.includes('Invalid login')) {
      console.log('   • Verify username and password');
      console.log('   • For Gmail: use App Password, not regular password');
      console.log('   • Enable 2-Factor Authentication if using Gmail');
    }
    
    if (error.message.includes('Greeting never received')) {
      console.log('   • SMTP server connection issue');
      console.log('   • Try increasing timeout values');
      console.log('   • Check if server requires STARTTLS');
    }
    
    if (this.config.host.includes('gmail')) {
      console.log('\n📧 Gmail-specific fixes:');
      console.log('   1. Enable 2-Factor Authentication');
      console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('   3. Use App Password in SMTP_PASS (not your regular password)');
    }
  }

  suggestSendingFixes(error) {
    console.log('\n💡 Email Sending Troubleshooting:');
    
    if (error.message.includes('quota')) {
      console.log('   • Daily sending limit reached');
      console.log('   • Wait 24 hours or upgrade email service');
    }
    
    if (error.message.includes('blocked')) {
      console.log('   • Email may be blocked by provider');
      console.log('   • Check spam/security settings');
      console.log('   • Verify sender reputation');
    }
  }
}

// Main execution
async function main() {
  const diagnostics = new EmailDiagnostics();
  await diagnostics.diagnose();
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Email diagnostics crashed:', error.message);
    process.exit(1);
  });
}

module.exports = EmailDiagnostics;
