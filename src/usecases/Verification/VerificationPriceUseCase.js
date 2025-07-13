const verificationPriceRepository = require('../../infrastructure/Repository/verification/verificationPrice.repository');
const BadRequestError = require('../../misc/errors/BadRequestError');

class SetVerificationPriceUseCase {
  async execute({ type, price }) {
    if (!type || !['EXPRESS', 'NORMAL'].includes(type)) {
      throw new BadRequestError('Type must be EXPRESS or NORMAL');
    }
    if (typeof price !== 'number' || price <= 0) {
      throw new BadRequestError('Price must be a positive number');
    }
    return verificationPriceRepository.setPrice(type, price);
  }
}

class GetVerificationPriceUseCase {
  async execute({ type }) {
    if (!type || !['EXPRESS', 'NORMAL'].includes(type)) {
      throw new BadRequestError('Type must be EXPRESS or NORMAL');
    }
    return verificationPriceRepository.getPrice(type);
  }
}

class GetAllVerificationPricesUseCase {
  async execute() {
    return verificationPriceRepository.getAllPrices();
  }
}

module.exports = {
  SetVerificationPriceUseCase,
  GetVerificationPriceUseCase,
  GetAllVerificationPricesUseCase
};
