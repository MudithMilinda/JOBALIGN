const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // ✅ Name field accepts text and numbers (alphanumeric) - max 100 characters
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);