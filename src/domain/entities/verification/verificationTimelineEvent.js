const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerificationTimelineEventSchema = new Schema({
  verification: { type: Schema.Types.ObjectId, ref: 'Verification', required: true },
  document: { type: Schema.Types.ObjectId, ref: 'VerificationDocument' },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['STATUS_CHANGE', 'COMMENT'], required: true },
  status: { type: String }, // For status changes
  comment: { type: String }, // For comments
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerificationTimelineEvent', VerificationTimelineEventSchema);
