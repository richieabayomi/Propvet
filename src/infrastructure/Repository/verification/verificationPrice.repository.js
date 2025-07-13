const VerificationPrice = require('../../../domain/entities/verification/verificationPrice');

class VerificationPriceRepository {
  async setPrice(type, price) {
    return VerificationPrice.findOneAndUpdate(
      { type },
      { price },
      { upsert: true, new: true }
    );
  }

  async getPrice(type) {
    return VerificationPrice.findOne({ type });
  }

  async getAllPrices() {
    return VerificationPrice.find();
  }
}

module.exports = new VerificationPriceRepository();