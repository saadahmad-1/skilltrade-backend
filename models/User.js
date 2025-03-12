const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    fullName: String,
    email: { type: String, required: true, unique: true },
    provider: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
