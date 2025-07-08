module.exports = class ConflictRequestError extends Error {
  statusCode = 409;
  language = 'en';
  name = 'CONFLICT_REQUEST_ERROR';

  constructor(message, language) {
    super(message || 'Conflict! This requst has been proceed already');
    this.language = language || 'en';
  }
}
