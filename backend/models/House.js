const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  availability: [{ type: Date }]
});

module.exports = mongoose.model('House', houseSchema);