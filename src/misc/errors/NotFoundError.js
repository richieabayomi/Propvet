module.exports = class NotFoundError extends Error {
  statusCode = 404;
  language = 'en';
  name = 'NOT_FOUND_ERROR';

  constructor(message, language) {
    super(message || 'Resource not found');
    this.language = language || 'en';
  }
}
