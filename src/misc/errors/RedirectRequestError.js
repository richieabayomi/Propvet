module.exports = class RedirectRequestError extends Error {
    statusCode = 304;
    language = 'en';
    name = '2FA_TEMPORARY_REDIRECT';
  
    constructor(message, language) {
      super(message || 'Redirect due to 2FA Setup.');
      this.language = language || 'en';
    }
  }