module.exports = class BadRequestError extends Error {
  statusCode = 400;
  language = 'en';
  name = 'BAD_REQUEST_ERROR';

  constructor(message, language) {
    super(message || 'Invalid request');
    this.language = language || 'en';
  }
}
