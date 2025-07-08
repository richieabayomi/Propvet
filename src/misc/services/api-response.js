const AuthenticationError = require('../errors/AuthenticationError');
const AuthorizationError = require('../errors/AuthorizationError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictRequestError = require('../errors/ConflictRequestError');
const NotFoundError = require('../errors/NotFoundError');
const InternalServerError = require('../errors/InternalServerError');
const RunTimeExceptionError = require('../errors/RunTimeExceptionError');

const errorInstance  = [
    AuthenticationError,
    AuthorizationError,
    BadRequestError,
    ConflictRequestError,
    NotFoundError,
    InternalServerError,
    RunTimeExceptionError,
];

module.exports.ok = function (res, payload = null, statusCode = 200) {
    const response = {
        code: statusCode,
        status: 'ok',
    };

    if (payload && (Array.isArray(payload) || Object.keys(payload).length > 0)) {
        response.data = payload;
    }

    return res.status(statusCode).json(response);
};

module.exports.error = function (res, error) {
    const errorType = errorInstance.find(e => error instanceof e);

    const statusCode = errorType
        ? (error.statusCode === 523 ? 500 : error.statusCode)
        : 500;

    const statusName = errorType
        ? error.name
        : 'INTERNAL_SERVER_ERROR';

    const message = errorType
        ? (error.statusCode === 523
            ? 'Runtime Exception! Internal Server Error'
            : error.message)
        : 'Oops! Try again later';

    // Development / Test environment logging
    if (['test', 'development'].includes(process.env.NODE_ENV)) {
        if (error.statusCode === 523 && process.env.NODE_ENV === 'development') {
            console.debug('\nDEBUG ERROR', JSON.stringify(error));
        } else {
            // TODO: Replace with a proper logger later
            console.error(error);
        }
    }

    return res.status(statusCode).json({
        code: statusCode,
        error: statusName,
        status: 'error',
        msg: message,
    });
};
