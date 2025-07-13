const express = require('express');
const router = express.Router();
const VerificationController = require('../controller/verification/VerificationController');
const authorizationMiddleware = require('../misc/middlewares/authorization-middleware');
const { checkPaymentStatus, checkPaymentStatusForAdmin } = require('../misc/middlewares/payment-validation-middleware');
const upload = require('../misc/middlewares/upload-middleware');
const { uploadErrorHandler } = require('../misc/middlewares/upload-middleware');

// Payment-integrated verification creation
router.post('/create', authorizationMiddleware(), VerificationController.createVerification);

// Payment verification endpoint
router.post('/verify-payment', authorizationMiddleware(), VerificationController.verifyPayment);
router.get('/payment-callback/:verificationId', VerificationController.paymentCallback);

// Paystack webhook endpoint (public - no auth required)
//router.post('/payment-webhook', VerificationController.paymentWebhook);

// Document operations (require payment completion)
router.post('/add-document', authorizationMiddleware(), checkPaymentStatus, upload.single('file'), uploadErrorHandler, VerificationController.addDocument);

// Admin operations (require payment completion)
router.patch('/update-document-status', authorizationMiddleware(['ADMIN']), checkPaymentStatusForAdmin, VerificationController.updateDocumentStatus);

// Comment operations (require payment completion)
router.post('/add-comment', authorizationMiddleware(), checkPaymentStatus, VerificationController.addComment);

// Read operations (no payment restriction needed)

// Pricing operations (must come before dynamic :verificationId route)
router.post('/set-price', authorizationMiddleware(['ADMIN']), VerificationController.setVerificationPrice);
router.get('/price', VerificationController.getVerificationPrice);
router.get('/prices', VerificationController.getAllVerificationPrices);

// Read operations (no payment restriction needed)
router.get('/all', authorizationMiddleware(['ADMIN']), VerificationController.getAllVerifications);
router.get('/user/:userId', authorizationMiddleware(), VerificationController.getVerificationsByUserId);
router.get('/:verificationId/timeline', authorizationMiddleware(), VerificationController.getTimeline);
router.get('/:verificationId', VerificationController.getVerificationWithDetails);

module.exports = router;
