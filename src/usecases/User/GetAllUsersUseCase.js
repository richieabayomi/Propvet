const UserRepository = require('../../infrastructure/Repository/user.repository');
const { isInteger } = require('../../misc/services/data-types');
const BadRequestError = require('../../misc/errors/BadRequestError');

const userRepository = new UserRepository();

class GetAllUsersUseCase {
  async execute({ page = 1, limit = 10, filters = {} }) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (!isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestError('Page must be a positive integer.');
    }
    if (!isInteger(parsedLimit) || parsedLimit < 1) {
      throw new BadRequestError('Limit must be a positive integer.');
    }
    return await userRepository.getAllUsers(filters, parsedPage, parsedLimit);
  }
}

module.exports = GetAllUsersUseCase;
