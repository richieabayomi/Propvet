const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { verifyPayment } = require('../../misc/services/paystack');
const { isValidMongoId } = require('../../misc/services/validator');
const BadRequestError = require('../../misc/errors/BadRequestError');
const NotFoundError = require('../../misc/errors/NotFoundError');
const InternalServerError = require('../../misc/errors/InternalServerError');
const { isString } = require('../../misc/services/data-types');
const { sendMail, emailTemplates } = require('../../misc/services/mail.simple');

class VerifyPaymentUseCase {
  async execute({ reference, verificationId }) {
    // Validate inputs
    if (!reference || !isString(reference)) {
      throw new BadRequestError('Payment reference is required.');
    }
    
    try {
      // Verify payment with Paystack
      const paymentData = await verifyPayment(reference);
      
      if (!paymentData.status || !paymentData.data) {
        throw new BadRequestError('Invalid payment verification response.');
      }

      // Check if payment was successful
      const isPaymentSuccessful = paymentData.data.status === 'success';
      
      // Find verification by payment reference
      let verification;
      if (verificationId) {
        verification = await verificationRepository.getVerificationById(verificationId);
      } else {
        verification = await verificationRepository.getVerificationByPaymentReference(reference);
      }

      if (!verification) {
        throw new NotFoundError('Verification not found for this payment reference.');
      }

      // Update verification payment status
      const updateData = {
        payment_status: isPaymentSuccessful ? 'PAID' : 'FAILED',
        updated_at: new Date()
      };

      // If payment is successful, change verification status from PENDING_PAYMENT to PENDING
      if (isPaymentSuccessful) {
        updateData.status = 'PENDING';
      }

      await verificationRepository.updateVerification(verification._id, updateData);

      // Get updated verification
      const updatedVerification = await verificationRepository.getVerificationById(verification._id);

      // Send payment confirmation email if payment was successful
      if (isPaymentSuccessful) {
        try {
          const emailTemplate = emailTemplates.paymentConfirmed(
            updatedVerification.user.first_name || updatedVerification.user.username || 'User',
            updatedVerification.type,
            updatedVerification._id
          );
          
          await sendMail({
            to: updatedVerification.user.email,
            subject: emailTemplate.subject,
            text: emailTemplate.text,
            html: emailTemplate.html
          });
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
          // Don't throw error - payment verification should succeed even if email fails
        }
      }

      return {
        verification: updatedVerification,
        payment: {
          status: paymentData.data.status,
          amount: paymentData.data.amount / 100, 
          reference: paymentData.data.reference,
          paid_at: paymentData.data.paid_at,
          channel: paymentData.data.channel
        }
      };
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError('Failed to verify payment: ' + error.message);
    }
  }
}

module.exports = VerifyPaymentUseCase;
