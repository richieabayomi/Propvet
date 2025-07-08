const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerificationCommentSchema = new Schema({
  document: { type: Schema.Types.ObjectId, ref: 'VerificationDocument', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerificationComment', VerificationCommentSchema);
