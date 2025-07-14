const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SystemHealthChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
    this.failed = 0;
    this.setupDetails = {
      missingDependencies: [],
      configurationIssues: [],
      fileSystemIssues: [],
      serviceConnectivityIssues: []
    };
  }

  // Add a check result
  addResult(name, status, message, type = 'error', category = 'general') {
    const result = { name, status, message, type, category };
    this.checks.push(result);
    
    if (status === 'PASS') {
      this.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else if (status === 'FAIL') {
      this.failed++;
      console.log(`❌ ${name}: ${message}`);
      if (type === 'error') {
        this.errors.push(result);
        // Categorize the error for better troubleshooting
        this.categorizeIssue(category, name, message);
      } else {
        this.warnings.push(result);
      }
    } else if (status === 'WARN') {
      console.log(`⚠️  ${name}: ${message}`);
      this.warnings.push(result);
    }
  }

  // Categorize issues for better troubleshooting
  categorizeIssue(category, name, message) {
    switch (category) {
      case 'dependency':
        this.setupDetails.missingDependencies.push({ name, message });
        break;
      case 'configuration':
        this.setupDetails.configurationIssues.push({ name, message });
        break;
      case 'filesystem':
        this.setupDetails.fileSystemIssues.push({ name, message });
        break;
      case 'service':
        this.setupDetails.serviceConnectivityIssues.push({ name, message });
        break;
    }
  }

  // Check environment variables
  checkEnvironmentVariables() {
    console.log('\n🔍 Checking Environment Variables...');
    
    const requiredEnvVars = [
      { name: 'PORT', required: true },
      { name: 'NODE_ENV', required: true },
      { name: 'MONGODB_URI', required: true, alt: 'DEVELOPMENT_DATABASE_URL' },
      { name: 'JWT_SECRET', required: true },
      { name: 'PAYSTACK_SECRET', required: true },
      { name: 'BASE_URL', required: true },
      { name: 'FRONTEND_URL', required: true }
    ];

    const emailEnvVars = [
      { name: 'SMTP_HOST', required: false },
      { name: 'SMTP_PORT', required: false },
      { name: 'SMTP_USER', required: false },
      { name: 'SMTP_PASS', required: false },
      { name: 'SMTP_FROM', required: false }
    ];

    // Check required variables
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar.name] || (envVar.alt && process.env[envVar.alt]);
      if (!value) {
        this.addResult(
          `ENV: ${envVar.name}`,
          'FAIL',
          `Missing required environment variable: ${envVar.name}${envVar.alt ? ` or ${envVar.alt}` : ''}`,
          'error',
          'configuration'
        );
      } else {
        this.addResult(
          `ENV: ${envVar.name}`,
          'PASS',
          `Environment variable set`
        );
      }
    }

    // Check email variables (optional but warn if incomplete)
    const emailVarsSet = emailEnvVars.filter(env => process.env[env.name]).length;
    if (emailVarsSet === 0) {
      this.addResult(
        'ENV: Email Configuration',
        'WARN',
        'Email not configured - welcome and notification emails will not work',
        'warning'
      );
    } else if (emailVarsSet < emailEnvVars.length) {
      this.addResult(
        'ENV: Email Configuration',
        'WARN',
        'Incomplete email configuration - some email features may not work',
        'warning'
      );
    } else {
      this.addResult(
        'ENV: Email Configuration',
        'PASS',
        'Email configuration complete'
      );
    }

    // Validate specific values
    this.validateEnvironmentValues();
  }

  validateEnvironmentValues() {
    // Check PORT
    const port = process.env.PORT;
    if (port && (isNaN(port) || port < 1 || port > 65535)) {
      this.addResult(
        'ENV: PORT validation',
        'FAIL',
        `Invalid PORT value: ${port}. Must be a number between 1-65535`,
        'error',
        'configuration'
      );
    }

    // Check MongoDB URI format
    const mongoUri = process.env.MONGODB_URI || process.env.DEVELOPMENT_DATABASE_URL;
    if (mongoUri && !mongoUri.includes('mongodb')) {
      this.addResult(
        'ENV: MongoDB URI validation',
        'FAIL',
        'MongoDB URI appears to be invalid - should start with mongodb:// or mongodb+srv://',
        'error',
        'configuration'
      );
    }

    // Check Paystack key format
    const paystackSecret = process.env.PAYSTACK_SECRET;
    if (paystackSecret && !paystackSecret.startsWith('sk_')) {
      this.addResult(
        'ENV: Paystack Secret validation',
        'FAIL',
        'Paystack secret key should start with "sk_"',
        'error',
        'configuration'
      );
    }

    // Check URLs format
    const baseUrl = process.env.BASE_URL;
    const frontendUrl = process.env.FRONTEND_URL;
    
    if (baseUrl && !baseUrl.startsWith('http')) {
      this.addResult(
        'ENV: BASE_URL validation',
        'FAIL',
        'BASE_URL should start with http:// or https://',
        'error',
        'configuration'
      );
    }

    if (frontendUrl && !frontendUrl.startsWith('http')) {
      this.addResult(
        'ENV: FRONTEND_URL validation',
        'FAIL',
        'FRONTEND_URL should start with http:// or https://',
        'error',
        'configuration'
      );
    }
  }

  // Check database connection
  async checkDatabaseConnection() {
    console.log('\n🔍 Checking Database Connection...');
    
    try {
      const mongoUri = process.env.MONGODB_URI || process.env.DEVELOPMENT_DATABASE_URL;
      if (!mongoUri) {
        this.addResult(
          'Database Connection',
          'FAIL',
          'No MongoDB URI found in environment variables',
          'error',
          'configuration'
        );
        return;
      }

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000 // 5 second timeout
      });

      this.addResult(
        'Database Connection',
        'PASS',
        'Successfully connected to MongoDB'
      );

      // Check if we can perform basic operations
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      this.addResult(
        'Database Operations',
        'PASS',
        `MongoDB server version: ${serverStatus.version}`
      );

    } catch (error) {
      this.addResult(
        'Database Connection',
        'FAIL',
        `Failed to connect to MongoDB: ${error.message}`,
        'error',
        'service'
      );
    }
  }

  // Check email service
  async checkEmailService() {
    console.log('\n🔍 Checking Email Service...');
    
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      this.addResult(
        'Email Service',
        'WARN',
        'Email service not configured - email features will not work',
        'warning'
      );
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT),
        secure: SMTP_PORT == 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 20000,   // 20 seconds  
        socketTimeout: 30000,     // 30 seconds
      });

      // Use a promise with timeout for the verify operation
      const verifyPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SMTP verification timeout after 25 seconds'));
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

      await verifyPromise;
      
      this.addResult(
        'Email Service',
        'PASS',
        `SMTP connection verified for ${SMTP_HOST}`
      );

    } catch (error) {
      let errorMessage = `Email service connection failed: ${error.message}`;
      
      // Provide specific troubleshooting for common errors
      if (error.message.includes('Greeting never received')) {
        errorMessage += ' (Connection timeout - check SMTP settings and network connectivity)';
      } else if (error.message.includes('Invalid login')) {
        errorMessage += ' (Authentication failed - check username/password)';
      } else if (error.message.includes('timeout')) {
        errorMessage += ' (Connection timeout - check network and firewall settings)';
      }
      
      this.addResult(
        'Email Service',
        'FAIL',
        errorMessage,
        'error',
        'service'
      );
    }
  }

  // Check Paystack connection
  async checkPaystackConnection() {
    console.log('\n🔍 Checking Paystack Connection...');
    
    const paystackSecret = process.env.PAYSTACK_SECRET;
    if (!paystackSecret) {
      this.addResult(
        'Paystack Connection',
        'FAIL',
        'Paystack secret key not configured',
        'error',
        'configuration'
      );
      return;
    }

    try {
      const response = await axios.get('https://api.paystack.co/bank', {
        headers: {
          'Authorization': `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.status === 200) {
        this.addResult(
          'Paystack Connection',
          'PASS',
          'Paystack API connection successful'
        );
      } else {
        this.addResult(
          'Paystack Connection',
          'FAIL',
          `Paystack API returned status: ${response.status}`,
          'error',
          'service'
        );
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.addResult(
          'Paystack Connection',
          'FAIL',
          'Invalid Paystack secret key - authentication failed',
          'error',
          'configuration'
        );
      } else {
        this.addResult(
          'Paystack Connection',
          'FAIL',
          `Paystack connection failed: ${error.message}`,
          'error',
          'service'
        );
      }
    }
  }

  // Check required files and directories
  checkFileSystem() {
    console.log('\n🔍 Checking File System...');
    
    const requiredPaths = [
      { path: 'src', type: 'directory' },
      { path: 'src/domain', type: 'directory' },
      { path: 'src/usecases', type: 'directory' },
      { path: 'src/infrastructure', type: 'directory' },
      { path: 'src/controller', type: 'directory' },
      { path: 'src/routes', type: 'directory' },
      { path: 'src/misc/services', type: 'directory' },
      { path: 'uploads', type: 'directory' },
      { path: 'package.json', type: 'file' },
      { path: 'src/misc/services/mail.simple.js', type: 'file' },
      { path: 'src/misc/services/paystack.js', type: 'file' }
    ];

    for (const item of requiredPaths) {
      const fullPath = path.join(process.cwd(), item.path);
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (item.type === 'directory' && stats.isDirectory()) {
          this.addResult(
            `FileSystem: ${item.path}`,
            'PASS',
            'Directory exists'
          );
        } else if (item.type === 'file' && stats.isFile()) {
          this.addResult(
            `FileSystem: ${item.path}`,
            'PASS',
            'File exists'
          );
        } else {
          this.addResult(
            `FileSystem: ${item.path}`,
            'FAIL',
            `Expected ${item.type} but found different type`,
            'error',
            'filesystem'
          );
        }
      } catch (error) {
        this.addResult(
          `FileSystem: ${item.path}`,
          'FAIL',
          `Missing ${item.type}: ${item.path}`,
          'error',
          'filesystem'
        );
      }
    }

    // Check uploads directory permissions
    try {
      const uploadsPath = path.join(process.cwd(), 'uploads');
      fs.accessSync(uploadsPath, fs.constants.W_OK);
      this.addResult(
        'FileSystem: Upload Permissions',
        'PASS',
        'Uploads directory is writable'
      );
    } catch (error) {
      this.addResult(
        'FileSystem: Upload Permissions',
        'FAIL',
        'Uploads directory is not writable',
        'error',
        'filesystem'
      );
    }
  }

  // Check Node.js version and dependencies
  checkNodeJsAndDependencies() {
    console.log('\n🔍 Checking Node.js and Dependencies...');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 16) {
      this.addResult(
        'Node.js Version',
        'PASS',
        `Node.js ${nodeVersion} (compatible)`
      );
    } else {
      this.addResult(
        'Node.js Version',
        'FAIL',
        `Node.js ${nodeVersion} - requires Node.js 16 or higher`,
        'error',
        'dependency'
      );
    }

    // Check package.json
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredDependencies = [
        'express',
        'mongoose',
        'bcrypt',
        'jsonwebtoken',
        'nodemailer',
        'axios',
        'multer',
        'dotenv',
        'uuid'
      ];

      const missingDeps = requiredDependencies.filter(dep => 
        !packageJson.dependencies || !packageJson.dependencies[dep]
      );

      if (missingDeps.length === 0) {
        this.addResult(
          'Dependencies',
          'PASS',
          'All required dependencies are listed in package.json'
        );
      } else {
        this.addResult(
          'Dependencies',
          'FAIL',
          `Missing dependencies: ${missingDeps.join(', ')}`,
          'error',
          'dependency'
        );
      }

      // Check if dependencies are actually installed
      this.checkInstalledDependencies(requiredDependencies);

    } catch (error) {
      this.addResult(
        'Dependencies',
        'FAIL',
        'Could not read package.json',
        'error',
        'filesystem'
      );
    }
  }

  // Check if dependencies are actually installed in node_modules
  checkInstalledDependencies(requiredDependencies) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      this.addResult(
        'Installed Dependencies',
        'FAIL',
        'node_modules directory not found - run "npm install"',
        'error',
        'dependency'
      );
      return;
    }

    const missingInstalled = requiredDependencies.filter(dep => {
      const depPath = path.join(nodeModulesPath, dep);
      return !fs.existsSync(depPath);
    });

    if (missingInstalled.length === 0) {
      this.addResult(
        'Installed Dependencies',
        'PASS',
        'All required dependencies are installed'
      );
    } else {
      this.addResult(
        'Installed Dependencies',
        'FAIL',
        `Dependencies not installed: ${missingInstalled.join(', ')} - run "npm install"`,
        'error',
        'dependency'
      );
    }
  }

  // Run all checks
  async runAllChecks() {
    console.log('🚀 Starting Propvet System Health Check...\n');
    console.log('='.repeat(60));

    try {
      // Run all checks
      this.checkEnvironmentVariables();
      this.checkNodeJsAndDependencies();
      this.checkFileSystem();
      await this.checkDatabaseConnection();
      await this.checkEmailService();
      await this.checkPaystackConnection();

      // Generate summary
      this.generateSummary();

      // Return results
      return {
        success: this.errors.length === 0,
        summary: {
          total: this.checks.length,
          passed: this.passed,
          failed: this.failed,
          warnings: this.warnings.length
        },
        errors: this.errors,
        warnings: this.warnings,
        checks: this.checks
      };

    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        error: error.message,
        summary: { total: 0, passed: 0, failed: 1, warnings: 0 }
      };
    } finally {
      // Close database connection if it was opened
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
    }
  }

  // Generate summary report
  generateSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYSTEM HEALTH CHECK SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`📊 Total Checks: ${this.checks.length}`);

    if (this.errors.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.name}: ${error.message}`);
      });
      
      console.log('\n💡 SETUP INSTRUCTIONS:');
      this.generateSetupInstructions();
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS (non-critical):');
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.name}: ${warning.message}`);
      });
    }

    if (this.errors.length === 0) {
      console.log('\n🎉 ALL CRITICAL CHECKS PASSED!');
      console.log('✨ Your Propvet application is ready to start!');
      
      if (this.warnings.length > 0) {
        console.log('⚠️  Note: Some optional features may not work due to warnings above.');
      }
    } else {
      console.log('\n🛑 APPLICATION NOT READY');
      console.log('❌ Please fix the critical issues before starting the server.');
    }

    console.log('=' * 60);
  }

  // Generate specific setup instructions based on issues found
  generateSetupInstructions() {
    if (this.setupDetails.missingDependencies.length > 0) {
      console.log('\n🔧 DEPENDENCY ISSUES:');
      console.log('   Run the following commands:');
      console.log('   > npm install');
      
      const missingPackages = this.setupDetails.missingDependencies
        .filter(dep => dep.message.includes('Missing dependencies'))
        .map(dep => dep.message.split(': ')[1])
        .filter(Boolean);
      
      if (missingPackages.length > 0) {
        console.log(`   > npm install ${missingPackages.join(' ')}`);
      }
    }

    if (this.setupDetails.configurationIssues.length > 0) {
      console.log('\n⚙️  CONFIGURATION ISSUES:');
      console.log('   1. Copy .env.example to .env:');
      console.log('      > cp .env.example .env');
      console.log('   2. Update the following environment variables in .env:');
      
      this.setupDetails.configurationIssues.forEach(issue => {
        if (issue.name.startsWith('ENV:')) {
          const envVar = issue.name.replace('ENV: ', '').split(' ')[0];
          console.log(`      - ${envVar}`);
        }
      });
      
      console.log('   3. Review EMAIL-SETUP-GUIDE.md for email configuration');
      console.log('   4. Review PAYMENT-VERIFICATION-WORKFLOW.md for Paystack setup');
    }

    if (this.setupDetails.fileSystemIssues.length > 0) {
      console.log('\n📁 FILE SYSTEM ISSUES:');
      this.setupDetails.fileSystemIssues.forEach(issue => {
        if (issue.message.includes('uploads')) {
          console.log('   > mkdir uploads (if missing)');
          console.log('   > chmod 755 uploads (ensure write permissions)');
        }
      });
    }

    if (this.setupDetails.serviceConnectivityIssues.length > 0) {
      console.log('\n🔗 SERVICE CONNECTIVITY ISSUES:');
      this.setupDetails.serviceConnectivityIssues.forEach(issue => {
        if (issue.name.includes('Database')) {
          console.log('   - Check MongoDB connection string and ensure database is running');
          console.log('   - For MongoDB Atlas: verify network access and credentials');
        }
        if (issue.name.includes('Email')) {
          console.log('   - Verify SMTP credentials and settings');
          console.log('   - For Gmail: ensure 2FA is enabled and use App Password');
        }
        if (issue.name.includes('Paystack')) {
          console.log('   - Verify Paystack secret key is valid');
          console.log('   - Check internet connectivity');
        }
      });
    }

    console.log('\n📚 DOCUMENTATION:');
    console.log('   - Environment setup: .env.example');
    console.log('   - Email setup: EMAIL-SETUP-GUIDE.md');
    console.log('   - Payment workflow: PAYMENT-VERIFICATION-WORKFLOW.md');
  }
}

module.exports = SystemHealthChecker;
