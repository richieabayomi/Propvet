const verificationRepository = require('../../infrastructure/Repository/verification/verification.repository');
const { isValidMongoId } = require('../../misc/services/validator');
const { isString, isBoolean } = require('../../misc/services/data-types');
const BadRequestError = require('../../misc/errors/BadRequestError');

class AddCommentToDocumentUseCase {
  async execute({ documentId, authorId, content, is_admin }) {
    if (!documentId || !isValidMongoId(documentId)) {
      throw new BadRequestError('A valid documentId is required.');
    }
    if (!authorId || !isValidMongoId(authorId)) {
      throw new BadRequestError('A valid authorId is required.');
    }
    if (!content || !isString(content)) {
      throw new BadRequestError('Comment content is required and must be a string.');
    }
    if (typeof is_admin !== 'boolean' && !isBoolean(is_admin)) {
      throw new BadRequestError('is_admin must be a boolean.');
    }
    return verificationRepository.addCommentToDocument(documentId, { document: documentId, author: authorId, content, is_admin });
  }
}

module.exports = AddCommentToDocumentUseCase;
