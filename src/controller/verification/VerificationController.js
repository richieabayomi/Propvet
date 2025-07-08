const { CreateVerificationUseCase, GetVerificationWithDetailsUseCase } = require('../../usecases/Verification/CreateVerificationUseCase');
const AddDocumentToVerificationUseCase = require('../../usecases/Verification/AddDocumentToVerificationUseCase');
const UpdateDocumentStatusUseCase = require('../../usecases/Verification/UpdateDocumentStatusUseCase');
const AddCommentToDocumentUseCase = require('../../usecases/Verification/AddCommentToDocumentUseCase');
const GetVerificationTimelineUseCase = require('../../usecases/Verification/GetVerificationTimelineUseCase');
const { GetAllVerificationsUseCase, GetVerificationsByUserIdUseCase } = require('../../usecases/Verification/GetAllVerificationsUseCase');
const ApiResponse = require('../../misc/services/api-response');

const createVerificationUseCase = new CreateVerificationUseCase();
const addDocumentToVerificationUseCase = new AddDocumentToVerificationUseCase();
const updateDocumentStatusUseCase = new UpdateDocumentStatusUseCase();
const addCommentToDocumentUseCase = new AddCommentToDocumentUseCase();
const getVerificationWithDetailsUseCase = new GetVerificationWithDetailsUseCase();
const getVerificationTimelineUseCase = new GetVerificationTimelineUseCase();
const getAllVerificationsUseCase = new GetAllVerificationsUseCase();
const getVerificationsByUserIdUseCase = new GetVerificationsByUserIdUseCase();

module.exports = {
  async createVerification(req, res) {
    try {
      const verification = await createVerificationUseCase.execute({ userId: req.currentUser.id });
      return ApiResponse.ok(res, { verification }, 201);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async addDocument(req, res) {
    try {
      const { verificationId, name } = req.body;
      let file_url = req.body.file_url;
      if (req.file) {
        // Save the relative path or URL to the uploaded file
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
  }
};
