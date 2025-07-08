const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const AuthenticationError = require('../../misc/errors/AuthenticationError');
const { signAuthToken } = require('../../misc/services/jwt');
const { isString, isEmail } = require('../../misc/services/data-types');

const userRepository = new UserRepository();

class LoginUserUseCase {
  async execute({ email, password }) {
    if (!email || !isString(email)) {
      throw new BadRequestError("A valid email is required.");
    }
    if (!password || !isString(password)) {
      throw new BadRequestError("Password is required and must be a string.");
    }

    const user = await userRepository.getUserByEmail(email);
    if (!user || user.deleted || user.status !== 'ACTIVE') {
      throw new AuthenticationError("Invalid credentials or inactive account.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AuthenticationError("Invalid credentials.");

    // Update last login timestamp
    await userRepository.updateUser(user.id, {
      last_login_timestamp: new Date()
    });


    const { token,refresh_token,expires_at } = signAuthToken(user);

    delete user.password;
    return { user, token, refresh_token, expires_at  };
  }
}

module.exports = LoginUserUseCase;
