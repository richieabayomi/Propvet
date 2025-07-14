const { CreateVerificationUseCase, GetVerificationWithDetailsUseCase } = require('../../usecases/Verification/CreateVerificationUseCase');
const CreateVerificationWithPaymentUseCase = require('../../usecases/Verification/CreateVerificationWithPaymentUseCase');
const VerifyPaymentUseCase = require('../../usecases/Verification/VerifyPaymentUseCase');
const AddDocumentToVerificationUseCase = require('../../usecases/Verification/AddDocumentToVerificationUseCase');
const UpdateDocumentStatusUseCase = require('../../usecases/Verification/UpdateDocumentStatusUseCase');
const AddCommentToDocumentUseCase = require('../../usecases/Verification/AddCommentToDocumentUseCase');
const GetVerificationTimelineUseCase = require('../../usecases/Verification/GetVerificationTimelineUseCase');
const { GetAllVerificationsUseCase, GetVerificationsByUserIdUseCase } = require('../../usecases/Verification/GetAllVerificationsUseCase');
const { SetVerificationPriceUseCase, GetVerificationPriceUseCase, GetAllVerificationPricesUseCase } = require('../../usecases/Verification/VerificationPriceUseCase');
const ApiResponse = require('../../misc/services/api-response');

const createVerificationUseCase = new CreateVerificationUseCase();
const createVerificationWithPaymentUseCase = new CreateVerificationWithPaymentUseCase();
const verifyPaymentUseCase = new VerifyPaymentUseCase();
const addDocumentToVerificationUseCase = new AddDocumentToVerificationUseCase();
const updateDocumentStatusUseCase = new UpdateDocumentStatusUseCase();
const addCommentToDocumentUseCase = new AddCommentToDocumentUseCase();
const getVerificationWithDetailsUseCase = new GetVerificationWithDetailsUseCase();
const getVerificationTimelineUseCase = new GetVerificationTimelineUseCase();
const getAllVerificationsUseCase = new GetAllVerificationsUseCase();
const getVerificationsByUserIdUseCase = new GetVerificationsByUserIdUseCase();
const setVerificationPriceUseCase = new SetVerificationPriceUseCase();
const getVerificationPriceUseCase = new GetVerificationPriceUseCase();
const getAllVerificationPricesUseCase = new GetAllVerificationPricesUseCase();

module.exports = {
  async createVerification(req, res) {
    try {
      const { address, state, type } = req.body;
      let { callbackUrl } = req.body;
      const userEmail = req.currentUser.email;
      const userName = req.currentUser.first_name || req.currentUser.username;

      // Set default callbackUrl to frontend payment callback page if not provided
      if (!callbackUrl) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
        callbackUrl = `${frontendUrl}/verification/payment-callback`;
      }

      const result = await createVerificationWithPaymentUseCase.execute({ 
        userId: req.currentUser.id, 
        address, 
        state, 
        type, 
        userEmail,
        userName,
        callbackUrl 
      });

      return ApiResponse.ok(res, result, 201);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async verifyPayment(req, res) {
    try {
      const { reference, verificationId } = req.body;
      const result = await verifyPaymentUseCase.execute({ reference, verificationId });
      return ApiResponse.ok(res, result);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async paymentCallback(req, res) {
    try {
      const { verificationId } = req.params;
      const { reference, trxref } = req.query;
      
      // Use the reference from query params (Paystack sends this)
      const paymentReference = reference || trxref;
      
      if (!paymentReference) {
        return res.status(400).json({
          success: false,
          message: 'Payment reference is required'
        });
      }

      // Verify the payment
      const result = await verifyPaymentUseCase.execute({ 
        reference: paymentReference, 
        verificationId 
      });

      // Redirect to frontend with payment status
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const paymentStatus = result.payment.status === 'success' ? 'success' : 'failed';
      
            return ApiResponse.ok(res, { paymentStatus,reference,verificationId }, 201);
      //return res.redirect(`${frontendUrl}/verification/${verificationId}/payment-status?status=${paymentStatus}&reference=${paymentReference}`);
      
    } catch (err) {
      console.error('Payment callback error:', err);
      return ApiResponse.error(res, err);
    }
  },

  async addDocument(req, res) {
    try {
      const { verificationId, name } = req.body;
      let file_url = req.body.file_url;

      if (req.file) {
        file_url = `/uploads/${req.file.filename}`;
      }
      
      const document = await addDocumentToVerificationUseCase.execute({ verificationId, name, file_url });
      return ApiResponse.ok(res, { document }, 201);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async updateDocumentStatus(req, res) {
    try {
      const { documentId, status } = req.body;
      const document = await updateDocumentStatusUseCase.execute({ documentId, status });
      return ApiResponse.ok(res, { document });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async addComment(req, res) {
    try {
      const { documentId, content, is_admin } = req.body;
      const comment = await addCommentToDocumentUseCase.execute({ documentId, authorId: req.currentUser.id, content, is_admin });
      return ApiResponse.ok(res, { comment }, 201);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getVerificationWithDetails(req, res) {
    try {
      const { verificationId } = req.params;
      const verification = await getVerificationWithDetailsUseCase.execute({ verificationId });
      return ApiResponse.ok(res, { verification });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getTimeline(req, res) {
    try {
      const { verificationId } = req.params;
      const timeline = await getVerificationTimelineUseCase.execute({ verificationId });
      return ApiResponse.ok(res, { timeline });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getAllVerifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const verifications = await getAllVerificationsUseCase.execute({ page: Number(page), limit: Number(limit) });
      return ApiResponse.ok(res, { verifications });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getVerificationsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const verifications = await getVerificationsByUserIdUseCase.execute({ userId, page: Number(page), limit: Number(limit) });
      return ApiResponse.ok(res, { verifications });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async setVerificationPrice(req, res) {
    try {
      const { type, price } = req.body;
      const result = await setVerificationPriceUseCase.execute({ type, price });
      return ApiResponse.ok(res, { price: result });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getVerificationPrice(req, res) {
    try {
      const { type } = req.query;
      const result = await getVerificationPriceUseCase.execute({ type });
      return ApiResponse.ok(res, { price: result });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getAllVerificationPrices(req, res) {
    try {
      console.log("Getting verification prices")
      const result = await getAllVerificationPricesUseCase.execute();
      return ApiResponse.ok(res, { prices: result });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async paymentWebhook(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method Not Allowed. Only POST requests are accepted at this endpoint.'
      });
    }
    try {
      const hash = require('crypto')
        .createHmac('sha512', process.env.PAYSTACK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({
          success: false,
          message: 'Invalid signature'
        });
      }

      const { event, data } = req.body;

      // Handle successful payment
      if (event === 'charge.success' && data.status === 'success') {
        const paymentReference = data.reference;
        // Extract verificationId from metadata if available
        const verificationId = data.metadata && data.metadata.verificationId ? data.metadata.verificationId : undefined;

        // Verify and update verification
        await verifyPaymentUseCase.execute({ reference: paymentReference, verificationId });

        console.log(`Payment verified via webhook: ${paymentReference}`);
      }

      // Always respond with 200 to acknowledge webhook
      return res.status(200).json({ success: true });

    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(500).json({
        success: false,
        message: 'Webhook processing failed'
      });
    }
  }

};