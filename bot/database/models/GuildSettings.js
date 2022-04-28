const { Schema, model } = require('mongoose');

const guildSchema = Schema({
    guildID: String,
    guildName: String,
    prefix: { type: String, default: '!' },
    blacklistCanais: { type: Array },
    MusicDJ: {type: Boolean, default: false },
    roleDJ: { type: String },
    Language: { type: String, default: 'pt-BR'},
    versao: { type: Number, default: '1.2'}
})

module.exports = model('Guild', guildSchema);