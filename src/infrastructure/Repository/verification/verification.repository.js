const Verification = require('../../../domain/entities/verification/verification');
const VerificationDocument = require('../../../domain/entities/verification/verificationDocument');
const VerificationComment = require('../../../domain/entities/verification/verificationComment');
const VerificationTimelineEvent = require('../../../domain/entities/verification/verificationTimelineEvent');

class VerificationRepository {
  async createVerification(data) {
    return Verification.create(data);
  }

  async getVerificationById(id) {
    return Verification.findById(id).populate({
      path: 'documents',
      populate: { path: 'comments' }
    });
  }

  async addDocumentToVerification(verificationId, documentData) {
    const doc = await VerificationDocument.create(documentData);
    await Verification.findByIdAndUpdate(verificationId, { $push: { documents: doc._id } });
    return doc;
  }

  async updateDocumentStatus(documentId, status, authorId = null) {
    // Update the document status
    const updatedDoc = await VerificationDocument.findByIdAndUpdate(documentId, { status }, { new: true });
    if (!updatedDoc) return null;

    // Log timeline event for document status change
    await VerificationTimelineEvent.create({
      verification: updatedDoc.verification,
      document: updatedDoc._id,
      author: authorId,
      type: 'STATUS_CHANGE',
      status: status
    });

    const verificationId = updatedDoc.verification;
    const allDocs = await VerificationDocument.find({ verification: verificationId });
    let newStatus = 'VERIFIED';
    if (allDocs.some(doc => doc.status === 'REQUIRES_CLARIFICATION')) {
      newStatus = 'REQUIRES_CLARIFICATION';
    } else if (allDocs.some(doc => doc.status === 'PENDING')) {
      newStatus = 'PENDING';
    }
    await Verification.findByIdAndUpdate(verificationId, { status: newStatus });
    // Log timeline event for verification status change
    await VerificationTimelineEvent.create({
      verification: verificationId,
      author: authorId,
      type: 'STATUS_CHANGE',
      status: newStatus
    });
    return updatedDoc;
  }

  async addCommentToDocument(documentId, commentData) {
    const comment = await VerificationComment.create(commentData);
    await VerificationDocument.findByIdAndUpdate(documentId, { $push: { comments: comment._id } });
    // Ensure verification is set for timeline event
    let verificationId = commentData.verification;
    if (!verificationId) {
      const doc = await VerificationDocument.findById(documentId);
      verificationId = doc ? doc.verification : undefined;
    }
    await VerificationTimelineEvent.create({
      verification: verificationId,
      document: documentId,
      author: commentData.author,
      type: 'COMMENT',
      comment: commentData.content
    });
    return comment;
  }

  async updateVerificationStatus(verificationId, status) {
    return Verification.findByIdAndUpdate(verificationId, { status }, { new: true });
  }

  async getVerificationWithDetails(verificationId) {
    return Verification.findById(verificationId)
      .populate({
        path: 'documents',
        populate: { path: 'comments', populate: { path: 'author', select: 'username email role' } }
      })
      .populate('user', 'username email role');
  }

  async getTimelineEvents(verificationId) {
    return VerificationTimelineEvent.find({ verification: verificationId })
      .sort({ created_at: 1 })
      .populate('author', 'username email role')
      .populate('document', 'name');
  }

  async getAllVerifications(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return Verification.find()
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email role')
      .populate('documents');
  }

  async getVerificationsByUserId(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return Verification.find({ user: userId })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email role')
      .populate('documents');
  }

  async updateVerification(verificationId, updateData) {
    return Verification.findByIdAndUpdate(verificationId, updateData, { new: true });
  }

  async getVerificationByPaymentReference(paymentReference) {
    return Verification.findOne({ payment_reference: paymentReference })
      .populate('user', 'username email role')
      .populate('documents');
  }

  async getVerificationByDocumentId(documentId) {
    const document = await VerificationDocument.findById(documentId);
    if (!document) return null;
    
    return Verification.findById(document.verification)
      .populate('user', 'username email role')
      .populate('documents');
  }
}

module.exports = new VerificationRepository();
