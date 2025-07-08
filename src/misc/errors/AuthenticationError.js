module.exports = class AuthenticationError extends Error {
  statusCode = 401;
  language = 'en';
  name = 'AUTHENTICATION_ERROR';

  constructor(message, language) {
    super(message || 'Unathorized');
    this.language = language || 'en';
  }
}
