const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerificationPriceSchema = new Schema({
  type: { type: String, enum: ['EXPRESS', 'NORMAL'], required: true, unique: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('VerificationPrice', VerificationPriceSchema);
