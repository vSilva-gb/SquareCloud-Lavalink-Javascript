module.exports.checkMusic = (member, bot) => {
	// Check that a song is being played
	const player = bot.manager?.players.get(member.guild.id);
	if (!player) return member.guild.translate('misc:NO_QUEUE');

	// Check that user is in the same voice channel
	if (member.voice?.channel?.id !== player.voiceChannel) return member.guild.translate('misc:NOT_VOICE');

	// Check if the member has role to interact with music plugin
	if (member.guild.roles.cache.get(member.guild.settings.MusicDJRole)) {
		if (!member.roles.cache.has(member.guild.settings.MusicDJRole)) {
			return member.guild.translate('misc:MISSING_ROLE');
		}
	}

	return true;
};

module.exports.checkNSFW = (channel) => {
	return channel.nsfw || channel.type == 'DM';
};

module.exports.musicaTocada = async (client, id, title, author, duration, thumbnail) => {
	const { botSchema, songSchema } = require('../database/models');
	botSchema.findOne({
		clientID: client.user.id,
	}, async(err, b) => {
		if (err) this.client.logger.error(err.message)
		b.songsPlayed += 1;
		await b.save().catch(e => this.client.logger.error(e.message));
	})

	songSchema.findOne({
		songID: id,
	}, async (err, s) => {
		if (err) this.client.logger.error(err.message);
		if (!s) {
			const newSong = new songSchema({
				songID: id,
				songName: title,
				songAuthor: author,
				songDuration: duration,
				timesPlayed: 1,
				timesAdded: 0,
				songThumbnail: thumbnail,
			});
			await newSong.save().catch(e => this.client.logger.error(e.message));
		} else {
			s.timesPlayed += 1;
			await s.save().catch(e => this.client.logger.error(e.message));
		}
	})
};

module.exports.comandoUsado = (client, message) => {
	const { botSchema, authorSchema } = require('../database/models');
	botSchema.findOne({ clientID: client.user.id }).then(async b => {
		if (!b) {
			const newClient = new botSchema({
				clientID: client.user.id,
				clientName: client.user.username,
				commandsUsed: 0,
				songsPlayed: 0,
			});
			await newClient.save().catch(e => client.logger.error(e.message));
			b = await botSchema.findOne({ clientID: client.user.id });
		}
		b.commandsUsed += 1;
		b.save().catch(e => client.logger.error(e.message));
	})
	authorSchema.findOne({ authorID: message.author.id || message.user.id }).then(async user => {
		if (!user) {
			const newUser = new authorSchema({
				authorID: message.author.id,
				authorName: message.author.username,
				songsPlayed: 0,
				commandsUsed: 1,
				voted: false,
				votedTimes: 0,
				votedConst: false,
				lastVoted: 'Never',
			});
			await newUser.save().catch(e => client.logger.error(e.message));
			user = await authorSchema.findOne({ authorID: message.author.id });
		}
		user.commandsUsed += 1;
		user.save().catch(e => client.logger.error(e.message));
	});
};

module.exports.comandoUsadoInteraction = (client, interaction) => {
	const { botSchema, authorSchema } = require('../database/models');
	botSchema.findOne({ clientID: client.user.id }).then(async b => {
		if (!b) {
			const newClient = new botSchema({
				clientID: client.user.id,
				clientName: client.user.username,
				commandsUsed: 0,
				songsPlayed: 0,
			});
			await newClient.save().catch(e => client.logger.error(e.message));
			b = await botSchema.findOne({ clientID: client.user.id });
		}
		b.commandsUsed += 1;
		b.save().catch(e => client.logger.error(e.message));
	})
	authorSchema.findOne({ authorID: interaction.user.id }).then(async user => {
		if (!user) {
			const newUser = new authorSchema({
				authorID: interaction.user.id,
				authorName: interaction.user.username,
				songsPlayed: 0,
				commandsUsed: 1,
				voted: false,
				votedTimes: 0,
				votedConst: false,
				lastVoted: 'Never',
			});
			await newUser.save().catch(e => client.logger.error(e.message));
			user = await authorSchema.findOne({ authorID: interaction.user.id });
		}
		user.commandsUsed += 1;
		user.save().catch(e => client.logger.error(e.message));
	});
};

module.exports.genInviteLink = (client) => {
	return client.generateInvite({
		permissions: BigInt(2435902494),
		scopes: ['bot', 'applications.commands'] });
};

module.exports.removerDuplicadas = async (player) => {
	let tracks = player.queue;
	const newtracks = [];
		for (let i = 0; i < tracks.length; i++) {
		  let exists = false;
		  for (let j = 0; j < newtracks.length; j++) {
			if (tracks[i].uri === newtracks[j].uri) {
			  exists = true;
			  break;
			}
		  }
			if (!exists) {
				newtracks.push(tracks[i])
			}
		}
		player.queue.clear();
		for (const track of newtracks)
		player.queue.add(track)
};

module.exports.randomDicas = async () => {
	const dicas = require('../assets/json/dicas.json');
	return dicas[Math.floor(Math.random() * dicas.length)];
}

module.exports.CalcLevenDist = (str1 = '', str2 = '') => {
	const track = Array(str2.length + 1).fill(null).map(() =>
		Array(str1.length + 1).fill(null));
	for (let i = 0; i <= str1.length; i += 1) {
		track[0][i] = i;
	}
	for (let j = 0; j <= str2.length; j += 1) {
		track[j][0] = j;
	}
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1,
				track[j - 1][i] + 1,
				track[j - 1][i - 1] + indicator,
			);
		}
	}
	return track[str2.length][str1.length];
};