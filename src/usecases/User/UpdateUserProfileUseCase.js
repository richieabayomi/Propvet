const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const { isString } = require('../../misc/services/data-types');
const { isValidMongoId } = require('../../misc/services/validator');

const userRepository = new UserRepository();

class UpdateUserProfileUseCase {
  async execute({ userId, updates }) {
    if (!userId || !isValidMongoId(userId)) {
      throw new BadRequestError('A valid userId is required.');
    }
    if (!updates || typeof updates !== 'object') {
      throw new BadRequestError('Updates must be an object.');
    }
    // Optionally validate fields (e.g., email format, phone format)
    if (updates.email && !isString(updates.email)) {
      throw new BadRequestError('Email must be a string.');
    }
    if (updates.phone_number && !isString(updates.phone_number)) {
      throw new BadRequestError('Phone number must be a string.');
    }
    return userRepository.updateUserProfile(userId, updates);
  }
}

module.exports = UpdateUserProfileUseCase;
