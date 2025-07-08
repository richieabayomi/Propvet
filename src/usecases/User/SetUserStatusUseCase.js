const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const { isValidMongoId } = require('../../misc/services/validator');

const userRepository = new UserRepository();

class SetUserStatusUseCase {
  async execute({ userId, status }) {
    if (!userId || !isValidMongoId(userId)) {
      throw new BadRequestError('A valid userId is required.');
    }
    const allowedStatuses = ['ACTIVE', 'DISABLED'];
    if (!status || !allowedStatuses.includes(status)) {
      throw new BadRequestError('Status must be one of: ' + allowedStatuses.join(', '));
    }
    return userRepository.setUserStatus(userId, status);
  }
}

module.exports = SetUserStatusUseCase;
