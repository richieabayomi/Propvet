#!/usr/bin/env node

/**
 * Propvet System Doctor
 * Advanced diagnostic and repair tool for common setup issues
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const SystemHealthChecker = require('../src/misc/services/system-health-checker');

class SystemDoctor {
  constructor() {
    this.fixes = [];
    this.autoFixAvailable = [];
  }

  async diagnose() {
    console.log('🩺 Propvet System Doctor');
    console.log('='.repeat(40));
    console.log('Diagnosing system issues and suggesting fixes...\n');

    // Run health check first
    const healthChecker = new SystemHealthChecker();
    const results = await healthChecker.runAllChecks();

    if (results.success) {
      console.log('\n✅ No issues found! Your system is healthy.');
      return;
    }

    console.log('\n🔍 Analyzing issues and preparing fixes...\n');

    // Analyze each error and suggest fixes
    for (const error of results.errors) {
      this.analyzeError(error);
    }

    this.suggestFixes();
  }

  analyzeError(error) {
    switch (error.category) {
      case 'dependency':
        this.analyzeDependencyError(error);
        break;
      case 'configuration':
        this.analyzeConfigurationError(error);
        break;
      case 'filesystem':
        this.analyzeFilesystemError(error);
        break;
      case 'service':
        this.analyzeServiceError(error);
        break;
    }
  }

  analyzeDependencyError(error) {
    if (error.message.includes('node_modules')) {
      this.autoFixAvailable.push({
        issue: 'Missing node_modules',
        command: 'npm install',
        description: 'Install all dependencies'
      });
    }

    if (error.message.includes('Missing dependencies')) {
      const messageParts = error.message.split(': ');
      if (messageParts.length > 1) {
        const deps = messageParts[1];
        this.autoFixAvailable.push({
          issue: 'Missing package dependencies',
          command: `npm install ${deps}`,
          description: `Install missing packages: ${deps}`
        });
      }
    }

    if (error.message.includes('Node.js')) {
      this.fixes.push({
        issue: 'Node.js version incompatible',
        solution: 'Update Node.js to version 16 or higher',
        manual: true,
        steps: [
          '1. Visit https://nodejs.org/',
          '2. Download and install Node.js 18 LTS or higher',
          '3. Restart your terminal',
          '4. Run "node --version" to verify'
        ]
      });
    }
  }

  analyzeConfigurationError(error) {
    if (error.name.includes('ENV:')) {
      const envVar = error.name.replace('ENV: ', '').split(' ')[0];
      
      this.fixes.push({
        issue: `Missing environment variable: ${envVar}`,
        solution: `Add ${envVar} to your .env file`,
        manual: true,
        steps: this.getEnvVarSteps(envVar)
      });

      // Check if .env file exists
      if (!fs.existsSync(path.resolve('.env'))) {
        this.autoFixAvailable.push({
          issue: 'Missing .env file',
          command: 'copy',
          file: '.env.example',
          target: '.env',
          description: 'Create .env file from example'
        });
      }
    }
  }

  analyzeFilesystemError(error) {
    if (error.message.includes('uploads')) {
      this.autoFixAvailable.push({
        issue: 'Missing uploads directory',
        command: 'mkdir',
        target: 'uploads',
        description: 'Create uploads directory'
      });
    }
  }

  analyzeServiceError(error) {
    if (error.name.includes('Database')) {
      this.fixes.push({
        issue: 'Database connection failed',
        solution: 'Check MongoDB configuration',
        manual: true,
        steps: [
          '1. Verify MONGODB_URI in .env file',
          '2. Ensure MongoDB server is running',
          '3. Check network connectivity',
          '4. Verify credentials and permissions'
        ]
      });
    }

    if (error.name.includes('Email')) {
      this.fixes.push({
        issue: 'Email service connection failed',
        solution: 'Check email configuration',
        manual: true,
        steps: [
          '1. Verify SMTP settings in .env file',
          '2. For Gmail: ensure 2FA is enabled',
          '3. For Gmail: use App Password (not regular password)',
          '4. Check EMAIL-SETUP-GUIDE.md for detailed instructions'
        ]
      });
    }

    if (error.name.includes('Paystack')) {
      this.fixes.push({
        issue: 'Paystack connection failed',
        solution: 'Check Paystack configuration',
        manual: true,
        steps: [
          '1. Verify PAYSTACK_SECRET in .env file',
          '2. Ensure key starts with "sk_"',
          '3. Log into Paystack dashboard to verify key',
          '4. Check internet connectivity'
        ]
      });
    }
  }

  getEnvVarSteps(envVar) {
    const steps = [`1. Open .env file in your editor`];
    
    switch (envVar) {
      case 'MONGODB_URI':
        steps.push('2. Set MONGODB_URI=mongodb://localhost:27017/propvet (for local)');
        steps.push('3. Or use your MongoDB Atlas connection string');
        break;
      case 'JWT_SECRET':
        steps.push('2. Set JWT_SECRET=your_secure_random_string_here');
        steps.push('3. Use a long, random string (recommended: 32+ characters)');
        break;
      case 'PAYSTACK_SECRET':
        steps.push('2. Set PAYSTACK_SECRET=sk_test_your_key_here');
        steps.push('3. Get this from your Paystack dashboard');
        break;
      case 'SMTP_USER':
        steps.push('2. Set SMTP_USER=your_email@gmail.com');
        steps.push('3. Set SMTP_PASS=your_app_password');
        steps.push('4. See EMAIL-SETUP-GUIDE.md for details');
        break;
      default:
        steps.push(`2. Set ${envVar}=appropriate_value`);
        steps.push('3. Check .env.example for reference');
    }
    
    return steps;
  }

  suggestFixes() {
    if (this.autoFixAvailable.length > 0) {
      console.log('🔧 AUTO-FIXABLE ISSUES:');
      console.log('The following issues can be fixed automatically:\n');
      
      this.autoFixAvailable.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.description}`);
        if (fix.command === 'copy') {
          console.log(`   Command: copy ${fix.file} ${fix.target}`);
        } else if (fix.command === 'mkdir') {
          console.log(`   Command: mkdir ${fix.target}`);
        } else {
          console.log(`   Command: ${fix.command}`);
        }
      });
      
      console.log('\n❓ Would you like me to apply these fixes? (Run with --fix flag)');
    }

    if (this.fixes.length > 0) {
      console.log('\n🛠️  MANUAL FIXES REQUIRED:');
      console.log('The following issues require manual intervention:\n');
      
      this.fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.issue}`);
        console.log(`   Solution: ${fix.solution}`);
        if (fix.steps) {
          fix.steps.forEach(step => console.log(`   ${step}`));
        }
        console.log();
      });
    }

    console.log('📚 HELPFUL RESOURCES:');
    console.log('- Environment setup: .env.example');
    console.log('- Email configuration: EMAIL-SETUP-GUIDE.md');
    console.log('- Payment setup: PAYMENT-VERIFICATION-WORKFLOW.md');
    console.log('- Re-run health check: npm run health-check');
  }

  async applyAutoFixes() {
    console.log('🔧 Applying automatic fixes...\n');
    
    for (const fix of this.autoFixAvailable) {
      try {
        console.log(`Applying: ${fix.description}`);
        
        if (fix.command === 'npm install') {
          execSync(fix.command, { stdio: 'inherit' });
        } else if (fix.command === 'copy') {
          fs.copyFileSync(fix.file, fix.target);
          console.log(`✅ Created ${fix.target}`);
        } else if (fix.command === 'mkdir') {
          if (!fs.existsSync(fix.target)) {
            fs.mkdirSync(fix.target, { recursive: true });
            console.log(`✅ Created directory ${fix.target}`);
          }
        }
        
      } catch (error) {
        console.log(`❌ Failed to apply fix: ${error.message}`);
      }
    }
    
    console.log('\n✅ Auto-fixes applied. Please configure environment variables manually.');
    console.log('Run "npm run health-check" to verify fixes.');
  }
}

// Main execution
async function main() {
  const doctor = new SystemDoctor();
  const shouldFix = process.argv.includes('--fix');
  
  await doctor.diagnose();
  
  if (shouldFix && doctor.autoFixAvailable.length > 0) {
    await doctor.applyAutoFixes();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 System Doctor crashed:', error.message);
    process.exit(1);
  });
}

module.exports = SystemDoctor;
