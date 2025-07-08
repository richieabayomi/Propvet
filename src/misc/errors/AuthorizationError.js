module.exports = class AuthorizationError extends Error {
  statusCode = 403;
  language = 'en';
  name = 'AUTHORIZATION_ERROR';

  constructor(message, language) {
    super(message || 'Access Denied');
    this.language = language || 'en';
  }
}
