const { Schema, model } = require('mongoose');

const giveawaySchema = Schema({
	messageID: String,
	channelID: String,
	guildID: String,
	dataInicio: Number,
	dataFim: Number,
	finalizado: Boolean,
	contadorGanhadores: Number,
	ganhadores: Array,
	premio: String,
	criadoPor: String,
	mensagens: Schema.Types.Mixed,
});

module.exports = model('Giveaway', giveawaySchema);