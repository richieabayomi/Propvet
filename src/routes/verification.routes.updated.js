const express = require('express');
const router = express.Router();
const VerificationController = require('../controller/verification/VerificationController');
const authorizationMiddleware = require('../misc/middlewares/authorization-middleware');
const { checkPaymentStatus, checkPaymentStatusForAdmin } = require('../misc/middlewares/payment-validation-middleware');

// Multer setup for file uploads
const multer = require('multer');
const upload = multer();

// Optional: error handler for multer
function uploadErrorHandler(err, req, res, next) {
  if (err) {
    return res.status(400).json({
      code: 400,
      error: 'BAD_REQUEST_ERROR',
      status: 'error',
      msg: err.message || 'File upload error.'
    });
  }
  next();
}

// Payment-integrated verification creation
router.post('/create', authorizationMiddleware(), VerificationController.createVerification);

// Payment verification endpoint
router.post('/verify-payment', authorizationMiddleware(), VerificationController.verifyPayment);
router.get('/payment-callback/:verificationId', VerificationController.paymentCallback);

// Paystack webhook endpoint (public - no auth required)
//router.post('/payment-webhook', VerificationController.paymentWebhook);

// Document operations (require payment completion)
// Debug log middleware for /add-document
function debugLogMiddleware(req, res, next) {
  console.log('DEBUG /add-document req.body:', req.body);
  console.log('DEBUG /add-document req.file:', req.file);
  next();
}

router.post('/add-document', authorizationMiddleware(), upload.single('file'), debugLogMiddleware, checkPaymentStatus, uploadErrorHandler, VerificationController.addDocument);
//router.post('/add-document', debugLogMiddleware, upload.single('file'), VerificationController.addDocument);
// Admin operations (require payment completion)
router.patch('/update-document-status', debugLogMiddleware, authorizationMiddleware(['ADMIN']), checkPaymentStatusForAdmin, VerificationController.updateDocumentStatus);

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
