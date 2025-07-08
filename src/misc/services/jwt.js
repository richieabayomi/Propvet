const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const InternalServerError = require('../errors/InternalServerError');   
const JWT_SECRET = process.env.JWT_SECRET + '&' + process.env.NODE_ENV;

module.exports.signAuthToken = function signAuthToken(user, expirationInUnixTime) {
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: expirationInUnixTime || '6h' });
    const refresh_token = jwt.sign(user, JWT_SECRET, { expiresIn: expirationInUnixTime || '7d' });
    const expires_at = new Date(Date.now() + (expirationInUnixTime || 6 * 60 * 60 * 1000));
    return { token, refresh_token, expires_at };
}

module.exports.verifySignedAuthToken = function verifySignedAuthToken(token) {
    if (!JWT_SECRET) {
        throw new Error('JwtService has not been initialized with a secret key.');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Failed to verify token:', error.message);
    }
}

module.exports.signUserPassword = function signUserPassword(password) {
    return bcrypt.hashSync(password, 10);
}

module.exports.verifySignedUserPasswordToken = function verifySignedUserPasswordToken(token) {
    if (!JWT_SECRET) {
        throw new Error('JwtService has not been initialized with a secret key.');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error('Failed to verify password token:', error.message);
    }
}

module.exports.comparePassword = function comparePassword(password, hashedPassword) {
    try {
        if (!bcrypt.compareSync(password, hashedPassword)) {
            return false;
        }
        return true;
    } catch (error) {
       console.error('Failed to compare password:', error.message);
    }
}

module.exports.refreshAuthToken = function refreshAuthToken(refreshToken) {
    if (!JWT_SECRET) {
        throw new Error('JwtService has not been initialized with a secret key.');
    }
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRETa);
        const { iat, exp, ...userPayload } = decoded;
        return module.exports.signAuthToken(userPayload);
    } catch (error) {
        console.error('Failed to refresh token:', error.message);
        return null;
    }
}