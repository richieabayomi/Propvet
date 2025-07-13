# Propvet System Health & Dependency Checker

## Overview

The Propvet application includes a comprehensive system health checker that validates all dependencies, configurations, and services before allowing the application to start. This ensures a robust, production-ready deployment.

## 🩺 Health Check System

### Components

1. **System Health Checker** (`src/misc/services/system-health-checker.js`)
   - Core validation engine
   - Checks environment variables, dependencies, services, and file system
   - Categorizes issues for better troubleshooting

2. **Startup with Health Check** (`startup-with-health-check.js`)
   - Application entry point with pre-flight checks
   - Graceful error handling and specific exit codes
   - Automatic health validation before server start

3. **Standalone Health Check** (`health-check.js`)
   - Run health checks independently
   - Useful for CI/CD pipelines and debugging

4. **System Doctor** (`scripts/system-doctor.js`)
   - Advanced diagnostic tool
   - Suggests and applies automatic fixes
   - Provides step-by-step manual fix instructions

## 🚀 Usage

### Quick Start
```bash
# Start application with health checks (recommended)
npm start

# Run health check only
npm run health-check

# Diagnose issues and get fix suggestions
npm run doctor

# Auto-fix common issues
npm run doctor:fix

# Start server directly (skip health checks)
npm run start:direct
```

### Health Check Categories

#### 1. Environment Variables
- **Required**: `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `PAYSTACK_SECRET`, `BASE_URL`, `FRONTEND_URL`
- **Optional**: Email configuration (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
- **Validation**: Format checking, value validation

#### 2. Dependencies
- **Node.js Version**: Requires Node.js 16+
- **Required Packages**: express, mongoose, bcrypt, jsonwebtoken, nodemailer, axios, multer, dotenv, uuid
- **Installation Check**: Verifies packages are actually installed in `node_modules`

#### 3. File System
- **Required Directories**: src/, uploads/, and all subdirectories
- **Required Files**: package.json, core service files
- **Permissions**: Write access to uploads directory

#### 4. Service Connectivity
- **Database**: MongoDB connection test
- **Email Service**: SMTP connection verification
- **Payment Service**: Paystack API connectivity test

## 🔧 Error Categories & Exit Codes

### Exit Codes
- `0`: Success - all checks passed
- `1`: General error
- `2`: Dependency error (missing packages)
- `3`: Configuration error (environment variables)
- `4`: Application startup error
- `5`: Uncaught exception
- `6`: Unhandled rejection
- `7`: Health check system crash

### Error Categories
- **Dependency**: Missing or incompatible packages/Node.js
- **Configuration**: Invalid or missing environment variables
- **Filesystem**: Missing files/directories or permission issues
- **Service**: Connectivity issues with external services

## 🛠️ Common Issues & Solutions

### 1. Missing Dependencies
```bash
# Error: "node_modules directory not found"
npm install

# Error: "Missing dependencies: package1, package2"
npm install package1 package2
```

### 2. Configuration Issues
```bash
# Error: "Missing required environment variable"
# 1. Copy example file
cp .env.example .env
# 2. Edit .env and set required values
```

### 3. Database Connection
```bash
# Error: "Failed to connect to MongoDB"
# Check:
# - MongoDB server is running
# - Connection string is correct
# - Network connectivity
# - Credentials are valid
```

### 4. Email Service
```bash
# Error: "Email service connection failed"
# For Gmail:
# 1. Enable 2FA
# 2. Generate App Password
# 3. Use App Password in SMTP_PASS
# See: EMAIL-SETUP-GUIDE.md
```

### 5. Paystack Integration
```bash
# Error: "Paystack connection failed"
# Check:
# - Secret key starts with "sk_"
# - Key is valid in Paystack dashboard
# - Internet connectivity
```

## 📊 Health Check Report Example

```
🚀 Starting Propvet System Health Check...

============================================================

🔍 Checking Environment Variables...
✅ ENV: PORT: Environment variable set
✅ ENV: NODE_ENV: Environment variable set
✅ ENV: MONGODB_URI: Environment variable set
✅ ENV: JWT_SECRET: Environment variable set
✅ ENV: PAYSTACK_SECRET: Environment variable set
✅ ENV: BASE_URL: Environment variable set
✅ ENV: FRONTEND_URL: Environment variable set
✅ ENV: Email Configuration: Email configuration complete

🔍 Checking Node.js and Dependencies...
✅ Node.js Version: Node.js v18.17.0 (compatible)
✅ Dependencies: All required dependencies are listed in package.json
✅ Installed Dependencies: All required dependencies are installed

🔍 Checking File System...
✅ FileSystem: src: Directory exists
✅ FileSystem: uploads: Directory exists
✅ FileSystem: Upload Permissions: Uploads directory is writable

🔍 Checking Database Connection...
✅ Database Connection: Successfully connected to MongoDB
✅ Database Operations: MongoDB server version: 5.0.0

🔍 Checking Email Service...
✅ Email Service: SMTP connection verified for smtp.gmail.com

🔍 Checking Paystack Connection...
✅ Paystack Connection: Paystack API connection successful

============================================================
📊 SYSTEM HEALTH CHECK SUMMARY
============================================================
✅ Passed: 15
❌ Failed: 0
⚠️  Warnings: 0
📊 Total Checks: 15

🎉 ALL CRITICAL CHECKS PASSED!
✨ Your Propvet application is ready to start!
============================================================
```

## 🔄 Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Health Check
  run: npm run health-check
  
- name: Start Application
  run: npm start
```

### Docker Integration
```dockerfile
# Add health check to Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD npm run health-check || exit 1
```

## 🚨 Troubleshooting

### System Doctor
The System Doctor provides advanced diagnostics:

```bash
# Get detailed diagnosis
npm run doctor

# Apply automatic fixes
npm run doctor:fix
```

### Manual Debugging
```bash
# Check specific issues
node -e "console.log(process.env.NODE_ENV)"
mongo --eval "db.runCommand('ismaster')"
curl -H "Authorization: Bearer $PAYSTACK_SECRET" https://api.paystack.co/bank
```

### Debug Mode
Set `DEBUG=true` in environment to get verbose logging during health checks.

## 📚 Related Documentation

- [Environment Setup](.env.example)
- [Email Configuration](EMAIL-SETUP-GUIDE.md)
- [Payment Integration](PAYMENT-VERIFICATION-WORKFLOW.md)
- [API Documentation](ENDPOINTS.md)

## 🔐 Security Considerations

- Environment variables are validated but values are not logged
- Sensitive data (passwords, keys) are never displayed in output
- Connection tests use minimal required permissions
- All external service connections use secure protocols

## 🎯 Best Practices

1. **Always run health checks** before deploying to production
2. **Use the System Doctor** for quick issue resolution
3. **Monitor health check logs** in production environments
4. **Set up alerts** for health check failures in deployment pipelines
5. **Keep dependencies updated** and run health checks after updates

---

*This system ensures your Propvet application starts only when all critical dependencies and configurations are properly set up, preventing runtime errors and improving reliability.*
