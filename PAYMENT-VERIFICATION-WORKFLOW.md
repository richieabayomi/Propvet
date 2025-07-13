# PAYMENT-INTEGRATED VERIFICATION SYSTEM

## Overview
The Propvet verification system now requires **payment completion before any verification activities can begin**. This ensures a seamless paid service where users pay upfront based on verification type (EXPRESS or NORMAL).

## 🔄 New Workflow

### 1. **User Creates Verification** 
```
POST /verification/create
```
- User provides: `address`, `state`, `type` (EXPRESS/NORMAL), optional `callbackUrl`
- System automatically:
  - Fetches price from VerificationPrice table based on type
  - Creates verification with `PENDING_PAYMENT` status
  - Initializes Paystack payment
  - Returns verification details + Paystack payment URL

**Response includes:**
- `verification` object with payment details
- `payment` object with Paystack authorization URL
- User is redirected to Paystack for payment

### 2. **Payment Processing**
- User completes payment on Paystack
- Paystack redirects to callback URL (optional)
- System verifies payment via webhook or manual verification

### 3. **Payment Verification**
```
POST /verification/verify-payment
```
- Verifies payment status with Paystack
- Updates verification status from `PENDING_PAYMENT` to `PENDING`
- Updates payment_status to `PAID` or `FAILED`

### 4. **Document Upload (Payment Required)**
```
POST /verification/add-document
```
- **Blocked until payment_status = 'PAID'**
- Payment validation middleware checks before allowing upload
- Returns authorization error if payment not completed

### 5. **Admin Actions (Payment Required)**
```
PATCH /verification/update-document-status
POST /verification/add-comment
```
- **Admin cannot review/update until payment is completed**
- Payment validation middleware protects all admin actions
- Ensures no free work is performed

## 🏗️ Technical Implementation

### Database Changes
**Verification Schema Updates:**
```javascript
{
  status: ['PENDING_PAYMENT', 'PENDING', 'REQUIRES_CLARIFICATION', 'VERIFIED', 'REJECTED'],
  payment_status: ['PENDING', 'PAID', 'FAILED'],
  payment_amount: Number,
  payment_url: String,
  payment_access_code: String,
  payment_reference: String
}
```

### New Use Cases
1. **CreateVerificationWithPaymentUseCase** - Handles verification creation + payment initialization
2. **VerifyPaymentUseCase** - Verifies Paystack payment and updates status

### Middleware Protection
1. **checkPaymentStatus** - Protects user document operations
2. **checkPaymentStatusForAdmin** - Protects admin verification actions

### Payment Integration
- **Paystack Integration**: Automatic payment initialization and verification
- **Dynamic Pricing**: Fetches price based on verification type
- **Payment References**: Unique payment tracking per verification

## 📋 API Endpoints

### Core Verification Endpoints
| Method | Endpoint | Auth | Payment Required | Description |
|--------|----------|------|------------------|-------------|
| POST | `/verification/create` | User | No | Creates verification + initiates payment |
| POST | `/verification/verify-payment` | User | No | Verifies payment completion |
| POST | `/verification/add-document` | User | **Yes** | Upload documents (blocked until paid) |
| PATCH | `/verification/update-document-status` | Admin | **Yes** | Update document status (blocked until paid) |
| POST | `/verification/add-comment` | User/Admin | **Yes** | Add comments (blocked until paid) |

### Read-Only Endpoints (No Payment Required)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/verification/all` | Admin | Get all verifications |
| GET | `/verification/user/:userId` | User | Get user's verifications |
| GET | `/verification/:verificationId` | User | Get verification details |
| GET | `/verification/:verificationId/timeline` | User | Get verification timeline |

### Pricing Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/verification/set-price` | Admin | Set verification prices |
| GET | `/verification/price` | Public | Get price for specific type |
| GET | `/verification/prices` | Public | Get all verification prices |

## 🎯 Business Rules

### Payment Rules
1. **Payment First**: No verification work starts until payment is completed
2. **Type-Based Pricing**: 
   - NORMAL: ₦5,000 (default)
   - EXPRESS: ₦10,000 (default)
3. **Payment Blocking**: All document uploads and admin actions are blocked until payment
4. **Payment Verification**: Real-time verification with Paystack API

### Status Flow
```
PENDING_PAYMENT → (after payment) → PENDING → REQUIRES_CLARIFICATION/VERIFIED/REJECTED
```

### Error Handling
- **401 Unauthorized**: If payment not completed for protected actions
- **400 Bad Request**: If payment verification fails
- **404 Not Found**: If verification not found for payment reference

## 🚀 Setup Instructions

### 1. Environment Variables
```bash
PAYSTACK_SECRET=your_paystack_secret_key
FRONTEND_URL=your_frontend_url
```

### 2. Seed Verification Prices
```bash
node scripts/seed-verification-prices.js
```

### 3. Test the Flow
1. Create verification → Get payment URL
2. Complete payment on Paystack
3. Verify payment → Status changes to PENDING
4. Upload documents → Should now work
5. Admin can now review documents

## 📊 Verification Status Meanings

| Status | Description |
|--------|-------------|
| `PENDING_PAYMENT` | Waiting for user to complete payment |
| `PENDING` | Payment completed, waiting for documents/review |
| `REQUIRES_CLARIFICATION` | Needs additional documents or information |
| `VERIFIED` | All documents approved, verification complete |
| `REJECTED` | Verification rejected by admin |

## 💳 Payment Status Meanings

| Payment Status | Description |
|----------------|-------------|
| `PENDING` | Payment not yet completed |
| `PAID` | Payment successfully completed |
| `FAILED` | Payment failed or was declined |

## 🔧 Postman Collection
The updated Postman collection includes:
- Payment-integrated verification creation
- Payment verification endpoint
- Automatic token and reference management
- All endpoints with proper payment validations

This system ensures **no free verification work** is performed and creates a robust **paid service model** with Paystack integration! 🎉
