const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerificationDocumentSchema = new Schema({
  verification: { type: Schema.Types.ObjectId, ref: 'Verification', required: true },
  name: { type: String, required: true },
  file_url: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'REQUIRES_CLARIFICATION'], default: 'PENDING' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'VerificationComment' }],
  uploaded_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerificationDocument', VerificationDocumentSchema);
