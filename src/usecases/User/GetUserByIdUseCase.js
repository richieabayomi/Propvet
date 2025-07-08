const UserRepository = require('../../infrastructure/Repository/user.repository');
const NotFoundError = require('../../misc/errors/NotFoundError');
const BadRequestError = require('../../misc/errors/BadRequestError');
const { isValidMongoId } = require('../../misc/services/validator');

const userRepository = new UserRepository();

class GetUserByIdUseCase {
  async execute(userId) {
    if (!userId || !isValidMongoId(userId)) {
      throw new BadRequestError("A valid User ID is required.");
    }

    const user = await userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found.`);
    }

    // Optionally remove sensitive data like password
    delete user.password;

    return user;
  }
}

module.exports = GetUserByIdUseCase;
