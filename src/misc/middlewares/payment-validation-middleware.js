const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const BadRequestError = require('../errors/BadRequestError');
const AuthorizationError = require('../errors/AuthorizationError');

/**
 * Middleware to check if verification payment is completed before allowing document operations
 */
async function checkPaymentStatus(req, res, next) {
  try {
    const { verificationId } = req.body;
    
    if (!verificationId) {
      return next(new BadRequestError('Verification ID is required.'));
    }

    const verification = await verificationRepository.getVerificationById(verificationId);
    
    if (!verification) {
      return next(new BadRequestError('Verification not found.'));
    }

    // Check if payment is completed
    if (verification.payment_status !== 'PAID') {
      return next(new AuthorizationError('Payment must be completed before uploading documents or performing verification actions.'));
    }

    // Attach verification to request for use in controller
    req.verification = verification;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to check if verification payment is completed before allowing admin actions
 */
async function checkPaymentStatusForAdmin(req, res, next) {
  try {
    const { documentId, verificationId } = req.body;
    let verification;

    if (verificationId) {
      verification = await verificationRepository.getVerificationById(verificationId);
    } else if (documentId) {
      // Get verification through document
      verification = await verificationRepository.getVerificationByDocumentId(documentId);
    }
    
    if (!verification) {
      return next(new BadRequestError('Verification not found.'));
    }

    // Check if payment is completed
    if (verification.payment_status !== 'PAID') {
      return next(new AuthorizationError('Payment must be completed before admin can perform verification actions.'));
    }

    // Attach verification to request for use in controller
    req.verification = verification;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { checkPaymentStatus, checkPaymentStatusForAdmin };
