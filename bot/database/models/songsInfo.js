const { Schema, model } = require('mongoose');

const songSchema = Schema({
    songID: String,
    type: String,
    songName: String,
    songAuthor: String,
    songDuration: Number,
    timesPlayed: Number,
    timesAdded: Number,
    songThumbnail: String,
});

module.exports = model('songsInfo', songSchema);