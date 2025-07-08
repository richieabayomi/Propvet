module.exports = class InternalServerError extends Error {
  statusCode = 500;
  language = 'en';
  name = 'SERVER_ERROR';

  constructor(message, language) {
    super(message || 'Could not completed due to unknown error! Try again later.');
    this.language = language || 'en';
  }
}
