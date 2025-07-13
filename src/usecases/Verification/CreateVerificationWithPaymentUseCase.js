const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { GetVerificationPriceUseCase } = require('./VerificationPriceUseCase');
const { initiatePayment } = require('../../misc/services/paystack');
const { isValidMongoId } = require('../../misc/services/validator');
const BadRequestError = require('../../misc/errors/BadRequestError');
const InternalServerError = require('../../misc/errors/InternalServerError');
const { isString } = require('../../misc/services/data-types');
const { sendMail, emailTemplates } = require('../../misc/services/mail');
const { v4: uuidv4 } = require('uuid');

class CreateVerificationWithPaymentUseCase {
  constructor() {
    this.getVerificationPriceUseCase = new GetVerificationPriceUseCase();
  }

  async execute({ userId, address, state, type, userEmail, callbackUrl, userName }) {
    // Validate inputs
    if (!userId || !isValidMongoId(userId)) {
      throw new BadRequestError('A valid userId is required.');
    }
    if (!address || !isString(address)) {
      throw new BadRequestError('Address is required and must be a st0ring.');
    }
    if (!state || !isString(state)) {
      throw new BadRequestError('State is required and must be a string.');
    }
    if (!type || !['EXPRESS', 'NORMAL'].includes(type)) {
      throw new BadRequestError('Type must be either EXPRESS or NORMAL.');
    }
    if (!userEmail || !isString(userEmail)) {
      throw new BadRequestError('User email is required for payment processing.');
    }

    try {
      // Get the price for the verification type
      const priceData = await this.getVerificationPriceUseCase.execute({ type });
      if (!priceData || !priceData.price) {
        throw new BadRequestError(`Price not found for verification type: ${type}`);
      }

      const amount = priceData.price;
      const paymentReference = `VER_${Date.now()}_${uuidv4().substring(0, 8)}`;

      // Create verification with payment pending status
      const verificationData = {
        user: userId,
        address,
        state,
        type,
        payment_amount: amount,
        payment_reference: paymentReference,
        status: 'PENDING_PAYMENT',
        payment_status: 'PENDING'
      };

      const verification = await verificationRepository.createVerification(verificationData);

      // Initialize payment with Paystack
      // Use callbackUrl parameter (should be frontend URL)
      const paymentCallbackUrl = `http://localhost:5000/verification/payment-callback/${verification._id}`;
      const paymentData = await initiatePayment({
        email: userEmail,
        amount: amount,
        reference: paymentReference,
        callback_url: paymentCallbackUrl,
        metadata: {
          verificationId: verification._id,
          userId: userId
        }
        // Note: webhook is set in Paystack dashboard, not here
      });

      // Update verification with payment details
      await verificationRepository.updateVerification(verification._id, {
        payment_url: paymentData.data.authorization_url,
        payment_access_code: paymentData.data.access_code
      });

      // Send verification created email
      try {
        const emailTemplate = emailTemplates.verificationCreated(
          userName || 'User',
          type,
          verification._id,
          paymentData.data.authorization_url
        );
        
        await sendMail({
          to: userEmail,
          subject: emailTemplate.subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        });
      } catch (emailError) {
        console.error('Failed to send verification created email:', emailError);
        // Don't throw error - verification creation should succeed even if email fails
      }

      return {
        verification: {
          ...verification.toObject(),
          payment_url: paymentData.data.authorization_url,
          payment_access_code: paymentData.data.access_code
        },
        payment: {
          authorization_url: paymentData.data.authorization_url,
          access_code: paymentData.data.access_code,
          reference: paymentReference,
          amount: amount
        }
      };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new InternalServerError('Failed to create verification and initialize payment: ' + error.message);
    }
  }
}

module.exports = CreateVerificationWithPaymentUseCase;
