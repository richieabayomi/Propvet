const express = require('express');
const router = express.Router();
const VerificationController = require('../controller/verification/VerificationController');
const authorizationMiddleware = require('../misc/middlewares/authorization-middleware');
const upload = require('../misc/middlewares/upload-middleware');
const { uploadErrorHandler } = require('../misc/middlewares/upload-middleware');

router.post('/create', authorizationMiddleware(), VerificationController.createVerification);
router.post('/add-document', authorizationMiddleware(), upload.single('file'), uploadErrorHandler, VerificationController.addDocument);
router.patch('/update-document-status', authorizationMiddleware(['ADMIN']), VerificationController.updateDocumentStatus);
router.post('/add-comment', authorizationMiddleware(), VerificationController.addComment);
router.get('/all', authorizationMiddleware(['ADMIN']), VerificationController.getAllVerifications);
router.get('/user/:userId', authorizationMiddleware(), VerificationController.getVerificationsByUserId);
router.get('/:verificationId/timeline', authorizationMiddleware(), VerificationController.getTimeline);
router.get('/:verificationId', VerificationController.getVerificationWithDetails);

module.exports = router;
