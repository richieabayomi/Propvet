const bcrypt = require('bcrypt');
const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const AuthenticationError = require('../../misc/errors/AuthenticationError');
const { isString, isEmail } = require('../../misc/services/data-types');

const userRepository = new UserRepository();

class ResetPasswordUseCase {
  async execute({ email, token, new_password }) {
    if (!email || !isString(email) || !isEmail(email)) {
      throw new BadRequestError("A valid email is required.");
    }
    if (!token || !isString(token)) {
      throw new BadRequestError("A valid token is required.");
    }
    if (!new_password || !isString(new_password)) {
      throw new BadRequestError("A valid new password is required.");
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user || !user.auth_expires_at || user.auth_expires_at < new Date()) {
      throw new AuthenticationError("Token is expired or invalid.");
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    await userRepository.updateUser(user.id, {
      password: hashedPassword,
      auth_expires_at: null,
      last_password_update_timestamp: new Date()
    });

    return { message: "Password reset successfully." };
  }
}

module.exports = ResetPasswordUseCase;
