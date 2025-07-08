const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { isValidMongoId } = require('../../misc/services/validator');
const BadRequestError = require('../../misc/errors/BadRequestError');

class GetVerificationTimelineUseCase {
  async execute({ verificationId }) {
    if (!verificationId || !isValidMongoId(verificationId)) {
      throw new BadRequestError('A valid verificationId is required.');
    }
    return verificationRepository.getTimelineEvents(verificationId);
  }
}

module.exports = GetVerificationTimelineUseCase;
