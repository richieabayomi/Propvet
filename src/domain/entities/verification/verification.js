const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PENDING', 'REQUIRES_CLARIFICATION', 'VERIFIED'], default: 'PENDING' },
  documents: [{ type: Schema.Types.ObjectId, ref: 'VerificationDocument' }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Verification', VerificationSchema);
