const { Schema, model } = require('mongoose');

const botSchema = Schema({
    clientID: Number,
    clientName: String,
    commandsUsed: Number,
    songsPlayed: Number,
    blacklistedUser: { type: Array, default: [] },
});

module.exports = model('bot', botSchema);