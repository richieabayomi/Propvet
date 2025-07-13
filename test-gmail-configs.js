require('dotenv').config();

const nodemailer = require('nodemailer');

console.log('🔧 Trying different Gmail SMTP configurations...\n');

// Configuration 1: Standard Gmail SMTP
const config1 = {
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Configuration 2: Manual Gmail SMTP with TLS
const config2 = {
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
};

// Configuration 3: Gmail SMTP with SSL
const config3 = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

async function testConfig(config, name) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing ${name}...`);
    const transporter = nodemailer.createTransport(config);
    
    const timeout = setTimeout(() => {
      console.log(`⏰ ${name} - Connection timeout`);
      resolve(false);
    }, 10000);
    
    transporter.verify((error, success) => {
      clearTimeout(timeout);
      if (error) {
        console.log(`❌ ${name} - Failed:`, error.message);
        resolve(false);
      } else {
        console.log(`✅ ${name} - Success!`);
        resolve(true);
      }
    });
  });
}

async function testAllConfigurations() {
  console.log('Email:', process.env.SMTP_USER);
  console.log('Password length:', process.env.SMTP_PASS?.length);
  console.log();
  
  const results = await Promise.all([
    testConfig(config1, 'Gmail Service'),
    testConfig(config2, 'Gmail SMTP with TLS'),
    testConfig(config3, 'Gmail SMTP with SSL'),
  ]);
  
  const working = results.some(r => r);
  
  if (working) {
    console.log('\n🎉 At least one configuration is working!');
  } else {
    console.log('\n❌ All configurations failed. Possible issues:');
    console.log('1. App password might be incorrect or expired');
    console.log('2. 2-Factor Authentication not enabled on Gmail');
    console.log('3. Network/firewall blocking SMTP connections');
    console.log('4. Gmail account security settings');
    console.log('\n🔧 Solutions:');
    console.log('• Regenerate Gmail app password');
    console.log('• Check Gmail security settings');
    console.log('• Try a different email provider for testing');
  }
}

testAllConfigurations();
