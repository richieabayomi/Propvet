const CreateUserUseCase = require('../usecases/User/CreateUserUseCase');
const LoginUserUseCase = require('../usecases/User/LoginUserUseCase');
const ForgotPasswordUseCase = require('../usecases/User/ForgotPasswordUseCase');
const ResetPasswordUseCase = require('../usecases/User/ResetPasswordUseCase');
const UpdatePasswordUseCase = require('../usecases/User/UpdatePasswordUseCase');
const GetAllUsersUseCase = require('../usecases/User/GetAllUsersUseCase');
const GetUserByIdUseCase = require('../usecases/User/GetUserByIdUseCase');
const RefreshTokenUseCase = require('../usecases/User/RefreshTokenUseCase');
const UpdateUserProfileUseCase = require('../usecases/User/UpdateUserProfileUseCase');
const SetUserStatusUseCase = require('../usecases/User/SetUserStatusUseCase');

const ApiResponse = require('../misc/services/api-response');

const createUserUseCase = new CreateUserUseCase();
const loginUserUseCase = new LoginUserUseCase();
const forgotPasswordUseCase = new ForgotPasswordUseCase();
const resetPasswordUseCase = new ResetPasswordUseCase();
const updatePasswordUseCase = new UpdatePasswordUseCase();
const getAllUsersUseCase = new GetAllUsersUseCase();
const getUserByIdUseCase = new GetUserByIdUseCase();
const updateUserProfileUseCase = new UpdateUserProfileUseCase();
const setUserStatusUseCase = new SetUserStatusUseCase();

module.exports = {
  async register(req, res) {
    try {
      const user = await createUserUseCase.execute(req.body);
      return ApiResponse.ok(res, { user }, 201);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async login(req, res) {
    try {
      const { user, token, refresh_token, expires_at } = await loginUserUseCase.execute(req.body);
      return ApiResponse.ok(res, { user, token, refresh_token, expires_at });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async forgotPassword(req, res) {
    try {
      const result = await forgotPasswordUseCase.execute(req.body.email);
      return ApiResponse.ok(res, result);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async resetPassword(req, res) {
    try {
      const result = await resetPasswordUseCase.execute(req.body);
      return ApiResponse.ok(res, result);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async updatePassword(req, res) {
    try {
      const result = await updatePasswordUseCase.execute({
        userId: req.currentUser.id,
        current_password: req.body.current_password,
        new_password: req.body.new_password
      });
      return ApiResponse.ok(res, result);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getAllUsers(req, res) {
    try {
      const { page, limit, role, status } = req.query;
      const filters = {};
      if (role) filters.role = role;
      if (status) filters.status = status;

      const users = await getAllUsersUseCase.execute({
        page,
        limit,
        filters
      });

      return ApiResponse.ok(res, { users });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await getUserByIdUseCase.execute(id);
      return ApiResponse.ok(res, { user });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async refreshToken(req, res) {
    try {
      await RefreshTokenUseCase(req, res);
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async updateProfile(req, res) {
    try {
      const updates = req.body;
      const userId = req.currentUser.id;
      const user = await updateUserProfileUseCase.execute({ userId, updates });
      return ApiResponse.ok(res, { user });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  },

  async setUserStatus(req, res) {
    try {
      const { userId, status } = req.body;
      const user = await setUserStatusUseCase.execute({ userId, status });
      return ApiResponse.ok(res, { user });
    } catch (err) {
      return ApiResponse.error(res, err);
    }
  }
};
