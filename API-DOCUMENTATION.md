# Propvet API Documentation

## Overview

The Propvet API is a comprehensive property verification service with payment-first workflow, email notifications, and robust system health monitoring. This documentation covers all available endpoints and their usage.

## Base Configuration

- **Base URL**: `http://localhost:5000` (Development)
- **API Version**: v2.0
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json` (except file uploads)

## Quick Start

1. **Import Postman Collection**: Import `Propvet-API-Collection.postman_collection.json`
2. **Set Environment Variables**: Configure `baseUrl` in Postman variables
3. **Register/Login**: Start with authentication endpoints
4. **Health Check**: Verify system health before proceeding

## Authentication Flow

### 1. User Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

**Response**: Welcome email sent automatically

### 2. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response**: Returns `token`, `refresh_token`, and user details

### 3. Token Refresh
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

## Verification Workflow (Payment-First)

### 🔄 Complete Verification Process

#### Step 1: Create Verification
```http
POST /verification/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "address": "123 Main Street, Victoria Island, Lagos",
  "state": "Lagos",
  "type": "NORMAL",
  "callbackUrl": "https://yourapp.com/payment-callback"
}
```

**What happens:**
- ✅ Verification created with `PENDING_PAYMENT` status
- ✅ Price fetched automatically based on type (NORMAL/EXPRESS)
- ✅ Paystack payment initialized
- ✅ Email sent with payment link
- ✅ Returns verification details + payment URL

#### Step 2: User Completes Payment
- User redirected to Paystack
- Payment processed by Paystack
- Automatic webhook confirmation OR manual verification

#### Step 3: Payment Verification (Automatic via Webhook)
```http
POST /verification/payment-webhook
Content-Type: application/json
x-paystack-signature: {webhook_signature}

{
  "event": "charge.success",
  "data": {
    "reference": "payment_reference",
    "status": "success",
    "metadata": {
      "verification_id": "verification_id"
    }
  }
}
```

**What happens:**
- ✅ Payment status verified with Paystack
- ✅ Verification status updated to `PENDING`
- ✅ Payment confirmation email sent
- ✅ User can now upload documents

#### Step 4: Document Upload (Payment Required)
```http
POST /verification/add-document
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": [binary file],
  "verificationId": "verification_id",
  "documentType": "identity_card",
  "description": "National ID Card - Front Side"
}
```

**Payment Validation**: Automatically blocked if payment not completed

#### Step 5: Admin Review (Payment Required)
```http
PATCH /verification/update-document-status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "verificationId": "verification_id",
  "documentId": "document_id",
  "status": "APPROVED",
  "adminComment": "Document verified successfully"
}
```

## API Endpoints Reference

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/forgot-password` | Request password reset | ❌ |
| POST | `/auth/reset-password` | Reset password with token | ❌ |
| POST | `/auth/refresh-token` | Refresh JWT token | ❌ |
| PATCH | `/auth/update-password` | Update user password | ✅ |
| PATCH | `/auth/update-profile` | Update user profile | ✅ |
| PATCH | `/auth/set-user-status` | Set user status (Admin) | 👤 Admin |
| GET | `/auth/users` | Get all users (Admin) | 👤 Admin |
| GET | `/auth/user/:id` | Get user by ID | ✅ |

### 🏠 Verification Endpoints

| Method | Endpoint | Description | Auth Required | Payment Required |
|--------|----------|-------------|---------------|------------------|
| POST | `/verification/create` | Create verification + payment | ✅ | ❌ |
| POST | `/verification/verify-payment` | Manually verify payment | ✅ | ❌ |
| GET | `/verification/payment-callback/:id` | Payment callback | ❌ | ❌ |
| POST | `/verification/payment-webhook` | Paystack webhook | ❌ | ❌ |
| POST | `/verification/add-document` | Upload document | ✅ | ✅ |
| PATCH | `/verification/update-document-status` | Update document (Admin) | 👤 Admin | ✅ |
| POST | `/verification/add-comment` | Add comment to document | ✅ | ✅ |
| GET | `/verification/all` | Get all verifications (Admin) | 👤 Admin | ❌ |
| GET | `/verification/user/:userId` | Get user verifications | ✅ | ❌ |
| GET | `/verification/:id` | Get verification details | ✅ | ❌ |
| GET | `/verification/:id/timeline` | Get verification timeline | ✅ | ❌ |

