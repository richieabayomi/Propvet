module.exports = class RunTimeExceptionError extends Error {
    statusCode = 523;
    language = 'en';
    name = 'RUNTIME_EXCEPTION_ERROR';
  
    constructor(message, language) {
      super(message || 'This is an internal run time warning.');
      this.language = language || 'en';
    }
  }
  