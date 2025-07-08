const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { isValidMongoId } = require('../../misc/services/validator');
const BadRequestError = require('../../misc/errors/BadRequestError');

const allowedStatuses = ['PENDING', 'VERIFIED', 'REQUIRES_CLARIFICATION'];

class UpdateDocumentStatusUseCase {
  async execute({ documentId, status }) {
    if (!documentId || !isValidMongoId(documentId)) {
      throw new BadRequestError('A valid documentId is required.');
    }
    if (!status || !allowedStatuses.includes(status)) {
      throw new BadRequestError('Status must be one of: ' + allowedStatuses.join(', '));
    }
    return verificationRepository.updateDocumentStatus(documentId, status);
  }
}

module.exports = UpdateDocumentStatusUseCase;