### 💰 Pricing Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/verification/set-price` | Set verification price (Admin) | 👤 Admin |
| GET | `/verification/price` | Get price for type | ❌ |
| GET | `/verification/prices` | Get all prices | ❌ |

### 🏥 Health Check Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/healthCheck` | Basic API health | ❌ |
| GET | `/apiHealth/:name` | Health status with message | ❌ |

## Payment Integration

### Supported Types
- **NORMAL**: Standard verification (3-5 business days)
- **EXPRESS**: Express verification (24 hours)

### Payment Flow
1. **Initialization**: Automatic when verification created
2. **Processing**: Handled by Paystack
3. **Confirmation**: Via webhook or manual verification
4. **Validation**: Middleware blocks access until payment confirmed

### Paystack Configuration
```bash
# Environment Variables
PAYSTACK_SECRET=sk_test_your_secret_key_here
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## Email Notifications

### Automatic Emails
- ✅ **Welcome Email**: User registration
- ✅ **Password Reset**: Forgot password request
- ✅ **Verification Created**: With payment link
- ✅ **Payment Confirmation**: Successful payment
- ✅ **Status Updates**: Verification progress

### Email Configuration
```bash
# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME=Propvet
SMTP_FROM=your_email@gmail.com
```

## Error Handling

### Common Error Codes
- **400**: Bad Request - Invalid data
- **401**: Unauthorized - Invalid/missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists
- **423**: Locked - Payment required
- **500**: Internal Server Error

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description",
  "code": 400,
  "timestamp": "2025-07-12T10:30:00.000Z"
}
```

## System Health Monitoring

### Health Check Scripts
```bash
# Run comprehensive health check
npm run health-check

# Diagnose and suggest fixes
npm run doctor

# Auto-fix common issues
npm run doctor:fix

# Start with health check
npm start
```

### Health Check Categories
- **Environment Variables**: Required configurations
- **Dependencies**: Node.js version and packages
- **File System**: Required directories and permissions
- **Services**: Database, email, and Paystack connectivity

## Security Features

### JWT Authentication
- **Access Token**: Short-lived (1 hour)
- **Refresh Token**: Long-lived (7 days)
- **Automatic Expiry**: Secure token management

### Payment Security
- **Webhook Verification**: Paystack signature validation
- **Payment Validation**: Middleware protection
- **Status Tracking**: Comprehensive audit trail

### Data Protection
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size restrictions

## Development Tools

### Postman Collection Features
- **Environment Variables**: Automatic token management
- **Test Scripts**: Response parsing and variable setting
- **Documentation**: Comprehensive endpoint descriptions
- **Examples**: Sample requests and responses

### Testing Endpoints
```bash
# Test email service
POST /test/email

# Generate sample data
POST /test/generate-data
```

## Production Deployment

### Environment Setup
1. **Copy Environment**: `cp .env.example .env`
2. **Configure Variables**: Update all required values
3. **Health Check**: `npm run health-check`
4. **Start Application**: `npm start`

### Required Environment Variables
```bash
# Critical Variables
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PAYSTACK_SECRET=your_paystack_secret
BASE_URL=https://your-domain.com
FRONTEND_URL=https://your-frontend.com

# Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
```

### Health Check Integration
```yaml
# Docker Health Check
HEALTHCHECK --interval=30s --timeout=10s \
  CMD npm run health-check || exit 1

# CI/CD Pipeline
- name: Health Check
  run: npm run health-check
```

## Support & Documentation

### Additional Resources
- **System Health Guide**: `SYSTEM-HEALTH-GUIDE.md`
- **Email Setup Guide**: `EMAIL-SETUP-GUIDE.md`
- **Payment Workflow**: `PAYMENT-VERIFICATION-WORKFLOW.md`
- **Environment Example**: `.env.example`

### Common Issues
1. **nodemailer.createTransporter is not a function**: Fixed in v2.0
2. **Payment validation blocking**: Check payment status
3. **Email not sending**: Verify SMTP configuration
4. **Database connection**: Check MongoDB URI and network

---

**API Version**: 2.0  
**Last Updated**: July 12, 2025  
**Postman Collection**: `Propvet-API-Collection.postman_collection.json`
