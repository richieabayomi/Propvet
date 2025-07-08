const bcrypt = require('bcrypt');
const UserRepository = require('../../infrastructure/Repository/user.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');
const { isString } = require('../../misc/services/data-types');

const userRepository = new UserRepository();

class CreateUserUseCase {
  async execute(data) {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      middle_name,
      phone_number,
      role
    } = data;

    if (!username || !isString(username)) {
      throw new BadRequestError("Username is required and must be a string.");
    }
    if (!email || !isString(email)) {
      throw new BadRequestError("Email is required and must be a string.");
    }
    if (!password || !isString(password)) {
      throw new BadRequestError("Password is required and must be a string.");
    }

    const existingEmail = await userRepository.getUserByEmail(email);
    if (existingEmail) throw new BadRequestError("Email already exists.");

    const existingUsername = await userRepository.getUserByUsername(username);
    if (existingUsername) throw new BadRequestError("Username already exists.");

    const hashedPassword = await bcrypt.hash(password, 12);
    if (!hashedPassword) {
      throw new BadRequestError("Failed to hash password.");
    }

    const allowedRoles = ["USER", "ADMIN", "SUPERADMIN"];
    if (role && (!isString(role) || !allowedRoles.includes(role.toUpperCase()))) {
      throw new BadRequestError("Role must be one of: user, admin, superadmin.");
    }

    const user = await userRepository.createUser({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      middle_name,
      phone_number,
      role: role || "USER",
      permissions: [],
      status: "ACTIVE",
      auth_expires_at: null,
      signed_for_app_auth: new Date(),
      last_password_update_timestamp: new Date(),
      last_login_timestamp: null
    });

    delete user.password;
    return user;
  }
}

module.exports = CreateUserUseCase;
