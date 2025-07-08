const bcrypt = require('bcrypt');
const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const NotFoundError = require('../../misc/errors/NotFoundError');
const { isString } = require('../../misc/services/data-types');

const userRepository = new UserRepository();

class UpdatePasswordUseCase {
  async execute({ userId, current_password, new_password }) {
    if (!current_password || !isString(current_password)) {
      throw new BadRequestError("Current password is required and must be a string.");
    }
    if (!new_password || !isString(new_password)) {
      throw new BadRequestError("New password is required and must be a string.");
    }

    const user = await userRepository.getUserById(userId);
    if (!user || user.deleted || user.status === 'DISABLED') {
      throw new NotFoundError("User not found or disabled.");
    }

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) throw new BadRequestError("Current password is incorrect.");

    const hashed = await bcrypt.hash(new_password, 12);

    await userRepository.updateUser(user.id, {
      password: hashed,
      last_password_update_timestamp: new Date()
    });

    return { message: "Password updated successfully." };
  }
}

module.exports = UpdatePasswordUseCase;
