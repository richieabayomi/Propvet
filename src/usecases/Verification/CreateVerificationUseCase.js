const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { isValidMongoId } = require('../../misc/services/validator');
const BadRequestError = require('../../misc/errors/BadRequestError');
const { isString } = require('../../misc/services/data-types');

class CreateVerificationUseCase {
  async execute({ userId, address, state }) {
    if (!userId || !isValidMongoId(userId)) {
      throw new BadRequestError('A valid userId is required.');
    }
    if (!address || !isString(address)) {
      throw new BadRequestError('Address is required and must be a string.');
    }
    if (!state || !isString(state)) {
      throw new BadRequestError('State is required and must be a string.');
    }
    return verificationRepository.createVerification({ user: userId, address, state });
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
