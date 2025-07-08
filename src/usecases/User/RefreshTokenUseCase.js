const { refreshAuthToken } = require('../../misc/services/jwt');
const ApiResponse = require('../../misc/services/api-response');
const BadRequestError = require('../../misc/errors/BadRequestError');


async function RefreshTokenUseCase(req, res) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return ApiResponse.error(res, new BadRequestError('Refresh token is required.'));
    }
    const newTokens = refreshAuthToken(refreshToken);
    if (!newTokens) {
        return ApiResponse.error(res, new BadRequestError('Invalid or expired refresh token.'));
    }
    return ApiResponse.success(res, { ...newTokens, message: 'Token refreshed successfully.' });
}

module.exports = RefreshTokenUseCase;
