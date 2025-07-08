module.exports = class PreConditionFailedError extends Error {
  statusCode = 412;
  language = 'en';
  name = 'PRECONDITION_FAILED_ERROR';

  constructor(message, language) {
    super(message || 'PreCondition Failed.');
    this.language = language || 'en';
  }
}
