const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { isValidMongoId } = require('../../misc/services/validator');
const { isString } = require('../../misc/services/data-types');
const BadRequestError = require('../../misc/errors/BadRequestError');

class AddDocumentToVerificationUseCase {
  async execute({ verificationId, name, file_url }) {
    if (!verificationId) {
      throw new BadRequestError('A valid verificationId is required.');
    }
    if (!name || !isString(name)) {
      throw new BadRequestError('Document name is required and must be a string.');
    }
    if (!file_url || !isString(file_url)) {
      throw new BadRequestError('A valid file_url is required.');
    }
    return verificationRepository.addDocumentToVerification(verificationId, { verification: verificationId, name, file_url });
  }
}

module.exports = AddDocumentToVerificationUseCase;
