const { Schema, model } = require('mongoose');

const userSchema = Schema({
    userID: String,
    premium: { type: Boolean, default: false },
    premiumSince: String,
    Language: { type: String, default: 'pt-BR' },
    cmdBanned: { type: Boolean, default: false },
});

module.exports = model('Users', userSchema)