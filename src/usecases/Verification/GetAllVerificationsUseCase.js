const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { isInteger, isValidMongoId } = require('../../misc/services/data-types');
const BadRequestError = require('../../misc/errors/BadRequestError');

class GetAllVerificationsUseCase {
  async execute({ page = 1, limit = 10 }) {
    if (!isInteger(page) || page < 1) throw new BadRequestError('Page must be a positive integer.');
    if (!isInteger(limit) || limit < 1) throw new BadRequestError('Limit must be a positive integer.');
    return verificationRepository.getAllVerifications(page, limit);
  }
}

class GetVerificationsByUserIdUseCase {
  async execute({ userId, page = 1, limit = 10 }) {
    if (!userId) throw new BadRequestError('A valid userId is required.');
    if (!isInteger(page) || page < 1) throw new BadRequestError('Page must be a positive integer.');
    if (!isInteger(limit) || limit < 1) throw new BadRequestError('Limit must be a positive integer.');
    return verificationRepository.getVerificationsByUserId(userId, page, limit);
  }
}

module.exports = { GetAllVerificationsUseCase, GetVerificationsByUserIdUseCase };
