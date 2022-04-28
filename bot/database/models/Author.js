const { Schema, model } = require('mongoose');

const authorSchema = Schema({
    authorID: String,
    authorName: String,
    songsPlayed: Number,
    commandsUsed: Number,
    voted: Boolean,
    votedTimes: Number,
    votedConst: Boolean,
    lastVoted: String,
});

module.exports = model('Author', authorSchema);