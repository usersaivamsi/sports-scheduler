const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, name: String }],
  requiredPlayers: { type: Number, default: 0 },
  dateTime: { type: Date, required: true },
  venue: String,
  status: { type: String, enum: ['active','cancelled','completed'], default: 'active' },
  cancellationReason: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
