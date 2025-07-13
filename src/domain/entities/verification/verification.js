const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING_PAYMENT', 'PENDING', 'REQUIRES_CLARIFICATION', 'VERIFIED', 'REJECTED'], default: 'PENDING_PAYMENT' },
  documents: [{ type: Schema.Types.ObjectId, ref: 'VerificationDocument' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  address: { type: String, default: '' },
  state: { type: String, default: '' },
  type: { type: String, enum: ['EXPRESS', 'NORMAL'], required: true },
  payment_status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' },
  payment_reference: { type: String, default: '' },
  payment_amount: { type: Number, default: 0 },
  payment_url: { type: String, default: '' },
  payment_access_code: { type: String, default: '' }
});

module.exports = mongoose.model('Verification', VerificationSchema);
