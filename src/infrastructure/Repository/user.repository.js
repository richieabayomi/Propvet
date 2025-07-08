const {
  handleAsyncRequest,
  handleResponseFormat,

} = require('../../misc/services/database/format');

const User = require('../../domain/entities/user');


class UserRepository {
  async createUser(data) {
    return handleResponseFormat(await handleAsyncRequest(User.create(data)));
  }

  async findUser(filter) {
    return handleResponseFormat(await handleAsyncRequest(User.findOne({ ...filter, deleted: false })));
  }

  getUserById(id) {
    return this.findUser({ _id: id });
  }

  getUserByUsername(username) {
    return this.findUser({ username });
  }

  getUserByEmail(email) {
    return this.findUser({ email });
  }

  async getAllUsers(filter = {}, page = 1, limit = 10) {
    filter.deleted = false;
    const skip = (page - 1) * limit;

    const result = await handleAsyncRequest(User.find(filter).skip(skip).limit(limit));
    if (!Array.isArray(result)) return [];

    return result.map(data => handleResponseFormat(data));
  }

  async updateUserByFilter(filter, updates) {
    return handleResponseFormat(await handleAsyncRequest(
      User.findOneAndUpdate(filter, updates, { new: true })
    ));
  }

  updateUser(id, updates) {
    return this.updateUserByFilter({ _id: id, deleted: false }, updates);
  }

  deleteUser(id) {
    return this.updateUserByFilter({ _id: id }, { deleted: true });
  }

  restoreUser(id) {
    return this.updateUserByFilter({ _id: id }, { deleted: false });
  }

  async updateUserProfile(userId, updates) {
    // Only allow certain fields to be updated
    const allowedFields = ['email', 'phone_number', 'first_name', 'last_name', 'middle_name'];
    const updateData = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key];
      }
    }
    return this.updateUser(userId, updateData);
  }

  async setUserStatus(userId, status) {
    // status: 'ACTIVE', 'DISABLED', etc.
    return this.updateUser(userId, { status });
  }
}

module.exports = UserRepository;

