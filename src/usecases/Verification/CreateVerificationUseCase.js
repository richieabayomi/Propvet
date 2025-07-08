const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { isValidMongoId } = require('../../misc/services/validator');
const BadRequestError = require('../../misc/errors/BadRequestError');

class CreateVerificationUseCase {
  async execute({ userId }) {
    if (!userId || !isValidMongoId(userId)) {
      throw new BadRequestError('A valid userId is required.');
    }
    return verificationRepository.createVerification({ user: userId });
  }
}

class GetVerificationWithDetailsUseCase {
  async execute({ verificationId }) {
    if (!verificationId || !isValidMongoId(verificationId)) {
      throw new BadRequestError('A valid verificationId is required.');
    }
    return verificationRepository.getVerificationWithDetails(verificationId);
  }
}

module.exports = { CreateVerificationUseCase, GetVerificationWithDetailsUseCase };
